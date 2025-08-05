import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = 'http://localhost:3000/ventas';

  constructor(private http: HttpClient) { }

  crearVenta(venta: any) {
    return this.http.post(this.apiUrl, venta);
  }

  editarVenta(id: number, venta: any) {
    return this.http.patch(`${this.apiUrl}/${id}`, venta);
  }

  obtenerVentas() {
    return this.http.get(`${this.apiUrl}/all`);
  }

  eliminarVenta(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
}
