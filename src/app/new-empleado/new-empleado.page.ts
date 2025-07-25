import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-new-empleado',
  templateUrl: './new-empleado.page.html',
  styleUrls: ['./new-empleado.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class NewEmpleadoPage implements OnInit {

  constructor() { }

  ngOnInit() { }
}