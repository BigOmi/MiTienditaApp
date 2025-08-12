import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NewCompraComponent } from './new-compra.component';
import { NewCompraRoutingModule } from './new-compra-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    NewCompraRoutingModule,
    NewCompraComponent
  ],
  declarations: []
})
export class NewCompraModule { }
