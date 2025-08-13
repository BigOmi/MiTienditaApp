import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private usersUrl = `${environment.apiUrl}/usuarios`;
  private authUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Requiere JWT válido
        return false;
      }
      // Formato JWT: validar exp
      const payloadBase64 = parts[1];
      const payload = JSON.parse(atob(payloadBase64));
      const exp = (payload.exp ?? 0) * 1000; // exp en segundos
      if (!exp || Date.now() > exp) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      return true;
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
      const parsed = JSON.parse(user);
      // Actualiza el subject si difiere
      if (this.currentUserSubject.value?.id !== parsed?.id) {
        this.currentUserSubject.next(parsed);
      }
      return parsed;
    } catch {
      return null;
    }
  }

  login(email: string, password: string): Observable<{ user: any; token: string }> {
    // Usar primero el endpoint correcto del backend
    const attempts = [
      `${this.usersUrl}/login`,
      `${this.authUrl}/login`,
      `${environment.apiUrl}/login`,
      `${this.usersUrl}/signin`,
    ];

    const tryNext = (index: number): Observable<{ user: any; token: string }> => {
      if (index >= attempts.length) {
        return throwError(() => ({ status: 404, message: 'No se encontró endpoint de login' }));
      }
      const url = attempts[index];
      return this.http.post<{ user: any; token: string }>(url, { email, password }).pipe(
        catchError((err) => {
          if (err?.status === 404) {
            return tryNext(index + 1);
          }
          return throwError(() => err);
        })
      );
    };

    return tryNext(0);
  }

  crearUsuario(data: any): Observable<any> {
    return this.http.post<any>(this.usersUrl, data);
  }

  editarUsuario(id: number, data: any): Observable<any> {
    const user = this.getCurrentUser();
    const headers = new HttpHeaders({
      'x-rol': user?.rol || ''
    });
    return this.http.patch<any>(`${this.usersUrl}/${id}`, data, { headers });
  }

  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.usersUrl}/all`).pipe(
      catchError(() => this.http.get<any[]>(`${this.usersUrl}`))
    );
  }

  eliminarUsuario(id: number): Observable<any> {
    const user = this.getCurrentUser();
    const headers = new HttpHeaders({
      'x-rol': user?.rol || ''
    });
    return this.http.delete<any>(`${this.usersUrl}/${id}`, { headers });
  }

  logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.currentUserSubject.next(null);
    } catch {}
  }

  setCurrentUser(user: any) {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    } catch {}
  }
}
