import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private apiUrl = 'http://localhost:3000/categorias';

  constructor(private http: HttpClient) { }

  crearCategoria(categoria: any) {
    return this.http.post(this.apiUrl, categoria);
  }

  editarCategoria(id: number, categoria: any) {
    return this.http.patch(`${this.apiUrl}/${id}`, categoria);
  }

  obtenerCategorias() {
    return this.http.get(`${this.apiUrl}/all`);
  }

  eliminarCategoria(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
