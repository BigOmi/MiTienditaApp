import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NewProveedorComponent } from './new-proveedor.component';
import { NewProveedorRoutingModule } from './new-proveedor-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    NewProveedorRoutingModule,
    NewProveedorComponent
  ],
  declarations: []
})
export class NewProveedorModule { }
