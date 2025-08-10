import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProveedoresPageRoutingModule } from './proveedores-routing.module';

import { ProveedoresPage } from './proveedores.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProveedoresPageRoutingModule,
    ReactiveFormsModule  
  ],
  declarations: [ProveedoresPage]
})
export class ProveedoresPageModule {}
