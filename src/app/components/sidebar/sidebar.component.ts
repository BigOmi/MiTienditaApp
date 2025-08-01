import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class SidebarComponent  implements OnInit {

  constructor() { }

  public appPages = [
    { title: 'Dashboard', url: '/dashboard', icon: 'grid' },
    { title: 'Ventas', url: '/ventas', icon: 'bar-chart' },
    { title: 'Productos', url: '/productos', icon: 'cube' },
    { title: 'Trabajadores', url: '/trabajadores', icon: 'people' },
    { title: 'Reportes', url: '/reportes', icon: 'document-text' },
    { title: 'Configuración', url: '/configuracion', icon: 'settings' },
  ];

  public selectedPath = '/dashboard';

  ngOnInit() {}

}
