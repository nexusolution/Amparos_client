import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PromocionService } from '../../services/promocion.service';
import { Promocion } from '../../interfaces/promocion.interface';

@Component({
  selector: 'app-promocion-form-page',
  templateUrl: './promocion-form-page.component.html',
  styleUrls: ['./promocion-form-page.component.css']
})
export class PromocionFormPageComponent implements OnInit {
  promocionForm: FormGroup;
  isEditMode = false;
  promocionId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private promocionService: PromocionService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.promocionForm = this.fb.group({
      fechaEnvio: ['', [Validators.required]],
      idAmparosPJ: ['', [Validators.required]],
      tipoCuaderno: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.promocionId = +params['id'];
        this.loadPromocion(this.promocionId);
      }
    });
  }

  loadPromocion(id: number): void {
    this.loading = true;
    this.promocionService.getById(id).subscribe({
      next: (response) => {
        if (response.success) {
          // Format date for input type="date"
          const data = response.data;
          if (data.fechaEnvio) {
            const date = new Date(data.fechaEnvio);
            data.fechaEnvio = date.toISOString().split('T')[0];
          }
          this.promocionForm.patchValue(data);
        } else {
          this.toastr.error(response.message || 'Error al cargar la promoción', 'Error');
          this.router.navigate(['/dashboard/promociones']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading promocion:', error);
        this.loading = false;
        this.toastr.error('No se pudo cargar la promoción. Intente nuevamente.', 'Error de Carga');
        this.router.navigate(['/dashboard/promociones']);
      }
    });
  }

  onSubmit(): void {
    if (this.promocionForm.invalid) {
      Object.keys(this.promocionForm.controls).forEach(key => {
        this.promocionForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Por favor complete todos los campos requeridos', 'Validación');
      return;
    }

    this.submitting = true;
    const formData = this.promocionForm.value;

    const request = this.isEditMode
      ? this.promocionService.update(this.promocionId!, formData)
      : this.promocionService.create(formData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(
            `Promoción ${this.isEditMode ? 'actualizada' : 'creada'} exitosamente`,
            'Éxito'
          );
          this.router.navigate(['/dashboard/promociones']);
        } else {
          this.toastr.error(response.message || 'Error al guardar la promoción', 'Error');
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error saving promocion:', error);
        this.submitting = false;
        this.toastr.error('No se pudo guardar la promoción. Intente nuevamente.', 'Error');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/promociones']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.promocionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.promocionForm.get(fieldName);
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
