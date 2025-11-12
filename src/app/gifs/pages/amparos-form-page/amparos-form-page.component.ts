import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AmparosService } from '../../services/amparos.service';
import { AmparosPJ } from '../../interfaces/amparos.interface';

@Component({
  selector: 'app-amparos-form-page',
  templateUrl: './amparos-form-page.component.html',
  styleUrls: ['./amparos-form-page.component.css']
})
export class AmparosFormPageComponent implements OnInit {
  amparosForm: FormGroup;
  isEditMode = false;
  amparoId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private amparosService: AmparosService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.amparosForm = this.fb.group({
      idExpediente: ['', [Validators.required]],
      idNotificacion: ['', [Validators.required]],
      numeroExpedienteDJ: ['', [Validators.required, Validators.maxLength(50)]],
      expedienteElectronico: [false],
      JUZGADO: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.amparoId = +params['id'];
        this.loadAmparo(this.amparoId);
      }
    });
  }

  loadAmparo(id: number): void {
    this.loading = true;
    this.amparosService.getById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.amparosForm.patchValue(response.data);
        } else {
          this.toastr.error(response.message || 'Error al cargar el amparo', 'Error');
          this.router.navigate(['/dashboard/amparos']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading amparo:', error);
        this.loading = false;
        this.toastr.error('No se pudo cargar el amparo. Intente nuevamente.', 'Error de Carga');
        this.router.navigate(['/dashboard/amparos']);
      }
    });
  }

  onSubmit(): void {
    if (this.amparosForm.invalid) {
      Object.keys(this.amparosForm.controls).forEach(key => {
        this.amparosForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Por favor complete todos los campos requeridos', 'Validación');
      return;
    }

    this.submitting = true;
    const formData = this.amparosForm.value;

    const request = this.isEditMode
      ? this.amparosService.update(this.amparoId!, formData)
      : this.amparosService.create(formData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(
            `Amparo ${this.isEditMode ? 'actualizado' : 'creado'} exitosamente`,
            'Éxito'
          );
          this.router.navigate(['/dashboard/amparos']);
        } else {
          this.toastr.error(response.message || 'Error al guardar el amparo', 'Error');
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error saving amparo:', error);
        this.submitting = false;
        this.toastr.error('No se pudo guardar el amparo. Intente nuevamente.', 'Error');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/amparos']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.amparosForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.amparosForm.get(fieldName);
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
