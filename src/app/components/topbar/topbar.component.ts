import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router'; // <-- Importa RouterModule
import { IonicModule } from '@ionic/angular';

interface MenuRoute {
  label: string;
  icon: string;
  path: string;
  showNuevaVenta?: boolean;
}

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule], // <-- Agrega RouterModule aquí
})
export class TopbarComponent implements OnInit {
  menuRoutes: MenuRoute[] = [
    { label: 'Dashboard', icon: 'grid', path: '/home/dashboard', showNuevaVenta: true },
    { label: 'Ventas', icon: 'bar-chart', path: '/home/ventas' },
    { label: 'Proveedores', icon: 'briefcase', path: '/home/proveedores' },
    { label: 'Productos', icon: 'cube', path: '/home/productos' },
    { label: 'Trabajadores', icon: 'people', path: '/home/usuarios' },
    { label: 'Configución', icon: 'settings', path: '/home/configuracion' },
  ];
  selectedPath = '/home/dashboard';
  pageTitle = 'Dashboard';
  showNuevaVenta = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url;
        this.selectedPath = this.menuRoutes.find(r => url.startsWith(r.path))?.path || '';
        const currentRoute = this.menuRoutes.find(r => url.startsWith(r.path));
        this.pageTitle = currentRoute?.label || '';
        this.showNuevaVenta = !!currentRoute?.showNuevaVenta;
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigateByUrl(path);
  }

  nVenta( ) {
    this.router.navigateByUrl('/new-venta');
  }
}


