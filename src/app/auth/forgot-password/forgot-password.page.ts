import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  constructor(
    private router: Router // Importa Router para la navegación
  ) { }

  ngOnInit() {
  }

  goBack() {
  this.router.navigate(['/login'], { replaceUrl: true });

}

}
