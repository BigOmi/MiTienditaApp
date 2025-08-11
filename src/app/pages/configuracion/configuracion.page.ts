import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from 'src/app/services/users.service'; // servicio HTTP
import { firstValueFrom } from 'rxjs';

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

  constructor(private fb: FormBuilder, private userS: UsersService) {}

  ngOnInit() {
    this.initForm();
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user) {
      this.usuarioId = user.id;
      this.emailUsuario = user.email || '';
      this.editForm.patchValue({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        imagen: user.imagen || '',
      });
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
      alert('Cambios guardados correctamente');

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
      alert('Error al guardar cambios: ' + (error.error?.message || error.message || 'Error desconocido'));
    }
  }

  cancelar() {
    this.cargarDatosUsuario();
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
  }
}
