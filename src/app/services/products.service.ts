import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  crearProducto(producto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, producto);
  }

  editarProducto(id: number, producto: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    // Limpiar payload de valores undefined
    const cleanPayload: any = {};
    Object.keys(producto).forEach(key => {
      if (producto[key] !== undefined) cleanPayload[key] = producto[key];
    });
    return this.http.patch<any>(url, cleanPayload);
  }

  obtenerProductos(): Observable<any[]> {
    // Intenta /all y si no existe, cae a la ruta base
    return this.http.get<any[]>(`${this.apiUrl}/all`).pipe(
      catchError(() => this.http.get<any[]>(`${this.apiUrl}`))
    );
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
