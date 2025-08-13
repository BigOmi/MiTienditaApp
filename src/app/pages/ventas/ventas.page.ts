import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products.service';
import { SalesService } from 'src/app/services/sales.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.page.html',
  styleUrls: ['./ventas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class VentasPage implements OnInit {
  busqueda: string = '';
  fechaSeleccionada: string = '';
  showCalendar: boolean = false;
  filtroFecha: 'dia' | 'semana' | 'mes' | 'ninguno' = 'ninguno';
  semanaSeleccionada: { inicio: string; fin: string } | null = null;
  desde: string = '';
  hasta: string = '';
  filtroPago: string = '';
  filtroStatus: string = '';

  ventas: any[] = [];
  ventasFiltradas: any[] = [];
  productos: any[] = [];
  loading = true;

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
        this.loading = false;
      },
      error: (err) => { console.error('Error al cargar ventas', err); this.loading = false; },
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

      const matchPago = !this.filtroPago || (venta.metodoPago || '').toLowerCase() === this.filtroPago.toLowerCase();
      const matchStatus = !this.filtroStatus || (venta.status || '').toLowerCase() === this.filtroStatus.toLowerCase();

      // Rango manual cuando filtro es 'ninguno'
      if (filtroFecha === 'ninguno' && (this.desde || this.hasta)) {
        const fv = new Date(venta.fecha);
        const from = this.desde ? new Date(this.desde) : null;
        const to = this.hasta ? new Date(this.hasta) : null;
        const inFrom = !from || fv >= from;
        const inTo = !to || fv <= to;
        return matchBusqueda && matchPago && matchStatus && inFrom && inTo;
      }

      if (!this.fechaSeleccionada || filtroFecha === 'ninguno') {
        return matchBusqueda && matchPago && matchStatus;
      }

      const fechaVenta = new Date(venta.fecha);

      const matchFecha = {
        dia: fechaVenta.toDateString() === fechaSeleccionada.toDateString(),
        semana: this.enMismaSemana(fechaVenta, fechaSeleccionada),
        mes:
          fechaVenta.getMonth() === fechaSeleccionada.getMonth() &&
          fechaVenta.getFullYear() === fechaSeleccionada.getFullYear(),
      }[filtroFecha];

      return matchBusqueda && matchPago && matchStatus && matchFecha;
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

  // Ordenamiento simple por columnas
  ordenarPor(campo: 'id'|'cantidad'|'usuario'|'metodoPago'|'total'|'fecha'|'hora'|'status') {
    this.ventasFiltradas = [...this.ventasFiltradas].sort((a, b) => {
      const va = a[campo];
      const vb = b[campo];
      if (campo === 'total' || campo === 'cantidad') return Number(vb) - Number(va);
      return String(va).localeCompare(String(vb));
    });
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

  statusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('cancel')) return 'badge-danger';
    if (s.includes('pend')) return 'badge-warning';
    return 'badge-success';
  }

  exportarCSV() {
    const headers = ['ID Venta','Cant. Productos','Usuario','Pago','Total','Fecha','Hora','Status'];
    const rows = this.ventasFiltradas.map(v => [
      v.id,
      v.cantidad,
      v.usuario,
      v.metodoPago,
      v.total,
      v.fecha,
      v.hora,
      v.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(val => `"${String(val ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
