import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));

      // exp viene en segundos → convertir a milisegundos
      const exp = payload.exp * 1000;
      const now = Date.now();

      if (now > exp) {
        // Token vencido → limpiar storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }

      return true; // Token válido
    } catch (error) {
      // Token inválido o corrupto
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
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

  login(email: string, password: string): Observable<{ user: any; token: string }> {
    return this.http.post<{ user: any; token: string }>(`${this.apiUrl}/login`, { email, password });
  }

  crearUsuario(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  editarUsuario(id: number, data: any): Observable<any> {
    const user = this.getCurrentUser();
    const headers = new HttpHeaders({
      'x-rol': user?.rol || ''
    });
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data, { headers });
  }

  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  eliminarUsuario(id: number): Observable<any> {
    const user = this.getCurrentUser();
    const headers = new HttpHeaders({
      'x-rol': user?.rol || ''
    });
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
