import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit {
  user: any = null;
  hasUser = false;

  constructor(private menuCtrl: MenuController, private usersService: UsersService, private router: Router) {}

  async ngOnInit() {
    try { await this.menuCtrl.close('main-menu'); } catch {}
    this.cargarUsuario();
  }

  cargarUsuario() {
    const fromService = this.usersService.getCurrentUser?.() || null;
    const fromStorage = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
    const u = fromService || fromStorage;
    const uid = u?.id ?? u?._id;
    if (u && uid) {
      this.hasUser = true;
      this.user = {
        id: uid,
        nombre: u?.nombre ?? u?.firstName ?? '',
        apellido: u?.apellido ?? u?.lastName ?? '',
        email: u?.email ?? u?.correo ?? '',
        imagen: u?.imagen ?? u?.avatar ?? '',
        rol: u?.rol ?? '',
      };
    } else {
      this.hasUser = false;
      this.user = null;
    }
  }

  goToConfig() {
    this.router.navigateByUrl('/home/configuracion');
  }
}
