import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';




  constructor(
    private router: Router,
    private usersService: UsersService
  ) {}

  ngOnInit() {}

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.usersService.login(this.email, this.password).subscribe({
      next: (response) => {
        // Guarda token y usuario en localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        // Navega a home
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: (err) => {
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    });
  }

  changePage() {
    this.router.navigate(['/forgot-password'], { replaceUrl: true });
  }
}
