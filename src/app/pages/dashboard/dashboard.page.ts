import { Component, OnInit } from '@angular/core';
import { SalesService } from 'src/app/services/sales.service';

// Importa y registra componentes necesarios de Chart.js
import {
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  Tooltip,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Chart } from 'chart.js';


Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Legend,
  Tooltip
);
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {

  summaryCards = [
    { title: 'Vendido este mes', value: '$0', bgClass: 'bg-tertiary', textClass: 'text-light' },
    { title: 'Vendido hoy', value: '$0', bgClass: 'bg-success', textClass: 'text-light' }
  ];

  recentSales: { amount: number; status: string }[] = [];

  // Configuración inicial del gráfico
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Ventas por mes',
        data: [],
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.3)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Ventas por día',
        data: [],
        borderColor: 'green',
        backgroundColor: 'rgba(0,255,0,0.3)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } }
  };

  constructor(private salesService: SalesService) {}

  ngOnInit() {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard() {
    this.salesService.obtenerVentas().subscribe({
      next: (ventas: any[]) => {
        const hoy = new Date();
        const hoyStr = hoy.toISOString().split('T')[0];
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();

        let totalMes = 0;
        let totalHoy = 0;
        const ventasHoy: { amount: number; status: string }[] = [];

        const ventasPorDia: { [fecha: string]: number } = {};
        const ventasPorMes: { [mes: string]: number } = {};

        ventas.forEach(venta => {
          const fechaVenta = new Date(venta.createdAt || venta.fecha);
          const fechaStr = fechaVenta.toISOString().split('T')[0];
          const mesStr = `${fechaVenta.getFullYear()}-${(fechaVenta.getMonth() + 1).toString().padStart(2, '0')}`;

          if (fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === anioActual) {
            totalMes += Number(venta.total) || 0;
          }

          if (fechaStr === hoyStr) {
            totalHoy += Number(venta.total) || 0;
            ventasHoy.push({ amount: Number(venta.total) || 0, status: venta.estado || 'Desconocido' });
          }

          ventasPorDia[fechaStr] = (ventasPorDia[fechaStr] || 0) + (Number(venta.total) || 0);
          ventasPorMes[mesStr] = (ventasPorMes[mesStr] || 0) + (Number(venta.total) || 0);
        });

        this.summaryCards = [
          { title: 'Vendido este mes', value: `$${totalMes.toFixed(2)}`, bgClass: 'bg-tertiary', textClass: 'text-light' },
          { title: 'Vendido hoy', value: `$${totalHoy.toFixed(2)}`, bgClass: 'bg-success', textClass: 'text-light' }
        ];

        this.recentSales = ventasHoy.sort((a, b) => b.amount - a.amount).slice(0, 5);

        // Ordenar las claves para las etiquetas
        const diasOrdenados = Object.keys(ventasPorDia).sort();
        const mesesOrdenados = Object.keys(ventasPorMes).sort();

        // Para mostrar en una sola gráfica, usa etiquetas por día (más detallado)
        this.lineChartData.labels = diasOrdenados;

        // Dataset 0: Ventas por mes mapeadas al array de días con cero donde no coincide
        const ventasMesPorDia = diasOrdenados.map(dia => {
          const mes = dia.substring(0, 7); // yyyy-mm de cada día
          return ventasPorMes[mes] || 0;
        });

        this.lineChartData.datasets[0].data = ventasMesPorDia;

        // Dataset 1: Ventas por día
        this.lineChartData.datasets[1].data = diasOrdenados.map(dia => ventasPorDia[dia]);
      },
      error: (err) => {
        console.error('Error cargando ventas para dashboard', err);
      }
    });
  }
}
