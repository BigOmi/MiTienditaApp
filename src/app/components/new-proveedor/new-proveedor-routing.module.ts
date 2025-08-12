import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewProveedorComponent } from './new-proveedor.component';

const routes: Routes = [
  {
    path: '',
    component: NewProveedorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewProveedorRoutingModule { }
