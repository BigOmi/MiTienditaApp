import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('../pages/dashboard/dashboard.module').then(m => m.DashboardPageModule) },
      { path: 'ventas', loadChildren: () => import('../pages/ventas/ventas.module').then(m => m.VentasPageModule) },
      { path: 'productos', loadChildren: () => import('../pages/productos/productos.module').then(m => m.ProductosPageModule) },
      { path: 'usuarios', loadChildren: () => import('../pages/trabajadores/trabajadores.module').then(m => m.TrabajadoresPageModule) },
      { path: 'perfil', loadChildren: () => import('../pages/perfil/perfil.module').then(m => m.PerfilPageModule) },
      { path: 'configuracion', loadChildren: () => import('../pages/configuracion/configuracion.module').then(m => m.ConfiguracionPageModule) },
      { path: 'proveedores', loadChildren: () => import('../pages/proveedores/proveedores.module').then(m => m.ProveedoresPageModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
