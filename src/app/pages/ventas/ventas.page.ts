// ventas.page.ts
import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-ventas',
  templateUrl: './ventas.page.html',
  styleUrls: ['./ventas.page.scss'],
})
export class VentasPage {
  modalAbierto = false;
  busqueda: string = '';
  fechaSeleccionada: string = '';
  showCalendar: boolean = false;
  filtroFecha: 'dia' | 'semana' | 'mes' | 'ninguno' = 'ninguno';
  semanaSeleccionada: { inicio: string; fin: string } | null = null;

  detalleVenta: any = {
    id: '123456789',
    ventaId: 1,
    productos: [],
    cantidad: 0,
    precio: 0,
    fecha: '2025-07-16',
    hora: '10:00',
    status: 'Completado',
  };

  ventas = [
    { id: 1, cantidad: 8, total: 345, fecha: '2025-07-10', hora: '13:00:00', status: 'Completado', usuario: 'Pedro', metodoPago: 'Mastercard' },
    { id: 2, cantidad: 14, total: 740, fecha: '2025-07-15', hora: '14:00:00', status: 'Completado', usuario: 'Carlos', metodoPago: 'Visa' },
    { id: 3, cantidad: 5, total: 125, fecha: '2025-07-20', hora: '15:00:00', status: 'Completado', usuario: 'Juan', metodoPago: 'Mastercard' },
    { id: 4, cantidad: 8, total: 345, fecha: '2025-07-10', hora: '13:00:00', status: 'Completado', usuario: 'Pedro', metodoPago: 'Mastercard' },
    { id: 5, cantidad: 14, total: 740, fecha: '2025-07-15', hora: '14:00:00', status: 'Completado', usuario: 'Carlos', metodoPago: 'Visa' },
    { id: 6, cantidad: 5, total: 125, fecha: '2025-07-20', hora: '15:00:00', status: 'Completado', usuario: 'Juan', metodoPago: 'Mastercard' },
  ];

  ventasFiltradas = [...this.ventas];

  get totalVendido(): number {
    return this.ventasFiltradas.reduce((acc, venta) => acc + venta.total, 0);
  }

  // Tu lógica de filtrado y búsqueda NO se modifica (como pediste)

  filtrarVentas() {
    const query = this.busqueda.toLowerCase();
    const filtroFecha = this.filtroFecha;
    const fechaSeleccionada = new Date(this.fechaSeleccionada);

    this.ventasFiltradas = this.ventas.filter((venta) => {
      const matchBusqueda = !query ||
        Object.values(venta).some((val) =>
          val.toString().toLowerCase().includes(query)
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

  // CONTROL DEL CALENDARIO (cierre automático al hacer click fuera)
  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  onFechaChange(event: any) {
    this.fechaSeleccionada = event.detail.value;
    this.filtrarVentas();
  }

  // Método para cerrar el calendario si se toca fuera (lo llamamos desde el (click) del ion-content)
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
    const productosPorVenta: { [key: number]: any[] } = {
      1: [
        { nombre: 'Shampoo Anticaída', cantidad: 2, precio: 85 },
        { nombre: 'Masaje Relajante', cantidad: 1, precio: 250 },
        { nombre: 'Tratamiento Facial', cantidad: 1, precio: 300 }
      ],
      2: [
        { nombre: 'Camisa Casual', cantidad: 2, precio: 180 },
        { nombre: 'Pantalón de Mezclilla', cantidad: 1, precio: 400 },
        { nombre: 'Zapatos de vestir', cantidad: 1, precio: 650 }
      ],
      3: [
        { nombre: 'Manzanas', cantidad: 4, precio: 10 },
        { nombre: 'Plátanos', cantidad: 6, precio: 8 },
        { nombre: 'Sandía', cantidad: 1, precio: 50 }
      ],
      4: [
        { nombre: 'Jabón Artesanal', cantidad: 3, precio: 25 },
        { nombre: 'Aceite Esencial', cantidad: 1, precio: 120 },
        { nombre: 'Toalla de spa', cantidad: 2, precio: 90 }
      ],
      5: [
        { nombre: 'Zapatillas deportivas', cantidad: 2, precio: 500 },
        { nombre: 'Gorra deportiva', cantidad: 1, precio: 120 }
      ],
      6: [
        { nombre: 'Uvas', cantidad: 2, precio: 30 },
        { nombre: 'Kiwi', cantidad: 4, precio: 15 }
      ]
    };

    this.detalleVenta = {
      ...venta,
      productos: productosPorVenta[venta.id] || []
    };

    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  calcularTotal(productos: any[]): number {
    return productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
  }
}
