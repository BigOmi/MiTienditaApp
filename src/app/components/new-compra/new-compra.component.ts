import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { CompraService } from 'src/app/services/compra.service';
import { ProductsService } from 'src/app/services/products.service';
import { UsersService } from 'src/app/services/users.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { CategoriesService } from 'src/app/services/categories.service';

@Component({
  selector: 'app-new-compra',
  templateUrl: './new-compra.component.html',
  styleUrls: ['./new-compra.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule]
})
export class NewCompraComponent implements OnInit {
  compraForm!: FormGroup;
  proveedores: any[] = [];
  categorias: any[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private compraService: CompraService,
    private productsService: ProductsService,
    private proveedoresService: ProveedoresService,
    private categoriasService: CategoriesService,
    private usersService: UsersService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.compraForm = this.fb.group({
      // Datos compra
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

    this.proveedoresService.getProveedores().subscribe({
      next: data => this.proveedores = data,
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
      this.mostrarAlerta('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    this.loading = true;
    try {
      // 1. Crear producto
      const productoPayload = {
        nombre: this.compraForm.value.nombre,
        descripcion: this.compraForm.value.descripcion,
        imagen: this.compraForm.value.imagen,
        precio_compra: this.compraForm.value.precio_compra,
        precio_venta: this.compraForm.value.precio_venta,
        stock_actual: this.compraForm.value.stock_actual,
        categoriaId: this.compraForm.value.categoriaId,
      };
      const productoCreado = await this.productsService.crearProducto(productoPayload).toPromise();

      // 2. Crear compra
      const usuario = this.usersService.getCurrentUser();
      const compraPayload = {
        numero_factura: this.compraForm.value.numero_factura,
        proveedor_id: this.compraForm.value.proveedor_id,
        usuario_id: usuario?.id,
        total: this.total,
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

      await this.mostrarAlerta('Éxito', 'Compra completa registrada correctamente.');
      this.compraForm.reset({ estado: 'pendiente' });
    } catch (error) {
      console.error('Error creando compra completa', error);
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
}
