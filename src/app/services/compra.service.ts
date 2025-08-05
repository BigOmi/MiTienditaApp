import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = 'http://localhost:3000/compras';

  constructor(private http: HttpClient) { }

  crearCompra(compra: any) {
    return this.http.post(this.apiUrl, compra);
  }

  editarCompra(id: number, compra: any) {
    return this.http.patch(`${this.apiUrl}/${id}`, compra);
  }

  obtenerCompras() {
    return this.http.get(`${this.apiUrl}/all`);
  }

  eliminarCompra(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
}
