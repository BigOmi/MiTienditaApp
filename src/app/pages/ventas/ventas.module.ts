import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VentasPage } from './ventas.page';
import { VentasPageRoutingModule } from './ventas-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VentasPageRoutingModule,
    VentasPage
  ],
  declarations: []
})
export class VentasPageModule {}
