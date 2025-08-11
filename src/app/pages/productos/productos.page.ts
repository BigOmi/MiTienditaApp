import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CategoriesService } from 'src/app/services/categories.service';
import { ProductsService } from 'src/app/services/products.service';

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
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
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
  }

  async guardarCambios() {
    if (this.editForm.invalid || this.productoEditandoId === null) return;

    const formValues = this.editForm.value;
    const productoOriginal = this.productos.find(p => p.id === this.productoEditandoId);

    const payload = {
      nombre: formValues.nombre,
      descripcion: formValues.descripcion,
      imagen: formValues.imagen,
      precio_venta: formValues.precioVenta,
      precio_compra: productoOriginal?.precioCompra ?? 0,
      stock_actual: productoOriginal?.stock ?? 0,
      activo: formValues.activo,
      categoriaId: formValues.categoria
    };

    try {
      await firstValueFrom(this.productS.editarProducto(this.productoEditandoId, payload));
      alert('Producto actualizado');
      this.cancelarEdicion();
      await this.cargarProductos();
    } catch (error) {
      console.error('Error actualizando producto:', error);
      alert('Error al actualizar el producto');
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
