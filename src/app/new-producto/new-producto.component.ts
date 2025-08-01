import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-producto',
  templateUrl: './new-producto.component.html',
  styleUrls: ['./new-producto.component.scss'],
  imports:[ReactiveFormsModule,]
})
export class NewProductoComponent implements OnInit {
  productoForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      costo: [null, [Validators.required, Validators.min(0)]],
      stock: [null, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit() {
    if (this.productoForm.valid) {
      const productoData = this.productoForm.value;
      console.log('Producto creado:', productoData);
      // Aquí puedes añadir la lógica para enviarlo a tu backend o servicio
    } else {
      console.warn('Formulario inválido');
      this.productoForm.markAllAsTouched(); // Esto fuerza que se muestren los mensajes de error
    }
  }
}