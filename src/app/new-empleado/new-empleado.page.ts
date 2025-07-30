import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

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
export class NewEmpleadoPage implements OnInit {

  empleadoForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.empleadoForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      turno: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.empleadoForm.valid) {
      const nuevoEmpleado = this.empleadoForm.value;
      console.log('Empleado creado:', nuevoEmpleado);
      // Aquí puedes agregar lógica para enviar datos al backend o mostrar un mensaje
    } else {
      console.log('Formulario inválido');
      this.empleadoForm.markAllAsTouched();
    }
  }
}