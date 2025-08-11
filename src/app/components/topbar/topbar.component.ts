import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { UsersService } from 'src/app/services/users.service';

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
  imports: [IonicModule, CommonModule, RouterModule],
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

  avatarUrl = 'assets/user.jpeg'; // Imagen por defecto

  constructor(private router: Router, private usersService: UsersService) {}

  ngOnInit() {
    // Obtener usuario y asignar la imagen para el avatar
    const currentUser = this.usersService.getCurrentUser();
    if (currentUser && currentUser.imagen) {
      this.avatarUrl = currentUser.imagen;
    }

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

  nVenta() {
    this.router.navigateByUrl('/new-venta');
  }
}
