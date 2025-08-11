import { Component, OnInit } from '@angular/core';
import { SalesService } from 'src/app/services/sales.service';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  summaryCards = [
    {
      title: 'Vendido este mes',
      value: '$0',
      bgClass: 'bg-tertiary',
      textClass: 'text-light'
    },
    {
      title: 'Vendido hoy',
      value: '$0',
      bgClass: 'bg-success',
      textClass: 'text-light'
    }
  ];

  // Mantengo el chartData para evitar errores en template
  chartData = {
    manufacturers: ['Aliqui', 'Natura', 'Pirum', 'VanArsdel']
  };

  recentSales: { amount: number; status: string }[] = [];

  constructor(private salesService: SalesService) {}

  ngOnInit() {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard() {
    this.salesService.obtenerVentas().subscribe({
      next: (ventas: any[]) => {
        const hoy = new Date();
        const hoyStr = hoy.toISOString().split('T')[0]; // yyyy-mm-dd
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();

        let totalMes = 0;
        let totalHoy = 0;

        const ventasHoy: { amount: number; status: string }[] = [];

        ventas.forEach(venta => {
          const fechaVenta = new Date(venta.createdAt || venta.fecha);

          if (fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === anioActual) {
            totalMes += Number(venta.total) || 0;
          }

          if (fechaVenta.toISOString().split('T')[0] === hoyStr) {
            totalHoy += Number(venta.total) || 0;

            ventasHoy.push({
              amount: Number(venta.total) || 0,
              status: venta.estado || 'Desconocido',
            });
          }
        });

        this.summaryCards = [
          {
            title: 'Vendido este mes',
            value: `$${totalMes.toFixed(2)}`,
            bgClass: 'bg-tertiary',
            textClass: 'text-light'
          },
          {
            title: 'Vendido hoy',
            value: `$${totalHoy.toFixed(2)}`,
            bgClass: 'bg-success',
            textClass: 'text-light'
          }
        ];

        this.recentSales = ventasHoy.sort((a, b) => b.amount - a.amount).slice(0, 5);
      },
      error: (err) => {
        console.error('Error cargando ventas para dashboard', err);
      }
    });
  }

}
