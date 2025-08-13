import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UsersService } from './services/users.service';
import { ProductsService } from './services/products.service';
import { SalesService } from './services/sales.service';
import { ProveedoresService } from './services/proveedores.service';

interface MenuRoute {
  label: string;
  icon: string;
  path: string;
  showNuevaVenta?: boolean;
  section: 'Principal' | 'Operaciones' | 'Catálogos' | 'Configuración';
  badgeCount?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  standalone: false,
})
export class AppComponent {
  menuRoutes: MenuRoute[] = [
    { label: 'Dashboard', icon: 'grid', path: '/home/dashboard', showNuevaVenta: true, section: 'Principal' },
    { label: 'Ventas', icon: 'bar-chart', path: '/home/ventas', section: 'Operaciones' },
    { label: 'Productos', icon: 'cube', path: '/home/productos', section: 'Catálogos' },
    { label: 'Proveedores', icon: 'briefcase', path: '/home/proveedores', section: 'Catálogos' },
    { label: 'Trabajadores', icon: 'people', path: '/home/usuarios', section: 'Catálogos' },
    { label: 'Perfil', icon: 'person', path: '/home/perfil', section: 'Configuración' },
    { label: 'Configuración', icon: 'settings', path: '/home/configuracion', section: 'Configuración' },
  ];

  selectedPath = '/home/dashboard';
  menuQuery = '';
  private subs: Subscription[] = [];
  isAuthRoute = false;

  constructor(
    private router: Router,
    private usersService: UsersService,
    private productsService: ProductsService,
    private salesService: SalesService,
    private proveedoresService: ProveedoresService
  ) {
    this.listenToRouteChanges();
    this.loadBadges();
    // Estado inicial al arrancar
    this.isAuthRoute = this.isAuthPath(this.router.url || '');
  }

  navigateTo(path: string) {
    this.router.navigateByUrl(path);
  }

  routesBySection(section: MenuRoute['section']): MenuRoute[] {
    const q = this.menuQuery.trim().toLowerCase();
    const filtered = q ? this.menuRoutes.filter(r => r.label.toLowerCase().includes(q)) : this.menuRoutes;
    return filtered.filter(r => r.section === section);
  }

  // ---------- PRIVADOS ----------
  private listenToRouteChanges() {
    this.subs.push(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        const currentRoute = this.menuRoutes.find(r => url.startsWith(r.path));
        this.selectedPath = currentRoute?.path || '';
        this.isAuthRoute = this.isAuthPath(url);
      })
    );
  }

  private loadBadges() {
    // Ventas de hoy
    this.subs.push(
      this.salesService.obtenerVentas().subscribe(ventas => {
        const hoy = this.getTodayString();
        this.setBadge('/home/ventas', (ventas || []).filter((v: any) => new Date(v.createdAt || v.fecha).toISOString().slice(0, 10) === hoy).length);
      })
    );

    // Productos bajo stock
    this.subs.push(
      this.productsService.obtenerProductos().subscribe(prods => {
        this.setBadge('/home/productos', (prods || []).filter((p: any) => Number(p.stock_actual) <= 5).length);
      })
    );

    // Proveedores inactivos
    this.subs.push(
      this.proveedoresService.getProveedores().subscribe(provs => {
        const inactivos = (provs || []).filter((p: any) => p.activo === false).length;
        if (inactivos) this.setBadge('/home/proveedores', inactivos);
      })
    );
  }

  private setBadge(path: string, count: number) {
    const route = this.menuRoutes.find(r => r.path === path);
    if (route) route.badgeCount = count;
  }

  private getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private isAuthPath(url: string): boolean {
    // Ocultar header/menu en rutas de autenticación
    return url.startsWith('/login') || url.startsWith('/forgot-password');
  }
}
