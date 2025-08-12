import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
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
  ChartOptions,
  ArcElement
} from 'chart.js';
import { Chart } from 'chart.js';
import { DoughnutController } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';


Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Legend,
  Tooltip,
  ArcElement,
  DoughnutController
);
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {

  @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

  summaryCards = [
    { title: 'Vendido este mes', value: '$0', bgClass: 'bg-tertiary', textClass: 'text-light' },
    { title: 'Vendido hoy', value: '$0', bgClass: 'bg-success', textClass: 'text-light' }
  ];

  recentSales: { amount: number; status: string }[] = [];

  // Nuevos: categorías y top productos
  doughnutData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#2563eb','#16a34a','#f59e0b','#ef4444','#0ea5e9','#8b5cf6'] }]
  };
  doughnutOptions: ChartOptions<'doughnut'> = { responsive: true, plugins: { legend: { position: 'bottom' } } };
  topProductos: Array<{ nombre: string; cantidad: number; ingresos: number }> = [];

  // Control de rango temporal para la gráfica principal
  rangoSeleccionado: '7d' | '30d' | '12m' = '30d';
  private ventasRaw: any[] = [];

  // Filtro por categoría
  categoriasDisponibles: string[] = [];
  categoriaSeleccionada: string = 'Todas';

  // Configuración inicial del gráfico
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Ventas por mes',
        data: [],
        borderColor: 'rgba(5,46,66,1)',
        backgroundColor: 'rgba(5,46,66,0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      },
      {
        label: 'Ventas por día',
        data: [],
        borderColor: 'rgba(24,145,118,1)',
        backgroundColor: 'rgba(24,145,118,0.2)',
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      }
    ]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 450, easing: 'easeOutQuart' },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        mode: 'index', intersect: false,
        callbacks: {
          label: (ctx) => {
            const v = Number(ctx.parsed.y || 0);
            return `${ctx.dataset.label}: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(v))
        },
        grid: { color: 'rgba(2,6,23,0.12)' }
      },
      x: { grid: { display: false } }
    }
  };

  constructor(private salesService: SalesService) {}

  ngOnInit() {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard() {
    this.salesService.obtenerVentas().subscribe({
      next: (ventas: any[]) => {
        this.ventasRaw = ventas || [];
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

        // Construir listado de categorías disponibles a partir de ventas
        const setCats = new Set<string>();
        ventas.forEach(v => (v.detalles || []).forEach((d: any) => {
          const cat = (d.producto?.categoria?.nombre || d.categoria || 'Sin categoría').toString();
          if (cat && cat.trim()) setCats.add(cat);
        }));
        this.categoriasDisponibles = ['Todas', ...Array.from(setCats).sort()];

        // Calcular ventas por categoría y top productos
        const ventasPorCategoria: Record<string, number> = {};
        const productosAgg: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {};
        ventas.forEach(v => {
          (v.detalles || []).forEach((d: any) => {
            const cantidad = Number(d.cantidad) || 0;
            const precio = Number(d.precio_unitario) || 0;
            const ingresos = cantidad * precio;
            const nombre = d.producto?.nombre || d.nombre || `Prod ${d.producto_id}`;
            const categoria = d.producto?.categoria?.nombre || d.categoria || 'Sin categoría';
            ventasPorCategoria[categoria] = (ventasPorCategoria[categoria] || 0) + ingresos;
            const key = String(d.producto_id || nombre);
            if (!productosAgg[key]) productosAgg[key] = { nombre, cantidad: 0, ingresos: 0 };
            productosAgg[key].cantidad += cantidad;
            productosAgg[key].ingresos += ingresos;
          });
        });

        this.doughnutData.labels = Object.keys(ventasPorCategoria);
        this.doughnutData.datasets[0].data = Object.values(ventasPorCategoria);
        this.topProductos = Object.values(productosAgg)
          .sort((a, b) => b.ingresos - a.ingresos)
          .slice(0, 5);

        // Guardar agregados globales iniciales para vista por defecto
        this._cacheGlobalPorDia = ventasPorDia;
        this._cacheGlobalPorMes = ventasPorMes;
        this._cacheGlobalProductos = productosAgg;
        this._cacheGlobalVentasHoy = ventasHoy;
        this._cacheGlobalCategorias = ventasPorCategoria;

        this.recalcularSeries();

        // Asegurar refresco de todos los gráficos una vez que los datos cambian
        setTimeout(() => this.charts?.forEach(c => c.update()), 0);
      },
      error: (err) => {
        console.error('Error cargando ventas para dashboard', err);
      }
    });
  }

  // Caches para acelerar recálculo según rango
  private _cachePorDia: { [fecha: string]: number } = {};
  private _cachePorMes: { [mes: string]: number } = {};
  private _cacheGlobalPorDia: { [fecha: string]: number } = {};
  private _cacheGlobalPorMes: { [mes: string]: number } = {};
  private _cacheGlobalProductos: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {} as any;
  private _cacheGlobalVentasHoy: { amount: number; status: string }[] = [];
  private _cacheGlobalCategorias: Record<string, number> = {};

  setRango(r: any) {
    const allowed: Array<'7d' | '30d' | '12m'> = ['7d', '30d', '12m'];
    const val = allowed.includes(r) ? (r as '7d' | '30d' | '12m') : '30d';
    if (this.rangoSeleccionado !== val) {
      this.rangoSeleccionado = val;
      this.recalcularSeries();
    }
  }

  setCategoria(cat: string | undefined) {
    this.categoriaSeleccionada = (cat && String(cat)) || 'Todas';
    this.recalcularSeries();
  }

  private recalcularSeries() {
    const fecha = new Date();
    let labels: string[] = [];
    let dsMes: number[] = [];
    let dsDia: number[] = [];

    // Recalcular caches por categoría si aplica
    if (this.categoriaSeleccionada === 'Todas') {
      this._cachePorDia = this._cacheGlobalPorDia;
      this._cachePorMes = this._cacheGlobalPorMes;
      // Top productos y ventas recientes con datos globales
      this.topProductos = Object.values(this._cacheGlobalProductos)
        .sort((a, b) => b.ingresos - a.ingresos)
        .slice(0, 5);
      this.recentSales = this._cacheGlobalVentasHoy.slice(0, 5);
    } else {
      // Filtrar ventas crudas por categoría y recalcular agregados
      const ventasFiltradas = this.ventasRaw.map(v => ({
        ...v,
        detalles: (v.detalles || []).filter((d: any) => {
          const cat = (d.producto?.categoria?.nombre || d.categoria || 'Sin categoría').toString();
          return cat === this.categoriaSeleccionada;
        })
      })).filter(v => (v.detalles || []).length > 0);

      const porDia: Record<string, number> = {};
      const porMes: Record<string, number> = {};
      const productosAgg: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {};
      const ventasHoy: { amount: number; status: string }[] = [];
      const hoyStr = new Date().toISOString().split('T')[0];

      ventasFiltradas.forEach((venta: any) => {
        const fecha = (venta.fecha || venta.fecha_venta || venta.createdAt || new Date()).toString();
        const f = new Date(fecha);
        const dia = f.toISOString().split('T')[0];
        const mes = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
        let totalVenta = 0;
        (venta.detalles || []).forEach((det: any) => {
          const cant = Number(det.cantidad || det.cant || 0);
          const precio = Number(det.precio_unitario || det.precio || det.precioVenta || 0);
          const subtotal = cant * precio;
          totalVenta += subtotal;
          const nombreP = (det.producto?.nombre || det.nombre || 'Producto');
          if (!productosAgg[nombreP]) productosAgg[nombreP] = { nombre: nombreP, cantidad: 0, ingresos: 0 };
          productosAgg[nombreP].cantidad += cant;
          productosAgg[nombreP].ingresos += subtotal;
        });
        porDia[dia] = (porDia[dia] || 0) + totalVenta;
        porMes[mes] = (porMes[mes] || 0) + totalVenta;
        if (dia === hoyStr) ventasHoy.push({ amount: totalVenta, status: 'Completada' });
      });

      this._cachePorDia = porDia;
      this._cachePorMes = porMes;
      this.topProductos = Object.values(productosAgg)
        .sort((a, b) => b.ingresos - a.ingresos)
        .slice(0, 5);
      this.recentSales = ventasHoy.sort((a, b) => b.amount - a.amount).slice(0, 5);
    }

    // Actualizar doughnut según categoría
    if (this.categoriaSeleccionada === 'Todas') {
      this.doughnutData.labels = Object.keys(this._cacheGlobalCategorias);
      this.doughnutData.datasets[0].data = Object.values(this._cacheGlobalCategorias);
    } else {
      // Mostrar productos dentro de la categoría seleccionada
      const labels = this.topProductos.map(p => p.nombre);
      const data = this.topProductos.map(p => p.ingresos);
      this.doughnutData.labels = labels;
      this.doughnutData.datasets[0].data = data;
    }

    if (this.rangoSeleccionado === '12m') {
      // Últimos 12 meses: etiquetas yyyy-mm
      const meses: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(fecha.getFullYear(), fecha.getMonth() - i, 1);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        meses.push(m);
      }
      labels = meses;
      dsMes = meses.map(m => this._cachePorMes[m] || 0);
      dsDia = meses.map(() => 0); // no aplica por día en vista mensual
    } else {
      // 7d o 30d: etiquetas por día yyyy-mm-dd
      const dias = this.rangoSeleccionado === '7d' ? 7 : 30;
      const arrDias: string[] = [];
      for (let i = dias - 1; i >= 0; i--) {
        const d = new Date(fecha);
        d.setDate(d.getDate() - i);
        const s = d.toISOString().split('T')[0];
        arrDias.push(s);
      }
      labels = arrDias;
      dsDia = arrDias.map(d => this._cachePorDia[d] || 0);
      dsMes = arrDias.map(d => this._cachePorMes[d.substring(0,7)] || 0);
    }

    // Aplicar datos y estilos de datasets mejorados
    this.lineChartData.labels = labels;
    this.lineChartData.datasets[0] = {
      ...this.lineChartData.datasets[0],
      label: this.rangoSeleccionado === '12m' ? 'Ventas por mes' : 'Total del mes',
      data: dsMes,
      borderColor: '#2f7cf6',
      backgroundColor: 'rgba(47,124,246,0.15)',
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 4,
      fill: true,
      tension: 0.35,
    } as any;
    this.lineChartData.datasets[1] = {
      ...this.lineChartData.datasets[1],
      label: this.rangoSeleccionado === '12m' ? '—' : 'Ventas por día',
      data: dsDia,
      borderColor: '#2dd36f',
      backgroundColor: 'rgba(45,211,111,0.2)',
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 4,
      fill: true,
      tension: 0.35,
    } as any;

    setTimeout(() => this.charts?.forEach(c => c.update()), 0);
  }

  exportarGraficoCSV() {
    const labels = (this.lineChartData.labels as string[]) || [];
    const ds0 = this.lineChartData.datasets[0].data as number[];
    const ds1 = this.lineChartData.datasets[1].data as number[];
    const rows = [['Fecha','Ventas mes','Ventas día'], ...labels.map((l, i) => [l, ds0?.[i] ?? 0, ds1?.[i] ?? 0])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grafico_ventas_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
