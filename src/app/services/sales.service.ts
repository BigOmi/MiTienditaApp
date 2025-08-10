import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  crearVenta(venta: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, venta);
  }

  editarVenta(id: number, venta: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, venta);
  }

  obtenerVentas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  eliminarVenta(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
