import { Component, OnInit } from '@angular/core';

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
      value: '$12,000',
      bgClass: 'bg-tertiary',
      textClass: 'text-light'
    },
    {
      title: 'Vendido hoy',
      value: '$2,300',
      bgClass: 'bg-success',
      textClass: 'text-light'
    },
    {
      title: 'Reportes',
      value: '34 generados',
      bgClass: 'bg-warning',
      textClass: 'text-light'
    }
  ];

  chartData = {
    manufacturers: ['Aliqui', 'Natura', 'Pirum', 'VanArsdel']
  };

  recentSales = [
    { amount: 1500, status: 'Completado' },
    { amount: 1100, status: 'Pendiente' },
    { amount: 900, status: 'Fallido' }
  ];


  ngOnInit() {
  }

}
