import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrabajadoresPageRoutingModule } from './trabajadores-routing.module';

import { TrabajadoresPage } from './trabajadores.page';
import { HttpClientModule } from '@angular/common/http';  // CORRECTO

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrabajadoresPageRoutingModule,
    ReactiveFormsModule,
    HttpClientModule // CORRECTO
  ],
  declarations: [TrabajadoresPage]
})
export class TrabajadoresPageModule {}
