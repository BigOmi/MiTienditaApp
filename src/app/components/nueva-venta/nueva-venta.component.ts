import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
  AbstractControl
} from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { ProductsService } from 'src/app/services/products.service';
import { SalesService } from 'src/app/services/sales.service';
import { UsersService } from 'src/app/services/users.service'; // <<--- 1. Importa UsersService
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';



interface Producto {
  id: number;
  nombre: string;
  precio_venta: number;
  stock_actual: number;
}

const MetodoPago = {
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia'
};

const EstadoVenta = {
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
};

@Component({
  selector: 'app-nueva-venta',
  templateUrl: './nueva-venta.component.html',
  styleUrls: ['./nueva-venta.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, FormsModule]
})
export class NuevaVentaComponent implements OnInit {

  productos: Producto[] = [];
  productosFiltradosGlobal: Producto[] = [];
  textoBusqueda = '';

  descuentoCalculado = 0;

  ventaForm = this.fb.group({
    metodo_pago: [MetodoPago.EFECTIVO, Validators.required],
    detalles: this.fb.array([], Validators.required)
  });

  get detalles(): FormArray {
    return this.ventaForm.get('detalles') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private productsService: ProductsService,
    private salesService: SalesService,
    private http: HttpClient,
    private usersService: UsersService // <<--- 2. Inyecta UsersService
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productsService.obtenerProductos().subscribe({
      next: data => {
        this.productos = data;
        this.productosFiltradosGlobal = [];
      },
      error: err => {
        console.error('Error al cargar productos', err);
      }
    });
  }

  filtrarProductosGlobal() {
    const texto = this.textoBusqueda.trim().toLowerCase();
    if (texto.length === 0) {
      this.productosFiltradosGlobal = [];
      return;
    }
    this.productosFiltradosGlobal = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(texto) && !this.estaProductoEnDetalles(p.id)
    );
  }

  estaProductoEnDetalles(productoId: number): boolean {
    return this.detalles.controls.some(d => d.get('productoId')?.value === productoId);
  }

  agregarProducto(producto: Producto) {
    if (this.estaProductoEnDetalles(producto.id)) {
      return;
    }
    this.detalles.push(this.fb.group({
      productoId: [producto.id, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    }));
    this.productosFiltradosGlobal = [];
    this.textoBusqueda = '';
    this.calcularDescuentoEnBack();
  }

  obtenerNombreProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? producto.nombre : 'Producto no encontrado';
  }

  removeDetalle(index: number) {
    this.detalles.removeAt(index);
    this.calcularDescuentoEnBack();
  }

  calcularSubtotal(detalleControl: AbstractControl): number {
    const detalle = detalleControl as FormGroup;
    const prodId = detalle.get('productoId')?.value;
    const cant = detalle.get('cantidad')?.value || 0;
    const producto = this.productos.find(p => p.id === prodId);
    if (!producto) return 0;
    return cant * producto.precio_venta;
  }

  calcularTotal(): number {
    let total = 0;
    this.detalles.controls.forEach(detalle => {
      total += this.calcularSubtotal(detalle);
    });
    return total;
  }

  calcularDescuentoEnBack() {
    const total = this.calcularTotal();
    if (total > 0) {
      this.http.post<{ descuento: number }>(`${environment.apiUrl}/ventas/calcular-descuento`, { total })
        .subscribe({
          next: res => {
            this.descuentoCalculado = res.descuento || 0;
          },
          error: err => {
            console.error('Error al calcular descuento', err);
            this.descuentoCalculado = 0;
          }
        });
    } else {
      this.descuentoCalculado = 0;
    }
  }

  private async showError(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async onSubmit() {
    if (this.ventaForm.invalid || this.detalles.length === 0) {
      this.ventaForm.markAllAsTouched();
      await this.showError('Complete todos los campos y agregue al menos un producto.');
      return;
    }

    // Validar stock (código existente)
    for (const detalleControl of this.detalles.controls) {
      const detalle = detalleControl as FormGroup;
      const productoId = detalle.get('productoId')?.value;
      const cantidad = detalle.get('cantidad')?.value;
      const producto = this.productos.find(p => p.id === productoId);

      if (!producto) {
        await this.showError(`Producto no válido.`);
        return;
      }
      if (cantidad > producto.stock_actual) {
        await this.showError(`Stock insuficiente para ${producto.nombre}.`);
        return;
      }
    }

    // <<--- 3. Obtén el ID del usuario logueado
    const currentUser = this.usersService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
        await this.showError('No se pudo obtener el usuario actual. Por favor, inicie sesión de nuevo.');
        return;
    }
    const usuarioId = currentUser.id;

    const ventaPayload = {
      usuarioId: usuarioId, // <<--- 4. Usa el ID real del usuario
      metodo_pago: this.ventaForm.get('metodo_pago')?.value,
      descuento: this.descuentoCalculado,
      estado: EstadoVenta.COMPLETADA,
      detalles: this.detalles.controls.map(detalleControl => {
        const detalle = detalleControl as FormGroup;
        return {
          productoId: detalle.get('productoId')?.value,
          cantidad: detalle.get('cantidad')?.value
        };
      })
    };

    console.log('Payload a enviar:', ventaPayload);

    this.salesService.crearVenta(ventaPayload).subscribe({
      next: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Éxito',
          message: 'Venta registrada correctamente.',
          buttons: ['OK']
        });
        await alert.present();

        // Reset formulario
        this.ventaForm.reset({ metodo_pago: MetodoPago.EFECTIVO });
        this.detalles.clear();
        this.descuentoCalculado = 0;
        this.textoBusqueda = '';
        this.productosFiltradosGlobal = [];
      },
      error: async (err) => {
        console.error('Error registrando venta', err);
        const errorMessage = err.error?.message || 'Error desconocido al registrar la venta.';
        await this.showError(errorMessage);
      }
    });
  }
}
