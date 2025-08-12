import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  getProveedores(): Observable<any[]> {
    // Intenta /all si existe en tu API
    return this.http.get<any[]>(`${this.apiUrl}/all`).pipe(
      catchError(() => this.http.get<any[]>(this.apiUrl))
    );
  }

  getProveedor(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crearProveedor(data: any): Observable<any> {
    // Clonamos el objeto para no modificar el original
    const proveedorData = { ...data };
    // Eliminamos el campo activo para que lo maneje el backend
    delete proveedorData.activo;
    return this.http.post<any>(this.apiUrl, proveedorData);
  }

  actualizarProveedor(id: number, data: any): Observable<any> {
    // Aquí sí enviamos el campo activo junto con lo demás
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data);
  }

  eliminarProveedor(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
