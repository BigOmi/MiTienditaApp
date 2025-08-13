import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-new-empleado',
  templateUrl: './new-empleado.page.html',
  styleUrls: ['./new-empleado.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NewEmpleadoPage implements OnInit {
  usuarioForm!: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usersService: UsersService,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      imagen: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(0)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      rol: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.usuarioForm.valid) {
      this.usersService.crearUsuario(this.usuarioForm.value).subscribe({
        next: (res) => {
          console.log('Usuario creado exitosamente:', res);
          this.notification.success('Usuario creado exitosamente.');
          this.router.navigate(['/home/usuarios']);
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          this.notification.error('Error al crear usuario.');
        },
      });
    } else {
      this.usuarioForm.markAllAsTouched();
      this.notification.error('Por favor completa los campos requeridos.');
    }
  }
}
