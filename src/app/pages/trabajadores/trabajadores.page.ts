import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
})
export class TrabajadoresPage implements OnInit {

  constructor(private router: Router) {}

  busqueda: string = '';
  filtroRol: string = '';

  usuarios = [
    {
      id: 1,
      nombre: 'Carlos',
      apellido: 'López',
      imagen: 'https://i.pravatar.cc/150?img=1',
      edad: 30,
      email: 'carlos@example.com',
      rol: 'admin',
      created_at: new Date('2022-01-01'),
    },
    {
      id: 2,
      nombre: 'María',
      apellido: 'Gómez',
      imagen: 'https://i.pravatar.cc/150?img=2',
      edad: 25,
      email: 'maria@example.com',
      rol: 'empleado',
      created_at: new Date('2022-02-01'),
    },
    {
      id: 3,
      nombre: 'Juan',
      apellido: 'Pérez',
      imagen: 'https://i.pravatar.cc/150?img=3',
      edad: 40,
      email: 'juan@example.com',
      rol: 'admin',
      created_at: new Date('2022-03-01'),
    },
    {
      id: 4,
      nombre: 'Ana',
      apellido: 'García',
      imagen: 'https://i.pravatar.cc/150?img=4',
      edad: 28,
      email: 'ana@example.com',
      rol: 'empleado',
      created_at: new Date('2022-04-01'),
    },
    {
      id: 5,
      nombre: 'Luis',
      apellido: 'Martínez',
      imagen: 'https://i.pravatar.cc/150?img=5',
      edad: 35,
      email: 'luis@example.com',
      rol: 'admin',
      created_at: new Date('2022-05-01'),
    },
    {
      id: 6,
      nombre: 'Sofía',
      apellido: 'Rodríguez',
      imagen: 'https://i.pravatar.cc/150?img=6',
      edad: 22,
      email: 'sofia@example.com',
      rol: 'empleado',
      created_at: new Date('2022-06-01'),
    },
    {
      id: 7,
      nombre: 'Alejandro',
      apellido: 'Hernández',
      imagen: 'https://i.pravatar.cc/150?img=7',
      edad: 38,
      email: 'alejandro@example.com',
      rol: 'admin',
      created_at: new Date('2022-07-01'),
    },
    {
      id: 8,
      nombre: 'Valeria',
      apellido: 'González',
      imagen: 'https://i.pravatar.cc/150?img=8',
      edad: 29,
      email: 'valeria@example.com',
      rol: 'empleado',
      created_at: new Date('2022-08-01'),
    },
  ];

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

  ngOnInit() {
  }

}
