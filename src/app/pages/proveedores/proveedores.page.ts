import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProveedoresService } from 'src/app/services/proveedores.service';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.page.html',
  styleUrls: ['./proveedores.page.scss'],
  standalone: false,
})
export class ProveedoresPage implements OnInit {

  busqueda: string = '';
  proveedores: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  proveedorEditandoId: number | null = null;
  editForm!: FormGroup;

  constructor(
    private router: Router,
    private provService: ProveedoresService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadProveedores();
  }

  initForm() {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(18)]],
      tipo_producto: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required]
    });
  }

  async loadProveedores() {
    this.loading = true;
    this.error = null;

    try {
      const response = await firstValueFrom(this.provService.getProveedores());
      this.proveedores = response || [];
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
      this.error = 'No se pudieron cargar los proveedores.';
    } finally {
      this.loading = false;
    }
  }

  proveedoresFiltrados() {
    const termino = this.busqueda.toLowerCase();
    return this.proveedores.filter(prov =>
      prov.nombre.toLowerCase().includes(termino) ||
      prov.apellido.toLowerCase().includes(termino) ||
      (prov.telefono && prov.telefono.toLowerCase().includes(termino)) ||
      (prov.email && prov.email.toLowerCase().includes(termino))
    );
  }

  nuevoProveedor() {
    this.router.navigateByUrl('/new-proveedor');
  }

  editarProveedor(prov: any) {
    this.proveedorEditandoId = prov.id;
    this.editForm.patchValue({
      nombre: prov.nombre,
      apellido: prov.apellido,
      edad: prov.edad,
      tipo_producto: prov.tipo_producto,
      telefono: prov.telefono,
      email: prov.email,
      direccion: prov.direccion
    });
  }

  cancelarEdicion() {
    this.proveedorEditandoId = null;
    this.editForm.reset();
  }

  guardarCambios() {
    if (this.editForm.invalid) {
      alert('Formulario inválido, revisa los datos');
      return;
    }

    if (!this.proveedorEditandoId) {
      alert('No se ha seleccionado ningún proveedor para editar.');
      return;
    }

    const valores = this.editForm.value;
    valores.edad = Number(valores.edad);

    this.provService.actualizarProveedor(this.proveedorEditandoId, valores).subscribe({
      next: () => {
        alert('Proveedor actualizado correctamente');
        this.cancelarEdicion();
        this.loadProveedores();
      },
      error: (err) => {
        console.error('Error al actualizar proveedor:', err);
        alert('Error al actualizar el proveedor.');
      }
    });
  }

  async eliminarProveedor(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este proveedor?')) return;

    try {
      await firstValueFrom(this.provService.eliminarProveedor(id));
      this.proveedores = this.proveedores.filter(p => p.id !== id);
    } catch (err) {
      console.error('Error al eliminar proveedor:', err);
      alert('No se pudo eliminar el proveedor.');
    }
  }
}
