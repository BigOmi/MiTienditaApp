import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-proveedor',
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './new-proveedor.component.html',
  styleUrls: ['./new-proveedor.component.scss'],
  standalone: true
})
export class NewProveedorComponent implements OnInit {

  proveedorForm!: FormGroup;
  esEdicion = false;
  proveedorId!: number;
  categorias: any[] = [];
  cargandoCategorias = false;
  errorCategorias = '';

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService,
    private categoriesService: CategoriesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.proveedorId = Number(this.route.snapshot.paramMap.get('id'));
    this.esEdicion = !!this.proveedorId;

    this.proveedorForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(18)]],
      tipo_producto: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
    });

    await this.cargarCategorias();

    if (this.esEdicion) {
      this.proveedoresService.getProveedor(this.proveedorId).subscribe({
        next: (data) => {
          // Si data.tipo_producto es id o string, depende de tu backend
          this.proveedorForm.patchValue(data);
        },
        error: (err) => {
          console.error('Error al cargar proveedor:', err);
        }
      });
    }
  }

  async cargarCategorias() {
  this.cargandoCategorias = true;
  this.errorCategorias = '';
  try {
    const categorias = await firstValueFrom(this.categoriesService.obtenerCategorias());
    console.log('Categorías recibidas:', categorias);  // <-- Aquí
    this.categorias = categorias;
  } catch (error) {
    console.error('Error cargando categorías:', error);
    this.errorCategorias = 'No se pudieron cargar las categorías.';
  } finally {
    this.cargandoCategorias = false;
  }
}


  guardarProveedor() {
    if (this.proveedorForm.invalid) {
      alert('Formulario inválido. Por favor revisa los datos.');
      return;
    }

    const proveedor = this.proveedorForm.value;

    if (this.esEdicion) {
      this.proveedoresService.actualizarProveedor(this.proveedorId, proveedor).subscribe({
        next: () => this.router.navigate(['/home/proveedores']),
        error: (err) => {
          console.error('Error actualizando proveedor:', err);
          alert('Error al actualizar proveedor.');
        }
      });
    } else {
      this.proveedoresService.crearProveedor(proveedor).subscribe({
        next: () => this.router.navigate(['/home/proveedores']),
        error: (err) => {
          console.error('Error creando proveedor:', err);
          alert('Error al crear proveedor.');
        }
      });
    }
  }

}
