import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UsersService } from 'src/app/services/users.service';
import { MenuController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
})
export class TrabajadoresPage implements OnInit {

  busqueda: string = '';
  filtroRol: string = '';
  usuarios: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  usuarioEditandoId: number | null = null;
  usuarioEditando: any = null;
  mostrarPassword: boolean = false;
  editForm!: FormGroup;

  constructor(
    private router: Router,
    private userS: UsersService,
    private fb: FormBuilder,
    private menuCtrl: MenuController
  ) {}

  async ngOnInit() {
    // Cierra el menú si estuviera abierto para evitar overlays/inert sobre el contenido
    try { await this.menuCtrl.close('main-menu'); } catch {}
    this.initForm();
    await this.loadUsers();
  }

  initForm() {
    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      // email eliminado porque no está en DTO ni será enviado
      edad: ['', [Validators.min(0)]], // opcional, si está vacío no se envía
      rol: ['', Validators.required], // Validar con enum 'admin' | 'empleado'
      imagen: [''], // opcional, string
      password: ['', [Validators.minLength(3), Validators.maxLength(30)]] // opcional
    });
  }

  async loadUsers() {
    this.loading = true;
    this.error = null;

    try {
      const response = await firstValueFrom(this.userS.obtenerUsuarios());
      this.usuarios = response || [];
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      this.error = 'Error al cargar los usuarios';
    } finally {
      this.loading = false;
    }
  }

  usuariosFiltrados() {
    return this.usuarios.filter(usuario => {
      const coincideRol = this.filtroRol ? usuario.rol === this.filtroRol : true;
      const terminoBusquedaLower = this.busqueda.toLowerCase();
      const coincideBusqueda = (
        usuario.nombre.toLowerCase().includes(terminoBusquedaLower) ||
        usuario.apellido.toLowerCase().includes(terminoBusquedaLower)
      );
      return coincideRol && coincideBusqueda;
    });
  }

  navNewUser() {
    this.router.navigateByUrl('/new-empleado');
  }

  editarUsuario(usuario: any) {
    this.usuarioEditandoId = usuario.id;
    this.usuarioEditando = usuario;
    this.editForm.patchValue({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      edad: usuario.edad ?? '',
      rol: usuario.rol,
      imagen: usuario.imagen ?? '',
      password: ''
    });
  }

  cancelarEdicion() {
    this.usuarioEditandoId = null;
    this.usuarioEditando = null;
    this.editForm.reset();
    this.mostrarPassword = false;
  }

  togglePasswordVisibility() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async guardarCambios() {
    if (!this.editForm.valid) {
      alert('Formulario inválido, revisa los datos');
      return;
    }

    const valores = { ...this.editForm.value };

    // Edad a número solo si no vacío
    if (valores.edad !== undefined && valores.edad !== null && valores.edad !== '') {
      valores.edad = Number(valores.edad);
      if (isNaN(valores.edad)) {
        alert('La edad debe ser un número válido');
        return;
      }
    } else {
      delete valores.edad;
    }

    // No enviar password si está vacío
    if (!valores.password) {
      delete valores.password;
    }

    // Validar rol válido
    if (valores.rol && valores.rol !== 'admin' && valores.rol !== 'empleado') {
      alert('Rol inválido');
      return;
    }

    if (!this.usuarioEditandoId) {
      alert('No se ha seleccionado ningún usuario para editar.');
      return;
    }

    try {
      await firstValueFrom(this.userS.editarUsuario(this.usuarioEditandoId, valores));
      alert('Usuario actualizado correctamente');
      this.cancelarEdicion();
      await this.loadUsers();
    } catch (err: any) {
      console.error('Error al actualizar:', err);
      alert('Error al actualizar el usuario: ' + (err.error?.message || err.message || 'Error desconocido'));
    }
  }

  async eliminarUsuario(id: any) {
    // Convertir id a número y validar
    const idNum = Number(id);
    if (isNaN(idNum)) {
      alert('ID inválido');
      return;
    }

    if (!confirm('¿Deseas eliminar este usuario?')) return;

    try {
      await firstValueFrom(this.userS.eliminarUsuario(idNum));
      // Actualizar la lista local eliminando el usuario borrado
      this.usuarios = this.usuarios.filter(u => u.id !== idNum);
      alert('Usuario eliminado correctamente');
    } catch (err: any) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar el usuario: ' + (err.error?.message || err.message || 'Error desconocido'));
    }
  }
}
