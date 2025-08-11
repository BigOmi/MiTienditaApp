import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-empleado',
  templateUrl: './new-empleado.page.html',
  styleUrls: ['./new-empleado.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
})
export class NewEmpleadoPage implements OnInit {
  usuarioForm!: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usersService: UsersService
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
          this.router.navigate(['/home/usuarios']);
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
        },
      });
    } else {
      this.usuarioForm.markAllAsTouched();
    }
  }
}
