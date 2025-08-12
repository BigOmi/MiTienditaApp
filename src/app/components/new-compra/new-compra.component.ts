import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { CompraService } from 'src/app/services/compra.service';
import { ProductsService } from 'src/app/services/products.service';
import { UsersService } from 'src/app/services/users.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-new-compra',
  templateUrl: './new-compra.component.html',
  styleUrls: ['./new-compra.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NewCompraComponent implements OnInit {
  compraForm!: FormGroup;
  proveedores: any[] = [];
  categorias: any[] = [];
  loading = false;
  private PREFIJO_KEY = 'compra_prefijo_factura';

  constructor(
    private fb: FormBuilder,
    private compraService: CompraService,
    private productsService: ProductsService,
    private proveedoresService: ProveedoresService,
    private categoriasService: CategoriesService,
    private usersService: UsersService,
    private alertController: AlertController,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.compraForm = this.fb.group({
      // Datos compra
      autoFactura: [true],
      prefijoFactura: [this.leerPrefijoGuardado() || 'F-'],
      recordarPrefijo: [true],
      fecha: [new Date().toISOString()],
      numero_factura: ['', Validators.required],
      proveedor_id: [null, Validators.required],
      estado: ['pendiente', Validators.required],
      observaciones: [''],

      // Datos producto
      nombre: ['', Validators.required],
      descripcion: [''],
      imagen: [''],
      precio_compra: [null, [Validators.required, Validators.min(0.01)]],
      precio_venta: [null, [Validators.required, Validators.min(0.01)]],
      stock_actual: [null, [Validators.required, Validators.min(1)]], // Cantidad a comprar
      categoriaId: [null, Validators.required],
    });

    // Generar número de factura al iniciar si está activado
    if (this.compraForm.get('autoFactura')?.value) {
      this.compraForm.get('numero_factura')?.setValue(this.generarNumeroFactura());
    }
    // Reaccionar al toggle
    this.compraForm.get('autoFactura')?.valueChanges.subscribe((auto: boolean) => {
      if (auto) {
        this.compraForm.get('numero_factura')?.setValue(this.generarNumeroFactura());
      } else {
        // Habilitar edición manual manteniendo valor actual
        const current = this.compraForm.get('numero_factura')?.value || '';
        this.compraForm.get('numero_factura')?.setValue(current);
      }
    });

    // Cambios de prefijo: regenerar si está autoFactura y persistir si recordarPrefijo
    this.compraForm.get('prefijoFactura')?.valueChanges.subscribe(() => {
      if (this.compraForm.get('autoFactura')?.value) {
        this.compraForm.get('numero_factura')?.setValue(this.generarNumeroFactura());
      }
      this.persistirPrefijoSiCorresponde();
    });
    this.compraForm.get('recordarPrefijo')?.valueChanges.subscribe(() => {
      this.persistirPrefijoSiCorresponde();
    });

    // UX: sugerir precio de venta con 30% de margen si está vacío
    this.compraForm.get('precio_compra')?.valueChanges.subscribe((val) => {
      const compra = Number(val) || 0;
      const ventaCtrl = this.compraForm.get('precio_venta');
      if (ventaCtrl && (!ventaCtrl.value || Number(ventaCtrl.value) === 0) && compra > 0) {
        const sugerido = +(compra * 1.3).toFixed(2);
        ventaCtrl.setValue(sugerido, { emitEvent: false });
      }
    });

    // Coerción: asegurar enteros/decimales válidos
    this.compraForm.get('stock_actual')?.valueChanges.subscribe((val) => {
      const n = Math.max(1, Math.floor(Number(val) || 0));
      if (val !== n) this.compraForm.get('stock_actual')?.setValue(n, { emitEvent: false });
    });
    ['precio_compra', 'precio_venta'].forEach(ctrlName => {
      this.compraForm.get(ctrlName)?.valueChanges.subscribe((val) => {
        const n = Math.max(0, Number(val) || 0);
        const fixed = n > 0 ? +n.toFixed(2) : n;
        if (val !== fixed) this.compraForm.get(ctrlName)?.setValue(fixed, { emitEvent: false });
      });
    });

    this.proveedoresService.getProveedores().subscribe({
      next: data => {
        this.proveedores = data;
        // Autocompletar observaciones cuando cambia proveedor o fecha
        this.compraForm.get('proveedor_id')?.valueChanges.subscribe(() => this.autocompletarObservaciones());
        this.autocompletarObservaciones();
      },
      error: err => console.error(err)
    });

    this.categoriasService.obtenerCategorias().subscribe({
      next: data => this.categorias = data,
      error: err => console.error(err)
    });
  }

  get total() {
    const cantidad = this.compraForm.get('stock_actual')?.value || 0;
    const precio = this.compraForm.get('precio_compra')?.value || 0;
    return cantidad * precio;
  }

  async crearCompraCompleta() {
    if (this.compraForm.invalid) {
      this.notification.error('Por favor completa todos los campos obligatorios.');
      this.mostrarAlerta('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    this.loading = true;
    try {
      // Si autoFactura está activo, asegurar número actualizado
      if (this.compraForm.get('autoFactura')?.value && !this.compraForm.get('numero_factura')?.value) {
        this.compraForm.get('numero_factura')?.setValue(this.generarNumeroFactura());
      }
      // 1. Crear producto
      const productoPayload = {
        nombre: this.compraForm.value.nombre,
        descripcion: this.compraForm.value.descripcion,
        imagen: this.compraForm.value.imagen,
        precio_compra: Number(this.compraForm.value.precio_compra),
        precio_venta: Number(this.compraForm.value.precio_venta),
        stock_actual: Number(this.compraForm.value.stock_actual),
        categoriaId: this.compraForm.value.categoriaId,
      };
      const productoCreado = await this.productsService.crearProducto(productoPayload).toPromise();

      // 2. Crear compra
      const usuario = this.usersService.getCurrentUser();
      const compraPayload = {
        numero_factura: this.compraForm.value.numero_factura,
        proveedor_id: this.compraForm.value.proveedor_id,
        usuario_id: usuario?.id || usuario?._id || usuario?.usuario_id,
        total: this.total,
        fecha: this.compraForm.value.fecha,
        estado: this.compraForm.value.estado,
        observaciones: this.compraForm.value.observaciones,
      };
      const compraCreada = await this.compraService.crearCompra(compraPayload).toPromise();

      // 3. Crear detalle compra - IDs planos y camelCase
      const detallePayload = {
        compraId: compraCreada.data.id,
        productoId: productoCreado.id,
        cantidad: this.compraForm.value.stock_actual,
        precioUnitario: productoCreado.precio_compra,
        subtotal: this.total,
      };

      console.log('Detalle a enviar:', detallePayload);

      await this.compraService.crearDetalleCompra(detallePayload).toPromise();

      this.notification.success('Compra completa registrada correctamente.');
      await this.mostrarAlerta('Éxito', 'Compra completa registrada correctamente.');
      this.compraForm.reset({ estado: 'pendiente' });
    } catch (error) {
      console.error('Error creando compra completa', error);
      this.notification.error('No se pudo registrar la compra completa.');
      await this.mostrarAlerta('Error', 'No se pudo registrar la compra completa.');
    } finally {
      this.loading = false;
    }
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  cancelar() {
    try {
      this.compraForm.reset({ estado: 'pendiente' });
    } catch {}
    this.router.navigateByUrl('/home/productos');
  }

  regenerarFactura() {
    this.compraForm.get('numero_factura')?.setValue(this.generarNumeroFactura());
  }

  private generarNumeroFactura(): string {
    const now = new Date(this.compraForm.get('fecha')?.value || new Date());
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const pref = (this.compraForm.get('prefijoFactura')?.value || 'F-').toString();
    // Formato: <PREF>-YYYYMMDD-HHMMSS-XYZ
    return `${pref}${yyyy}${mm}${dd}-${hh}${mi}${ss}-${rand}`;
  }

  onFechaChange(ev: CustomEvent) {
    const val = (ev.detail as any).value;
    this.compraForm.get('fecha')?.setValue(val);
    if (this.compraForm.get('autoFactura')?.value) {
      this.compraForm.get('numero_factura')?.setValue(this.generarNumeroFactura());
    }
    this.autocompletarObservaciones();
  }

  private autocompletarObservaciones() {
    const provId = this.compraForm.get('proveedor_id')?.value;
    const fechaISO = this.compraForm.get('fecha')?.value;
    const fecha = fechaISO ? new Date(fechaISO) : new Date();
    const fechaTxt = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    const prov = this.proveedores.find(p => p.id === provId || p._id === provId);
    const nombreProv = prov ? `${prov.nombre || ''} ${prov.apellido || ''}`.trim() : 'Proveedor no seleccionado';
    const texto = `Compra rápida - ${nombreProv} - ${fechaTxt}`;
    const obsCtrl = this.compraForm.get('observaciones');
    if (obsCtrl && (!obsCtrl.value || obsCtrl.value.startsWith('Compra rápida'))) {
      obsCtrl.setValue(texto);
    }
  }

  private persistirPrefijoSiCorresponde() {
    const recordar = !!this.compraForm.get('recordarPrefijo')?.value;
    const pref = this.compraForm.get('prefijoFactura')?.value;
    try {
      if (recordar && pref) {
        localStorage.setItem(this.PREFIJO_KEY, String(pref));
      } else {
        localStorage.removeItem(this.PREFIJO_KEY);
      }
    } catch {}
  }

  private leerPrefijoGuardado(): string | null {
    try {
      return localStorage.getItem(this.PREFIJO_KEY);
    } catch {
      return null;
    }
  }
}
