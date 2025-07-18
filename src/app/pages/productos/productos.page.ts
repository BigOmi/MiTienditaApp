import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {

    searchText = '';
  categorias: string[] = ['Todos', 'Ropa', 'Electrónica', 'Hogar', 'Juguetes', 'Accesorios'];
  categoriaSeleccionada: string = 'Todos';
  estadoFiltro: string = 'todos';

  productos = [
    {
      nombre: 'Camisa Blanca',
      descripcion: 'Camisa blanca de algodón con botones rojos y cuello detallado.',
      imagen: 'https://storage.googleapis.com/a1aa/image/a61e2847-a2e5-418c-778a-bbda61b03757.jpg',
      precioVenta: 450,
      precioCompra: 300,
      stock: 100,
      categoria: 'Ropa',
      activo: true
    },
    {
      nombre: 'Camisa Azul',
      descripcion: 'Camisa azul formal con diseño moderno.',
      imagen: 'https://via.placeholder.com/100x100.png?text=Camisa+Azul',
      precioVenta: 550,
      precioCompra: 350,
      stock: 25,
      categoria: 'Ropa',
      activo: false
    },
    {
      nombre: 'Laptop HP',
      descripcion: 'Laptop HP con 16GB RAM y SSD.',
      imagen: 'https://via.placeholder.com/100x100.png?text=Laptop+HP',
      precioVenta: 12000,
      precioCompra: 9000,
      stock: 15,
      categoria: 'Tecnología',
      activo: true
    }
  ];

  constructor() {}

  get productosFiltrados() {
    return this.productos.filter(p => {
      const coincideBusqueda =
        p.nombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(this.searchText.toLowerCase());

      const coincideEstado =
        this.estadoFiltro === 'todos' ||
        (this.estadoFiltro === 'activos' && p.activo) ||
        (this.estadoFiltro === 'inactivos' && !p.activo);

      const coincideCategoria =
        this.categoriaSeleccionada === 'Todos' || p.categoria === this.categoriaSeleccionada;

      return coincideBusqueda && coincideEstado && coincideCategoria;
    });
  }

  ngOnInit() {}
}
