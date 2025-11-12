import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ExpedienteService } from '../../services/expediente.service';
import { Expediente } from '../../interfaces/expediente.interface';

@Component({
  selector: 'app-expediente-form-page',
  templateUrl: './expediente-form-page.component.html',
  styleUrls: ['./expediente-form-page.component.css']
})
export class ExpedienteFormPageComponent implements OnInit {
  expedienteForm: FormGroup;
  isEditMode = false;
  expedienteId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private expedienteService: ExpedienteService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.expedienteForm = this.fb.group({
      expedienteCJF: ['', [Validators.required, Validators.maxLength(50)]],
      tipoDocumento: ['', [Validators.required]],
      tipoSubNivel: ['', [Validators.required]],
      tipoMateria: ['', [Validators.required]],
      idOrganoOrigen: ['', [Validators.required]],
      origen: ['', [Validators.required, Validators.maxLength(100)]],
      expedienteElectronico: [false],
      UHEE: ['', [Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.expedienteId = +params['id'];
        this.loadExpediente(this.expedienteId);
      }
    });
  }

  loadExpediente(id: number): void {
    this.loading = true;
    this.expedienteService.getById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.expedienteForm.patchValue(response.data);
        } else {
          this.toastr.error(response.message || 'Error al cargar el expediente', 'Error');
          this.router.navigate(['/dashboard/expedientes']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading expediente:', error);
        this.loading = false;
        this.toastr.error('No se pudo cargar el expediente. Intente nuevamente.', 'Error de Carga');
        this.router.navigate(['/dashboard/expedientes']);
      }
    });
  }

  onSubmit(): void {
    if (this.expedienteForm.invalid) {
      Object.keys(this.expedienteForm.controls).forEach(key => {
        this.expedienteForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Por favor complete todos los campos requeridos', 'Validación');
      return;
    }

    this.submitting = true;
    const formData = this.expedienteForm.value;

    const request = this.isEditMode
      ? this.expedienteService.update(this.expedienteId!, formData)
      : this.expedienteService.create(formData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(
            `Expediente ${this.isEditMode ? 'actualizado' : 'creado'} exitosamente`,
            'Éxito'
          );
          this.router.navigate(['/dashboard/expedientes']);
        } else {
          this.toastr.error(response.message || 'Error al guardar el expediente', 'Error');
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error saving expediente:', error);
        this.submitting = false;
        this.toastr.error('No se pudo guardar el expediente. Intente nuevamente.', 'Error');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/expedientes']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.expedienteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.expedienteForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    return '';
  }
}
