  import { Component, OnInit } from '@angular/core';

  @Component({
    standalone: false,
    selector: 'app-ventas',
    templateUrl: './ventas.page.html',
    styleUrls: ['./ventas.page.scss'],
  })
  export class VentasPage implements OnInit {

    modalAbierto = false;
    busqueda: string = '';
    fechaSeleccionada: string = '';
    showCalendar: boolean = false;
    filtroFecha: 'dia' | 'semana' | 'mes' | 'ninguno' = 'ninguno';

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

  filtrarVentas() {
    const query = this.busqueda.toLowerCase();

    this.ventasFiltradas = this.ventas.filter((venta) => {
      const matchBusqueda =
        !query ||
        Object.values(venta).some((val) =>
          val.toString().toLowerCase().includes(query)
        );

      if (!this.fechaSeleccionada || this.filtroFecha === 'ninguno') {
        return matchBusqueda;
      }

      const fechaVenta = new Date(venta.fecha);
      const fechaFiltro = new Date(this.fechaSeleccionada);

      const matchFecha = {
        dia: fechaVenta.toDateString() === fechaFiltro.toDateString(),
        semana: this.enMismaSemana(fechaVenta, fechaFiltro),
        mes:
          fechaVenta.getMonth() === fechaFiltro.getMonth() &&
          fechaVenta.getFullYear() === fechaFiltro.getFullYear(),
      }[this.filtroFecha];

      return matchBusqueda && matchFecha;
    });
  }

  enMismaSemana(fecha1: Date, fecha2: Date): boolean {
    const inicioSemana = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(date.setDate(diff));
    };

    const inicio1 = inicioSemana(fecha1);
    const inicio2 = inicioSemana(fecha2);

    return (
      inicio1.toDateString() === inicio2.toDateString() &&
      fecha1.getFullYear() === fecha2.getFullYear()
    );
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  onFechaChange(event: any) {
    this.fechaSeleccionada = event.detail.value;
    this.filtrarVentas();
  }

  ngOnInit() {
    this.ventasFiltradas = [...this.ventas];
  }

}
