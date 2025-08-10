import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ProveedoresService } from 'src/app/services/proveedores.service';

@Component({
  selector: 'app-new-proveedor',
  imports: [ReactiveFormsModule, IonicModule],
  templateUrl: './new-proveedor.component.html',
  styleUrls: ['./new-proveedor.component.scss'],
  standalone: true
})
export class NewProveedorComponent  implements OnInit {

  proveedorForm!: FormGroup;
  esEdicion = false;
  proveedorId!: number;

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
  this.proveedorId = Number(this.route.snapshot.paramMap.get('id'));
  this.esEdicion = !!this.proveedorId;

  this.proveedorForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    edad: [null, [Validators.required, Validators.min(18)]],
    tipo_producto: ['', Validators.required],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    direccion: ['', Validators.required],
  });

  if (this.esEdicion) {
    this.proveedoresService.getProveedor(this.proveedorId).subscribe(data => {
      this.proveedorForm.patchValue(data);
    });
  }
}

  guardarProveedor() {
  const proveedor = this.proveedorForm.value; // Sin campo activo

  if (this.esEdicion) {
    this.proveedoresService.actualizarProveedor(this.proveedorId, proveedor).subscribe(() => {
      this.router.navigate(['/home/proveedores']);
    });
  } else {
    this.proveedoresService.crearProveedor(proveedor).subscribe(() => {
      this.router.navigate(['/home/proveedores']);
    });
  }
}

}
