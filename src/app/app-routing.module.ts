import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NewProductoComponent } from './new-producto/new-producto.component';
import { NuevaVentaComponent } from './nueva-venta/nueva-venta.component';
import { NewEmpleadoPage } from './new-empleado/new-empleado.page';
import { ConfiguracionComponent } from './configuracion/configuracion.component';

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
  component: NewEmpleadoPage
  },
  { path: 'new-producto', 
    component: NewProductoComponent},
    
    { path: 'new-venta', 
    component: NuevaVentaComponent},

    { path: 'configuracion', 
    component: ConfiguracionComponent},

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
