import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-new-proveedor',
  templateUrl: './new-proveedor.component.html',
  styleUrls: ['./new-proveedor.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NewProveedorComponent implements OnInit {

  proveedorForm!: FormGroup;
  esEdicion = false;
  proveedorId!: number;
  categorias: any[] = [];
  cargandoCategorias = false;
  errorCategorias = '';
  guardando = false;
  private LAST_TIPO_KEY = 'proveedor_ultimo_tipo_producto';

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService,
    private categoriesService: CategoriesService,
    private route: ActivatedRoute,
    public router: Router,
    private notification: NotificationService
  ) {}

  async ngOnInit() {
    this.proveedorId = Number(this.route.snapshot.paramMap.get('id'));
    this.esEdicion = !!this.proveedorId;

    this.proveedorForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(18)]],
      tipo_producto: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
    });

    await this.cargarCategorias();

    // Recordar último tipo seleccionado si existe
    const lastTipo = this.leerUltimoTipo();
    if (lastTipo && !this.proveedorForm.get('tipo_producto')?.value) {
      this.proveedorForm.get('tipo_producto')?.setValue(lastTipo);
    }
    // Persistir últimos cambios de tipo
    this.proveedorForm.get('tipo_producto')?.valueChanges.subscribe((val) => this.guardarUltimoTipo(val));

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
    // Si solo hay una categoría y no hay valor, autoseleccionar
    if (this.categorias?.length === 1 && !this.proveedorForm.get('tipo_producto')?.value) {
      const unico = this.categorias[0]?.nombre;
      if (unico) this.proveedorForm.get('tipo_producto')?.setValue(unico);
    }
  } catch (error) {
    console.error('Error cargando categorías:', error);
    this.errorCategorias = 'No se pudieron cargar las categorías.';
  } finally {
    this.cargandoCategorias = false;
  }
}


  guardarProveedor() {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      this.notification.error('Formulario inválido. Por favor revisa los datos.');
      return;
    }

    // Sanitizar y normalizar payload
    const raw = this.proveedorForm.value;
    const proveedor = {
      nombre: String(raw.nombre || '').trim(),
      apellido: String(raw.apellido || '').trim(),
      edad: Number(raw.edad),
      tipo_producto: raw.tipo_producto,
      telefono: String(raw.telefono || '').replace(/\D/g, ''),
      email: String(raw.email || '').trim().toLowerCase(),
      direccion: String(raw.direccion || '').trim(),
    };

    this.guardando = true;
    if (this.esEdicion) {
      this.proveedoresService.actualizarProveedor(this.proveedorId, proveedor).subscribe({
        next: () => {
          this.notification.success('Proveedor actualizado correctamente.');
          this.router.navigate(['/home/proveedores']);
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error actualizando proveedor:', err);
          this.notification.error('Error al actualizar proveedor.');
          this.guardando = false;
        }
      });
    } else {
      this.proveedoresService.crearProveedor(proveedor).subscribe({
        next: () => {
          this.notification.success('Proveedor creado correctamente.');
          this.router.navigate(['/home/proveedores']);
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error creando proveedor:', err);
          this.notification.error('Error al crear proveedor.');
          this.guardando = false;
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/home/proveedores']);
  }

  private guardarUltimoTipo(val: any) {
    try { if (val) localStorage.setItem(this.LAST_TIPO_KEY, String(val)); } catch {}
  }
  private leerUltimoTipo(): string | null {
    try { return localStorage.getItem(this.LAST_TIPO_KEY); } catch { return null; }
  }

}
