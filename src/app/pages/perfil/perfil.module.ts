import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

import { PerfilPageRoutingModule } from './perfil-routing.module';
import { PerfilPage } from './perfil.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PerfilPageRoutingModule, HttpClientModule],
  declarations: [PerfilPage],
})
export class PerfilPageModule {}
