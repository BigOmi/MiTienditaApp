import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { MenuController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';
  errorMessage: string = '';




  constructor(
    private router: Router,
    private usersService: UsersService,
    private menuCtrl: MenuController
  ) {}

  async ngOnInit() {
    // Cierra y deshabilita el menú en la pantalla de login para evitar overlays/aria-hidden
    try {
      await this.menuCtrl.close('main-menu');
      await this.menuCtrl.enable(false, 'main-menu');
    } catch {}
  }

  async ngOnDestroy() {
    // Rehabilita el menú al salir de login si quedara deshabilitado
    try { await this.menuCtrl.enable(true, 'main-menu'); } catch {}
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.usersService.login(this.email, this.password).subscribe({
      next: (response) => {
        // Guarda token y usuario en localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        // Habilita menú tras autenticación
        try { this.menuCtrl.enable(true, 'main-menu'); } catch {}
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
