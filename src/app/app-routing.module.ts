import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { authGuard } from './guards/auth.guard';
import { NewProveedorComponent } from './components/new-proveedor/new-proveedor.component';
import { NuevaVentaComponent } from './components/nueva-venta/nueva-venta.component';
import { NewEmpleadoPage } from './components/new-empleado/new-empleado.page';
import { NewCategoriaComponent } from './components/new-categoria/new-categoria.component';
import { NewCompraComponent } from './components/new-compra/new-compra.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./auth/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'home',
    component: HomePage,
    canActivate: [authGuard],
    children: [
      {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
      },
      {
        path: 'ventas',
        loadChildren: () => import('./pages/ventas/ventas.module').then( m => m.VentasPageModule)
      },
      {
        path: 'productos',
        loadChildren: () => import('./pages/productos/productos.module').then( m => m.ProductosPageModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./pages/trabajadores/trabajadores.module').then( m => m.TrabajadoresPageModule)
      },
        {
    path: 'configuracion',
    loadChildren: () => import('./pages/configuracion/configuracion.module').then( m => m.ConfiguracionPageModule)
  },
    {

    path: 'proveedores',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/proveedores/proveedores.module').then( m => m.ProveedoresPageModule)
  },

    ]
  },

  {
    path: 'new-proveedor',
    canActivate: [authGuard],
    component: NewProveedorComponent
  },
  { path: 'new-compra',
    canActivate: [authGuard],
    component: NewCompraComponent},
  {
  path: 'new-empleado',
  canActivate: [authGuard],
  component: NewEmpleadoPage
  },
    { path: 'new-venta',
    canActivate: [authGuard],
    component: NuevaVentaComponent},
    { path: 'new-categoria',
    canActivate: [authGuard],
    component: NewCategoriaComponent},







];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
