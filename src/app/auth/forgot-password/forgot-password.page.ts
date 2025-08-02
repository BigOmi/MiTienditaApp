import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

    email: string = '';
    
  constructor(
    private router: Router // Importa Router para la navegación
  ) { }


  onSubmit() {
    if (this.email) {
      console.log('Restablecer contraseña para:', this.email);
      // Aquí podrías usar un servicio para enviar el email
    }
  }

  ngOnInit() {
  }

}
