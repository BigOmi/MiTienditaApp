import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { NewEmpleadoPageRoutingModule } from './new-empleado-routing.module';
import { NewEmpleadoPage } from './new-empleado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewEmpleadoPageRoutingModule,
    NewEmpleadoPage // 👈 Aquí se importa el componente standalone
  ]
})
export class NewEmpleadoPageModule {}