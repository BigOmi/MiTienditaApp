import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone: true,
})
export class TopbarComponent implements OnInit {
  pageTitle = 'Dashboard';
  showNuevaVenta = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url;
        if (url.includes('dashboard')) {
          this.pageTitle = 'Dashboard';
          this.showNuevaVenta = true;
        } else if (url.includes('ventas')) {
          this.pageTitle = 'Ventas';
          this.showNuevaVenta = false;
        } else if (url.includes('productos')) {
          this.pageTitle = 'Productos';
          this.showNuevaVenta = false;
        } else if (url.includes('trabajadores')) {
          this.pageTitle = 'Trabajadores';
          this.showNuevaVenta = false;
        } else if (url.includes('reportes')) {
          this.pageTitle = 'Reportes';
          this.showNuevaVenta = false;
        } else if (url.includes('configuracion')) {
          this.pageTitle = 'Configuración';
          this.showNuevaVenta = false;
        } else {
          this.pageTitle = '';
          this.showNuevaVenta = false;
        }
      }
    });
  }
}
