import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NewProductoComponent } from './new-producto/new-producto.component';
import { NuevaVentaComponent } from './nueva-venta/nueva-venta.component';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'new-empleado',
    loadChildren: () => import('./new-empleado/new-empleado.module').then( m => m.NewEmpleadoPageModule)
  },
  { path: 'new-producto', 
    component: NewProductoComponent},
    
    { path: 'new-venta', 
    component: NuevaVentaComponent},

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
