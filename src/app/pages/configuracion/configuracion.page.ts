import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from 'src/app/services/users.service'; // servicio HTTP
import { NotificationService } from 'src/app/core/services/notification.service';
import { firstValueFrom } from 'rxjs';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: false,
})
export class ConfiguracionPage implements OnInit {
  editForm!: FormGroup;
  emailUsuario: string = '';
  usuarioId!: number; // Id del usuario para update
  hasUser: boolean = false;

  constructor(private fb: FormBuilder, private userS: UsersService, private notify: NotificationService, private menuCtrl: MenuController) {
    // Inicializar inmediatamente para evitar errores de plantilla antes de ngOnInit
    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      imagen: [''],
      newPassword: [''],
    });
  }

  async ngOnInit() {
    // El formulario ya está inicializado en el constructor
    try { await this.menuCtrl.close('main-menu'); } catch {}
    this.cargarDatosUsuario();
  }

  initForm() {
    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      imagen: [''],
      newPassword: [''],
    });
  }

  cargarDatosUsuario() {
    // Intentar obtener usuario desde UsersService y fallback a localStorage
    const fromService = this.userS.getCurrentUser?.() || null;
    const fromStorage = (() => {
      try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
    })();
    const user = fromService || fromStorage;

    const uid = user?.id ?? user?._id;
    if (user && uid) {
      this.hasUser = true;
      this.usuarioId = uid;
      this.emailUsuario = user.email || user.correo || '';
      this.editForm.patchValue({
        nombre: user.nombre || user.firstName || '',
        apellido: user.apellido || user.lastName || '',
        imagen: user.imagen || user.avatar || '',
      });
    } else {
      this.hasUser = false;
      // Limpiar formulario para evitar valores fantasmas
      this.editForm.reset({ nombre: '', apellido: '', imagen: '', newPassword: '' });
      this.emailUsuario = '';
    }
  }

  async guardarCambios() {
    if (this.editForm.invalid) return;

    const valores = this.editForm.value;

    // Armar objeto para enviar al backend, solo con campos que se deben actualizar
    const dataToSend: any = {
      nombre: valores.nombre,
      apellido: valores.apellido,
      imagen: valores.imagen?.trim() || undefined,
    };

    if (valores.newPassword && valores.newPassword.trim().length > 0) {
      dataToSend.password = valores.newPassword.trim();
    }

    // Eliminar keys con undefined para evitar enviarlas
    Object.keys(dataToSend).forEach(
      (key) => dataToSend[key] === undefined && delete dataToSend[key]
    );

    try {
      await firstValueFrom(this.userS.editarUsuario(this.usuarioId, dataToSend));
      this.notify.success('Cambios guardados correctamente');

      // Actualizar localStorage con nuevos datos (opcional)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.nombre = dataToSend.nombre;
      user.apellido = dataToSend.apellido;
      if (dataToSend.imagen) user.imagen = dataToSend.imagen;
      localStorage.setItem('user', JSON.stringify(user));

      this.editForm.patchValue({ newPassword: '' });
      this.editForm.markAsPristine();
      this.editForm.markAsUntouched();
    } catch (error: any) {
      console.error('Error al guardar cambios:', error);
      this.notify.error('Error al guardar cambios: ' + (error.error?.message || error.message || 'Error desconocido'));
    }
  }

  cancelar() {
    this.cargarDatosUsuario();
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
  }
}
