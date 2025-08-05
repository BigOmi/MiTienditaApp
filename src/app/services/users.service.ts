import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient) { }

  crearUsuario(usuario: any) {
    return this.http.post(this.apiUrl, usuario);
  }

  editarUsuario(id: number, usuario: any) {
    return this.http.patch(`${this.apiUrl}/${id}`, usuario);
  }

  obtenerUsuarios() {
    return this.http.get(`${this.apiUrl}/all`);
  }

  eliminarUsuario(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
