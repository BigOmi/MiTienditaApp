import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { UsersService } from 'src/app/services/users.service';

@Component({
  standalone: false,
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
})
export class TrabajadoresPage implements OnInit {

  constructor(
    private router: Router,
    private userS: UsersService,
    private fb: FormBuilder
  ) {}

  busqueda: string = '';
  filtroRol: string = '';
  usuarios: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  usuarioEditandoId: number | null = null;
  usuarioEditando: any = null;
  mostrarPassword: boolean = false;
  editForm!: FormGroup;

  async ngOnInit() {
    this.initForm();
    await this.loadUsers();
  }

  initForm() {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      edad: ['', Validators.required],
      rol: ['', Validators.required],
      imagen: [''],
      contraseña: ['']
    });
  }

  async loadUsers() {
    this.loading = true;
    this.error = null;

    try {
      const response = await firstValueFrom(this.userS.obtenerUsuarios());
      this.usuarios = response as any[] || [];
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
        usuario.apellido.toLowerCase().includes(terminoBusquedaLower) ||
        usuario.email.toLowerCase().includes(terminoBusquedaLower)
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
      ...usuario,
      contraseña: ''
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
    if (this.editForm.invalid || !this.usuarioEditando) return;

    const valores = { ...this.editForm.value };
    if (!valores.contraseña) {
      delete valores.contraseña;
    }

    try {
      await firstValueFrom(this.userS.editarUsuario(this.usuarioEditando.id, valores));
      alert('Usuario actualizado correctamente');
      this.cancelarEdicion();
      await this.loadUsers();
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('Error al actualizar el usuario');
    }
  }

  async eliminarUsuario(id: number) {
    if (!confirm('¿Deseas eliminar este usuario?')) return;

    try {
      await firstValueFrom(this.userS.eliminarUsuario(id));
      this.usuarios = this.usuarios.filter(u => u.id !== id);
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar el usuario');
    }
  }
}
