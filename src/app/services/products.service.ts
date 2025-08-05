import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:3000/productos';

  constructor(private http: HttpClient) { }

  crearProducto(producto: any) {
    return this.http.post(this.apiUrl, producto);
  }

  editarProducto(id: number, producto: any) {
    return this.http.patch(`${this.apiUrl}/${id}`, producto);
  }

  obtenerProductos() {
    return this.http.get(`${this.apiUrl}/all`);
  }

  eliminarProducto(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
