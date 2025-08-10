import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { CategoriesService } from 'src/app/services/categories.service';

@Component({
  selector: 'app-new-categoria',
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
  templateUrl: './new-categoria.component.html',
  styleUrls: ['./new-categoria.component.scss'],
  standalone: true,
})
export class NewCategoriaComponent  implements OnInit {

  categoriaForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['']
    });
  }

  async crearCategoria() {
    if (this.categoriaForm.invalid) {
      this.mostrarAlerta('Error', 'Por favor completa los campos requeridos.');
      return;
    }

    this.loading = true;
    const categoriaData = this.categoriaForm.value;

    this.categoriesService.crearCategoria(categoriaData).subscribe({
      next: async () => {
        this.loading = false;
        await this.mostrarAlerta('Éxito', 'Categoría creada correctamente.');
        this.categoriaForm.reset();
      },
      error: async (err) => {
        this.loading = false;
        console.error(err);
        await this.mostrarAlerta('Error', 'No se pudo crear la categoría.');
      }
    });
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}
