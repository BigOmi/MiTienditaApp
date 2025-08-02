import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username: string = '';
  password: string = '';
  errorMessage: string = '';

  // Simulación simple de usuario
  private validUser = {
    username: 'user@admin.com',
    password: '123'
  };

  constructor(private router: Router) {}

  ngOnInit() {}

  onSubmit(event: Event) {
    event.preventDefault();

    // Validación simple
    if (
      this.username.toLowerCase() === this.validUser.username.toLowerCase() &&
      this.password === this.validUser.password
    ) {
      this.errorMessage = '';
      // Navegar a home
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      this.errorMessage = 'Usuario o contraseña incorrectos';
    }
  }

  changePage() {
    this.router.navigate(['/forgot-password'], { replaceUrl: true });
  }
}
