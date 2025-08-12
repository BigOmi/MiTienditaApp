import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NewEmpleadoPage } from './new-empleado.page';
import { NewEmpleadoPageRoutingModule } from './new-empleado-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    NewEmpleadoPageRoutingModule,
    NewEmpleadoPage
  ],
  declarations: []
})
export class NewEmpleadoPageModule { }
