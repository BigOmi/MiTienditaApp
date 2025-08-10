import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = `${environment.apiUrl}/compras`;
  private detalleApiUrl = `${environment.apiUrl}/detalle-compras`;  // URL detalles compra

  constructor(private http: HttpClient) {}

  crearCompra(compra: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, compra);
  }

  editarCompra(id: number, compra: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, compra);
  }

  obtenerCompras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  eliminarCompra(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // ==== Métodos para detalles de compra ====

  obtenerDetallesCompra(): Observable<any[]> {
    return this.http.get<any[]>(this.detalleApiUrl);
  }

  crearDetalleCompra(detalle: any): Observable<any> {
    return this.http.post<any>(this.detalleApiUrl, detalle);
  }
}
