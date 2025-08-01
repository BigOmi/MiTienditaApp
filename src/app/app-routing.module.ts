import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';

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
    ]
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
