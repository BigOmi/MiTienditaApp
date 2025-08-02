import { Component } from '@angular/core';
import { TopbarComponent } from '../components/topbar/topbar.component';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, TopbarComponent, RouterOutlet] // Asegúrate de importar los componentes necesarios
})
export class HomePage {

  constructor() {}

}
