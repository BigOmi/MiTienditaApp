import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
        private router: Router // Importa Router para la navegación
  ) { }

  ngOnInit() {
  }

  changePage() {
    // Navega a la página de registro
    this.router.navigate(['/forgot-password'], { replaceUrl: true });
  }



}
