import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProductsService } from 'src/app/services/products.service';
import { SalesService } from 'src/app/services/sales.service';

@Component({
  standalone: true,
  selector: 'app-ventas',
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './ventas.page.html',
  styleUrls: ['./ventas.page.scss'],
})
export class VentasPage implements OnInit {
  busqueda: string = '';
  fechaSeleccionada: string = '';
  showCalendar: boolean = false;
  filtroFecha: 'dia' | 'semana' | 'mes' | 'ninguno' = 'ninguno';
  semanaSeleccionada: { inicio: string; fin: string } | null = null;

  ventas: any[] = [];
  ventasFiltradas: any[] = [];
  productos: any[] = [];

  // Modal
  modalAbierto = false;
  detalleVenta: any = {
    id: '',
    productos: [],
    cantidad: 0,
    precio: 0,
    fecha: '',
    hora: '',
    status: '',
    usuario: '',
    metodoPago: '',
  };

  constructor(
    private salesService: SalesService,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    // Primero cargo los productos, luego las ventas
    this.productsService.obtenerProductos().subscribe({
      next: (prods) => {
        this.productos = prods;
        this.cargarVentas();
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.cargarVentas();
      },
    });
  }

  cargarVentas() {
    this.salesService.obtenerVentas().subscribe({
      next: (data) => {
        this.ventas = data.map((venta: any) => {
          const fechaHora = venta.createdAt || venta.fecha;
          const fechaObj = fechaHora ? new Date(fechaHora) : null;

          // Arreglo con detalles + info producto
          const detallesConProductos = (venta.detalles || []).map((d: any) => {
            const productoReal = this.productos.find(
  (p) => String(p.id) === String(d.producto_id)
);
            return {
              id: d.id,
              nombre: productoReal ? productoReal.nombre : 'Producto desconocido',
              cantidad: d.cantidad,
              precio: Number(d.precio_unitario) || 0,
            };
          });

          return {
            id: venta.id,
            productosStr: detallesConProductos
              .map((d: any) => `${d.nombre} (${d.cantidad})`)
              .join(', '),
            cantidad: detallesConProductos.reduce(
              (acc: number, item: any) => acc + (item.cantidad || 0),
              0
            ),
            total: Number(venta.total) || 0,
            fecha: fechaObj ? fechaObj.toISOString().split('T')[0] : '',
            hora: fechaObj ? fechaObj.toTimeString().substring(0, 5) : '',
            status: venta.estado,
            usuario: venta.usuario?.nombre || 'Desconocido',
            metodoPago: venta.metodo_pago,
            detalles: detallesConProductos, // <-- Aquí guardas el arreglo completo para modal
          };
        });
        this.ventasFiltradas = [...this.ventas];
      },
      error: (err) => console.error('Error al cargar ventas', err),
    });
  }

  get totalVendido(): number {
    return this.ventasFiltradas.reduce((acc, venta) => acc + venta.total, 0);
  }

  filtrarVentas() {
    const query = this.busqueda.toLowerCase();
    const filtroFecha = this.filtroFecha;
    const fechaSeleccionada = new Date(this.fechaSeleccionada);

    this.ventasFiltradas = this.ventas.filter((venta) => {
      const matchBusqueda =
        !query ||
        Object.values(venta).some((val) =>
          val?.toString().toLowerCase().includes(query)
        );

      if (!this.fechaSeleccionada || filtroFecha === 'ninguno') {
        return matchBusqueda;
      }

      const fechaVenta = new Date(venta.fecha);

      const matchFecha = {
        dia: fechaVenta.toDateString() === fechaSeleccionada.toDateString(),
        semana: this.enMismaSemana(fechaVenta, fechaSeleccionada),
        mes:
          fechaVenta.getMonth() === fechaSeleccionada.getMonth() &&
          fechaVenta.getFullYear() === fechaSeleccionada.getFullYear(),
      }[filtroFecha];

      return matchBusqueda && matchFecha;
    });

    if (filtroFecha === 'semana' && this.fechaSeleccionada) {
      const inicio = this.obtenerInicioSemana(fechaSeleccionada);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 6);

      this.semanaSeleccionada = {
        inicio: inicio.toISOString().split('T')[0],
        fin: fin.toISOString().split('T')[0],
      };
    } else {
      this.semanaSeleccionada = null;
    }
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  onFechaChange(event: any) {
    this.fechaSeleccionada = event.detail.value;
    this.filtrarVentas();
  }

  onContentClick() {
    if (this.showCalendar) {
      this.showCalendar = false;
    }
  }

  enMismaSemana(fecha1: Date, fecha2: Date): boolean {
    const inicio1 = this.obtenerInicioSemana(fecha1);
    const inicio2 = this.obtenerInicioSemana(fecha2);
    return inicio1.toDateString() === inicio2.toDateString();
  }

  obtenerInicioSemana(fecha: Date): Date {
    const date = new Date(fecha);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  verDetalles(venta: any) {
    this.detalleVenta = {
      id: venta.id,
      productos: venta.detalles || [], // Usamos el arreglo completo para el modal
      cantidad: venta.cantidad,
      precio: venta.total,
      fecha: venta.fecha,
      hora: venta.hora,
      status: venta.status,
      usuario: venta.usuario,
      metodoPago: venta.metodoPago,
    };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  calcularTotal(productos: any[]): number {
    if (!productos || productos.length === 0) return 0;
    return productos.reduce(
      (sum, p) => sum + p.cantidad * p.precio,
      0
    );
  }

  // Método para formatear precios y evitar errores en el template
  formatPrecio(valor: any): string {
    const num = Number(valor);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }
}
