import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
  AbstractControl
} from '@angular/forms';
import { AlertController, IonicModule, NavController } from '@ionic/angular';
import { ProductsService } from 'src/app/services/products.service';
import { SalesService } from 'src/app/services/sales.service';
import { UsersService } from 'src/app/services/users.service'; // <<--- 1. Importa UsersService
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TopbarComponent } from 'src/app/components/topbar/topbar.component';



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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, TopbarComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NuevaVentaComponent implements OnInit {

  productos: Producto[] = [];
  private productosMap: Map<number, Producto> = new Map();
  productosFiltradosGlobal: Producto[] = [];
  textoBusqueda = '';

  descuentoCalculado = 0;
  private descuentoDebounce: any;
  private lastTotalForDiscount = -1;
  subtotales: number[] = [];
  totalSinDescuento = 0;

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
    private usersService: UsersService, // <<--- 2. Inyecta UsersService
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productsService.obtenerProductos().subscribe({
      next: data => {
        this.productos = data;
        // Construir mapa para búsquedas O(1)
        this.productosMap.clear();
        for (const p of this.productos) {
          this.productosMap.set(p.id, p);
        }
        this.productosFiltradosGlobal = [];
        // Recalcular subtotales/total si ya hubiera detalles cargados
        if (this.detalles.length > 0) {
          this.subtotales = new Array(this.detalles.length).fill(0);
          for (let i = 0; i < this.detalles.length; i++) {
            this.recalcularSubtotalPorIndice(i);
          }
          this.recalcularTotal();
        }
        this.cdr.markForCheck();
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
      this.cdr.markForCheck();
      return;
    }
    this.productosFiltradosGlobal = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(texto) && !this.estaProductoEnDetalles(p.id)
    );
    this.cdr.markForCheck();
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
    // Precalcular subtotal de la nueva línea
    const nuevoIndex = this.detalles.length - 1;
    this.recalcularSubtotalPorIndice(nuevoIndex);
    this.recalcularTotal();
    this.productosFiltradosGlobal = [];
    this.textoBusqueda = '';
    this.calcularDescuentoEnBack();
    this.cdr.markForCheck();
  }

  obtenerNombreProducto(productoId: number): string {
    const producto = this.productosMap.get(productoId);
    return producto ? producto.nombre : 'Producto no encontrado';
  }

  removeDetalle(index: number) {
    this.detalles.removeAt(index);
    this.subtotales.splice(index, 1);
    this.recalcularTotal();
    this.calcularDescuentoEnBack();
    this.cdr.markForCheck();
  }

  private recalcularSubtotalPorIndice(index: number) {
    const detalle = this.detalles.at(index) as FormGroup;
    if (!detalle) return;
    const prodId = detalle.get('productoId')?.value;
    const cant = detalle.get('cantidad')?.value || 0;
    const producto = this.productosMap.get(prodId);
    this.subtotales[index] = producto ? cant * producto.precio_venta : 0;
  }

  private recalcularTotal() {
    this.totalSinDescuento = this.subtotales.reduce((acc, n) => acc + (n || 0), 0);
  }

  onCantidadInput(index: number) {
    this.recalcularSubtotalPorIndice(index);
    this.recalcularTotal();
    this.calcularDescuentoEnBack();
    this.cdr.markForCheck();
  }

  calcularTotal(): number {
    return this.totalSinDescuento;
  }

  calcularDescuentoEnBack() {
    const total = this.calcularTotal();
    // Reset si no hay total
    if (total <= 0) {
      this.descuentoCalculado = 0;
      this.lastTotalForDiscount = 0;
      if (this.descuentoDebounce) clearTimeout(this.descuentoDebounce);
      return;
    }

    // Debounce para evitar múltiples llamadas en ráfaga
    if (this.descuentoDebounce) clearTimeout(this.descuentoDebounce);
    this.descuentoDebounce = setTimeout(() => {
      if (total === this.lastTotalForDiscount) return; // evitar llamadas innecesarias
      this.lastTotalForDiscount = total;
      this.http
        .post<{ descuento: number }>(`${environment.apiUrl}/ventas/calcular-descuento`, { total })
        .subscribe({
          next: (res) => {
            this.descuentoCalculado = res.descuento || 0;
          },
          error: (err) => {
            console.error('Error al calcular descuento', err);
            this.descuentoCalculado = 0;
          },
        });
    }, 250);
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
      metodo_pago: String(this.ventaForm.get('metodo_pago')?.value || '').toLowerCase(),
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
        await alert.onDidDismiss();

        // Reset formulario
        this.ventaForm.reset({ metodo_pago: MetodoPago.EFECTIVO });
        this.detalles.clear();
        this.descuentoCalculado = 0;
        this.textoBusqueda = '';
        this.productosFiltradosGlobal = [];

        // Redirigir al dashboard
        this.navCtrl.navigateRoot('/home/dashboard');
      },
      error: async (err) => {
        console.error('Error registrando venta', err);
        const errorMessage = err.error?.message || 'Error desconocido al registrar la venta.';
        await this.showError(errorMessage);
      }
    });
  }

  goBack() {
    // Intenta volver en el stack; si no hay, navega a ventas
    try {
      this.navCtrl.back();
    } catch (e) {
      this.navCtrl.navigateBack('/home/ventas');
    }
  }

  // Optimiza *ngFor para evitar re-renderizados costosos
  trackByIndex(index: number) { return index; }
  trackByProductoId(index: number, item: Producto) { return item.id; }
}
