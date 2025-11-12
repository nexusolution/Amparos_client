import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PartesExpedienteService } from '../../services/partes-expediente.service';
import { PartesExpediente } from '../../interfaces/partes-expediente.interface';

@Component({
  selector: 'app-partes-expediente-form-page',
  templateUrl: './partes-expediente-form-page.component.html',
  styleUrls: ['./partes-expediente-form-page.component.css']
})
export class PartesExpedienteFormPageComponent implements OnInit {
  partesForm: FormGroup;
  isEditMode = false;
  parteId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private partesExpedienteService: PartesExpedienteService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.partesForm = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.maxLength(200)]],
      caracter: ['', [Validators.required, Validators.maxLength(50)]],
      tipoPersona: ['', [Validators.required, Validators.maxLength(50)]],
      personaJuridica: ['', [Validators.maxLength(200)]],
      idExpediente: ['', [Validators.required]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apPaterno: ['', [Validators.required, Validators.maxLength(100)]],
      apMaterno: ['', [Validators.maxLength(100)]],
      idCaracter: ['', [Validators.required]],
      idTipoPersona: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.parteId = +params['id'];
        this.loadParte(this.parteId);
      }
    });
  }

  loadParte(id: number): void {
    this.loading = true;
    this.partesExpedienteService.getById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.partesForm.patchValue(response.data);
        } else {
          this.toastr.error(response.message || 'Error al cargar la parte', 'Error');
          this.router.navigate(['/dashboard/partes-expediente']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading parte:', error);
        this.loading = false;
        this.toastr.error('No se pudo cargar la parte. Intente nuevamente.', 'Error de Carga');
        this.router.navigate(['/dashboard/partes-expediente']);
      }
    });
  }

  onSubmit(): void {
    if (this.partesForm.invalid) {
      Object.keys(this.partesForm.controls).forEach(key => {
        this.partesForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Por favor complete todos los campos requeridos', 'Validación');
      return;
    }

    this.submitting = true;
    const formData = this.partesForm.value;

    const request = this.isEditMode
      ? this.partesExpedienteService.update(this.parteId!, formData)
      : this.partesExpedienteService.create(formData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(
            `Parte ${this.isEditMode ? 'actualizada' : 'creada'} exitosamente`,
            'Éxito'
          );
          this.router.navigate(['/dashboard/partes-expediente']);
        } else {
          this.toastr.error(response.message || 'Error al guardar la parte', 'Error');
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error saving parte:', error);
        this.submitting = false;
        this.toastr.error('No se pudo guardar la parte. Intente nuevamente.', 'Error');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/partes-expediente']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.partesForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.partesForm.get(fieldName);
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
