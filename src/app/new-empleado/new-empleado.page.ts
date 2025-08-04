import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-new-empleado',
  templateUrl: './new-empleado.page.html',
  styleUrls: ['./new-empleado.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class NewEmpleadoPage {

  usuarioForm!: FormGroup;

  constructor(
    private Router:Router,
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      imagen: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(0)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      rol: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.usuarioForm.valid) {
      const nuevoUsuario = this.usuarioForm.value;
      this.usuarioService.create(nuevoUsuario).subscribe({
        next: (res) => {
          console.log('Usuario creado exitosamente:', res);
          // Puedes redirigir o mostrar una alerta aquí
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
        }
      });
    } else {
      console.log('Formulario inválido');
      this.usuarioForm.markAllAsTouched();
    }
  }
}