import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CategoriesService } from 'src/app/services/categories.service';
import { ProductsService } from 'src/app/services/products.service';
import { MenuController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {

  buscarproduct = '';
  estadoFiltro: string = 'todos';
  categoriaSeleccionada: number | 'Todos' = 'Todos';

  productos: any[] = [];
  categorias: any[] = [];

  editForm!: FormGroup;
  productoEditandoId: number | null = null;

  constructor(
    private router: Router,
    private productS: ProductsService,
    private categoryS: CategoriesService,
    private fb: FormBuilder,
    private menuCtrl: MenuController
  ) {}

  async ngOnInit() {
    // Cierra el menú si estuviera abierto para evitar overlays/inert sobre el contenido
    try { await this.menuCtrl.close('main-menu'); } catch {}
    this.initForm();
    await this.cargarCategorias();
    await this.cargarProductos();
  }

  initForm() {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      imagen: [''],
      precioCompra: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      activo: [true]
    });
  }

  async cargarCategorias() {
    try {
      const response: any = await firstValueFrom(this.categoryS.obtenerCategorias());
      this.categorias = response;
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }

  async cargarProductos() {
    try {
      const response: any = await firstValueFrom(this.productS.obtenerProductos());
      this.productos = (response || []).map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        imagen: p.imagen,
        precioVenta: parseFloat(p.precio_venta),
        precioCompra: parseFloat(p.precio_compra),
        stock: p.stock_actual,
        activo: p.activo,
        categoria: p.categoria
      }));
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }

  get productosFiltrados() {
    return this.productos.filter(p => {
      const coincideBusqueda =
        p.nombre?.toLowerCase().includes(this.buscarproduct.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(this.buscarproduct.toLowerCase());

      const coincideEstado =
        this.estadoFiltro === 'todos' ||
        (this.estadoFiltro === 'activos' && p.activo) ||
        (this.estadoFiltro === 'inactivos' && !p.activo);

      const coincideCategoria =
        this.categoriaSeleccionada === 'Todos' ||
        p.categoria?.id === this.categoriaSeleccionada;

      return coincideBusqueda && coincideEstado && coincideCategoria;
    });
  }

  navNewCompra() {
    this.router.navigateByUrl('/new-compra');
  }

  editarProducto(producto: any) {
    this.productoEditandoId = producto.id;
    this.editForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen: producto.imagen,
      precioCompra: producto.precioCompra,
      precioVenta: producto.precioVenta,
      stock: producto.stock,
      categoria: producto.categoria?.id,
      activo: producto.activo
    });

    setTimeout(() => {
      const elemento = document.getElementById(`producto-${producto.id}`);
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  cancelarEdicion() {
  this.editForm.reset();
  this.productoEditandoId = null;
  this.router.navigateByUrl('/home/productos');
  }

  async guardarCambios() {

    if (this.editForm.invalid || this.productoEditandoId === null) return;

    // Validar que el producto existe
    const productoOriginal = this.productos.find(p => p.id === this.productoEditandoId);
    if (!productoOriginal) {
      alert('El producto que intentas editar no existe.');
      return;
    }

    const formValues = this.editForm.value;
    // Validar que la categoría existe
    const categoriaIdNum = Number(formValues.categoria);
    if (!categoriaIdNum || Number.isNaN(categoriaIdNum) || !this.categorias.some(c => c.id === categoriaIdNum)) {
      alert('Selecciona una categoría válida.');
      return;
    }

    // Coerción a tipos esperados por el backend usando valores EDITADOS
    const payload: any = {
      nombre: formValues.nombre,
      descripcion: formValues.descripcion,
      imagen: formValues.imagen,
      precio_compra: Number(formValues.precioCompra ?? productoOriginal?.precioCompra ?? 0),
      precio_venta: Number(formValues.precioVenta ?? productoOriginal?.precioVenta ?? 0),
      stock_actual: Number(formValues.stock ?? productoOriginal?.stock ?? 0),
      categoriaId: categoriaIdNum
    };
    // Solo agregar 'activo' si el usuario lo editó (opcional en el DTO)
    if (typeof formValues.activo === 'boolean') {
      payload.activo = formValues.activo;
    }
    // Eliminar campos vacíos o nulos y limpiar cualquier campo extra
    const allowedFields = ['nombre','descripcion','imagen','precio_compra','precio_venta','stock_actual','categoriaId','activo'];
    Object.keys(payload).forEach(key => {
      if (payload[key] === null || payload[key] === undefined || payload[key] === '' || !allowedFields.includes(key)) {
        delete payload[key];
      }
    });

    try {
      console.log('Actualizando producto', this.productoEditandoId, 'con payload:', payload);
      await firstValueFrom(this.productS.editarProducto(this.productoEditandoId, payload));
      alert('Producto actualizado');
      this.router.navigateByUrl('/home/productos');
    } catch (error) {
      let backendMsg = '';
      try {
        const err: any = error as any;
        console.error('Error actualizando producto:', err, 'backend says:', err?.error);
        if (err?.error?.message) {
          if (Array.isArray(err.error.message)) {
            backendMsg = err.error.message.join('\n');
          } else {
            backendMsg = err.error.message;
          }
        }
      } catch {
        console.error('Error actualizando producto:', error);
      }
      alert('Error al actualizar el producto.' + (backendMsg ? ('\n' + backendMsg) : ''));
    }
  }

  async eliminarProducto(id: number) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await firstValueFrom(this.productS.eliminarProducto(id));
      this.productos = this.productos.filter(p => p.id !== id);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar producto');
    }
  }

  getNombreCategoria(id: number): string {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'Sin categoría';
  }
}
