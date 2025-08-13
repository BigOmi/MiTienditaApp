import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-topbar-menu',
  templateUrl: './topbar-menu.component.html',
  styleUrls: ['./topbar-menu.component.scss'],
  standalone: true
})
export class TopbarMenuComponent implements OnInit {
  menuQuery = '';
  // Aquí puedes importar y usar la lógica de rutas, badges, etc. como en tu TopbarComponent
  constructor() {}
  ngOnInit() {}
}
