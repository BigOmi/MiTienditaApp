import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewCompraComponent } from './new-compra.component';

const routes: Routes = [
  {
    path: '',
    component: NewCompraComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewCompraRoutingModule { }
