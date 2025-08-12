import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.page.html',
  styleUrls: ['./proveedores.page.scss'],
  standalone: false,
})
export class ProveedoresPage implements OnInit {

  busqueda: string = '';
  proveedores: any[] = [];
  categorias: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  proveedorEditandoId: number | null = null;
  editForm!: FormGroup;

  constructor(
    private router: Router,
    private provService: ProveedoresService,
    private categoriesService: CategoriesService,
    private fb: FormBuilder,
    private menuCtrl: MenuController
  ) {}

  async ngOnInit() {
    // Cierra el menú si estuviera abierto para evitar overlays/inert sobre el contenido
    try { await this.menuCtrl.close('main-menu'); } catch {}
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(18)]],
      tipo_producto: ['', Validators.required],  // Ahora será el nombre de la categoría
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required]
    });
  }

  // Carga concurrente y robusta de proveedores y categorías
  loadData() {
    this.loading = true;
    this.error = null;

    forkJoin({
      proveedores: this.provService.getProveedores().pipe(
        timeout(8000),
        catchError((err) => {
          console.error('Error proveedores:', err);
          return of([]);
        })
      ),
      categorias: this.categoriesService.obtenerCategorias().pipe(
        timeout(8000),
        catchError((err) => {
          console.error('Error categorías:', err);
          return of([]);
        })
      ),
    }).subscribe({
      next: ({ proveedores, categorias }) => {
        this.proveedores = proveedores || [];
        this.categorias = categorias || [];
        if (!proveedores || proveedores.length === 0) {
          // No bloquear la UI; sólo informar si es necesario
          this.error = null; // o un mensaje suave si quieres
        }
      },
      error: (err) => {
        console.error('Error al cargar datos de proveedores/categorías:', err);
        this.error = 'No se pudieron cargar los datos.';
      },
      complete: () => {
        this.loading = false;
      },
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

  async loadCategorias() {
    try {
      this.categorias = await firstValueFrom(this.categoriesService.obtenerCategorias());
    } catch (error) {
      console.error('Error cargando categorías:', error);
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
      tipo_producto: prov.tipo_producto, // Aquí debe venir el string con el nombre de la categoría
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
