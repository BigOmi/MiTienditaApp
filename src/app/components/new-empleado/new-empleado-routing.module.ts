import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewEmpleadoPage } from './new-empleado.page';

const routes: Routes = [
  {
    path: '',
    component: NewEmpleadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewEmpleadoPageRoutingModule {}