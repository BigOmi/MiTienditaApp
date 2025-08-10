import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: false,
})
export class ConfiguracionPage implements OnInit {
  editForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
    this.cargarDatosUsuario();
  }

  initForm() {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: [''],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: [''],
    });
  }

  cargarDatosUsuario() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user) {
      this.editForm.patchValue({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        direccion: user.direccion || '',
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    // Manejo del archivo
  }

  guardarCambios() {
    if (this.editForm.invalid) return;
    const datos = this.editForm.value;
    // Lógica para enviar al backend
  }

  cancelar() {
    this.cargarDatosUsuario();
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
  }
}
