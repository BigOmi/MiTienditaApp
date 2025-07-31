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
      value: '$12,450',
      bgClass: 'bg-white',
      textClass: 'text-black'
    },
    {
      title: 'Vendido hoy',
      value: '$2,300',
      bgClass: 'bg-[#189176]',
      textClass: 'text-white'
    },
    {
      title: 'Reportes',
      value: '6',
      bgClass: 'bg-white',
      textClass: 'text-black'
    }
  ];

  chartData = {
    manufacturers: ['Aliqui', 'Natura', 'Pirum', 'VanArsdel'],
  };

  recentSales = [
    { amount: 1050, status: 'Completado' },
    { amount: 345, status: 'Completado' },
    { amount: 740, status: 'Completado' },
    { amount: 125, status: 'Completado' }
  ];

  ngOnInit() {
  }

}
