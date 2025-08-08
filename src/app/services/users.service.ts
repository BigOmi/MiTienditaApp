import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class UsersService {
  private readonly apiUrl = 'http://localhost:3000/usuarios';

  constructor(private readonly http: HttpClient) { }

  // Verifica si hay token guardado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): any | null {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  login(email: string, password: string) {
    return this.http.post<{ user: any; token: string }>(`${this.apiUrl}/login`, { email, password });
  }

  crearUsuario(usuario: any) {
    return this.http.post<any>(this.apiUrl, usuario);
  }

  editarUsuario(id: number, usuario: any) {
    const user = this.getCurrentUser();
    const headers = new HttpHeaders({
      'x-rol': user?.rol || ''
    });
    return this.http.patch<any>(`${this.apiUrl}/${id}`, usuario, { headers });
  }

  obtenerUsuarios() {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  eliminarUsuario(id: number) {
    const user = this.getCurrentUser();
    const headers = new HttpHeaders({
      'x-rol': user?.rol || ''
    });
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
