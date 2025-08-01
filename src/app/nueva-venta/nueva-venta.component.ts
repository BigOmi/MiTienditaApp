import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-nueva-venta',
  templateUrl:'./nueva-venta.component.html',
  styleUrls: ['./nueva-venta.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class NuevaVentaComponent {
  ventaForm = this.fb.group({
    cliente: ['', Validators.required],
    producto: ['', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    fecha: ['']
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.ventaForm.valid) {
      const datosVenta = this.ventaForm.value;
      console.log('Venta registrada:', datosVenta);
      // Aquí puedes agregar lógica para guardar los datos o enviar al backend
    } else {
      console.warn('Formulario inválido');
      this.ventaForm.markAllAsTouched();
    }
  }
}