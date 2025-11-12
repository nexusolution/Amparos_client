import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificacionService } from '../../services/notificacion.service';
import { ExpedienteService } from '../../services/expediente.service';
import { Notificacion } from '../../interfaces/notificacion.interface';
import { DocumentosNotificacion } from '../../interfaces/documentos-notificacion.interface';
import { PartesExpediente } from '../../interfaces/partes-expediente.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PdfViewerComponent } from '../../components/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-notificacion-registro-page',
  templateUrl: './notificacion-registro-page.component.html',
  styleUrls: ['./notificacion-registro-page.component.css']
})
export class NotificacionRegistroPageComponent implements OnInit, OnDestroy {
  notificacionForm: FormGroup;
  isEditMode = false;
  isViewMode = false;
  notificacionId: number | null = null;
  loading = false;
  submitting = false;

  // Related data
  expedientes: any[] = [];
  tiposAsunto: any[] = [];
  tiposDocumento: any[] = [];
  clasificacionesArchivo: any[] = [];

  // Documents and Partes
  documentos: DocumentosNotificacion[] = [];
  partes: PartesExpediente[] = [];

  // Temporary form for adding partes
  showPartesForm = false;
  parteForm: FormGroup;

  // Temporary form for adding documents
  showDocumentForm = false;
  documentForm: FormGroup;
  selectedFiles: File[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private notificacionService: NotificacionService,
    private expedienteService: ExpedienteService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {
    this.notificacionForm = this.fb.group({
      fechaEnvio: ['', [Validators.required]],
      organoImpartidorJusticia: ['', [Validators.required]],
      tipoMedioNotificacion: ['', [Validators.required, Validators.maxLength(100)]],
      idExpediente: ['', [Validators.required]],
      idTipoAsunto: ['', [Validators.required]],
      // Amparo fields (will be handled separately)
      numeroExpedienteDJ: [''],
      expedienteElectronico: [false],
      juzgado: ['']
    });

    this.parteForm = this.fb.group({
      nombreCompleto: ['', [Validators.required]],
      nombre: [''],
      apPaterno: [''],
      apMaterno: [''],
      caracter: ['', [Validators.required]],
      tipoPersona: ['', [Validators.required]],
      personaJuridica: ['']
    });

    this.documentForm = this.fb.group({
      nombre: ['', [Validators.required]],
      idClasificacionArchivo: ['', [Validators.required]],
      firmado: [false]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.checkRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkRouteParams(): void {
    this.route.params.subscribe(params => {
      const mode = this.route.snapshot.url[0]?.path;

      if (params['id']) {
        this.notificacionId = +params['id'];

        if (mode === 'ver') {
          this.isViewMode = true;
          this.isEditMode = false;
          this.notificacionForm.disable();
        } else if (mode === 'editar') {
          this.isEditMode = true;
          this.isViewMode = false;
        }

        this.loadNotificacion(this.notificacionId);
      }
    });
  }

  loadInitialData(): void {
    // Load expedientes
    this.expedienteService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.expedientes = response.data || [];
          }
        },
        error: (error) => {
          console.error('Error loading expedientes:', error);
        }
      });

    // Load tipos de asunto (mock data for now)
    this.tiposAsunto = [
      { idTipoAsunto: 1, descripcion: 'Amparo Directo' },
      { idTipoAsunto: 2, descripcion: 'Amparo Indirecto' },
      { idTipoAsunto: 3, descripcion: 'Recurso de Revisión' }
    ];

    // Load clasificaciones de archivo (mock data for now)
    this.clasificacionesArchivo = [
      { idClasificacionArchivo: 1, descripcion: 'Acuerdo' },
      { idClasificacionArchivo: 2, descripcion: 'Sentencia' },
      { idClasificacionArchivo: 3, descripcion: 'Promoción' },
      { idClasificacionArchivo: 4, descripcion: 'Oficio' }
    ];
  }

  loadNotificacion(id: number): void {
    this.loading = true;
    this.notificacionService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            const notif = response.data;
            this.populateForm(notif);
            this.documentos = notif.documentosNotificacion || [];
            this.partes = notif.partesExpediente || [];
          } else {
            this.toastr.error(response.message || 'Error al cargar la notificación', 'Error');
            this.router.navigate(['/dashboard/notificaciones']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading notificacion:', error);
          this.loading = false;
          this.toastr.error('No se pudo cargar la notificación. Intente nuevamente.', 'Error de Carga');
          this.router.navigate(['/dashboard/notificaciones']);
        }
      });
  }

  populateForm(notificacion: Notificacion): void {
    this.notificacionForm.patchValue({
      fechaEnvio: this.formatDateForInput(notificacion.fechaEnvio),
      organoImpartidorJusticia: notificacion.organoImpartidorJusticia,
      tipoMedioNotificacion: notificacion.tipoMedioNotificacion,
      idExpediente: notificacion.idExpediente,
      idTipoAsunto: notificacion.idTipoAsunto
    });

    // Populate amparo data if exists
    if (notificacion.amparosPJ && notificacion.amparosPJ.length > 0) {
      const amparo = notificacion.amparosPJ[0];
      this.notificacionForm.patchValue({
        numeroExpedienteDJ: amparo.numeroExpedienteDJ,
        expedienteElectronico: amparo.expedienteElectronico,
        juzgado: amparo.JUZGADO
      });
    }
  }

  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Partes Management
  togglePartesForm(): void {
    this.showPartesForm = !this.showPartesForm;
    if (!this.showPartesForm) {
      this.parteForm.reset();
    }
  }

  addParte(): void {
    if (this.parteForm.invalid) {
      Object.keys(this.parteForm.controls).forEach(key => {
        this.parteForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Complete todos los campos requeridos', 'Validación');
      return;
    }

    const parteData = this.parteForm.value;
    this.partes.push(parteData);
    this.parteForm.reset();
    this.showPartesForm = false;
    this.toastr.success('Parte agregada exitosamente', 'Éxito');
  }

  removeParte(index: number): void {
    this.partes.splice(index, 1);
    this.toastr.info('Parte eliminada', 'Información');
  }

  // Documents Management
  toggleDocumentForm(): void {
    this.showDocumentForm = !this.showDocumentForm;
    if (!this.showDocumentForm) {
      this.documentForm.reset();
      this.selectedFiles = [];
    }
  }

  onFilesSelected(files: any[]): void {
    // Handle files from document-upload component
    this.selectedFiles = files;
  }

  addDocument(): void {
    if (this.documentForm.invalid) {
      Object.keys(this.documentForm.controls).forEach(key => {
        this.documentForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Complete todos los campos requeridos', 'Validación');
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.toastr.warning('Seleccione al menos un archivo', 'Validación');
      return;
    }

    // Convert files to base64 and add to documents array
    this.selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const documento: any = {
          ...this.documentForm.value,
          extension: file.name.split('.').pop(),
          longitud: file.size.toString(),
          fileBase64: base64,
          nombreArchivo: file.name
        };
        this.documentos.push(documento);
      };
      reader.readAsDataURL(file);
    });

    this.documentForm.reset();
    this.selectedFiles = [];
    this.showDocumentForm = false;
    this.toastr.success('Documento(s) agregado(s) exitosamente', 'Éxito');
  }

  removeDocument(index: number): void {
    this.documentos.splice(index, 1);
    this.toastr.info('Documento eliminado', 'Información');
  }

  downloadDocument(documento: any): void {
    if (documento.fileBase64) {
      // Check if it's a PDF to open in viewer
      const extension = (documento.extension || '').toLowerCase().replace('.', '');
      if (extension === 'pdf') {
        this.viewDocumentPdf(documento);
      } else {
        // Download non-PDF files
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${documento.fileBase64}`;
        link.download = documento.nombreArchivo || `documento.${documento.extension}`;
        link.click();
        this.toastr.success('Descargando documento...', 'Descarga');
      }
    } else {
      this.toastr.warning('No se puede descargar este documento', 'Advertencia');
    }
  }

  viewDocumentPdf(documento: any): void {
    const modalRef = this.modalService.open(PdfViewerComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.pdfBase64 = documento.fileBase64;
    modalRef.componentInstance.fileName = documento.nombreArchivo || `documento.${documento.extension}`;
    modalRef.componentInstance.title = `Vista Previa - ${documento.nombre || 'Documento'}`;
  }

  // Form Submission
  onSubmit(): void {
    if (this.notificacionForm.invalid) {
      Object.keys(this.notificacionForm.controls).forEach(key => {
        this.notificacionForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Por favor complete todos los campos requeridos', 'Validación');
      return;
    }

    this.submitting = true;
    const formData = this.prepareFormData();

    const request = this.isEditMode
      ? this.notificacionService.update(this.notificacionId!, formData)
      : this.notificacionService.create(formData);

    request.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success(
              `Notificación ${this.isEditMode ? 'actualizada' : 'creada'} exitosamente`,
              'Éxito'
            );
            this.router.navigate(['/dashboard/notificaciones']);
          } else {
            this.toastr.error(response.message || 'Error al guardar la notificación', 'Error');
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error saving notificacion:', error);
          this.submitting = false;
          this.toastr.error('No se pudo guardar la notificación. Intente nuevamente.', 'Error');
        }
      });
  }

  prepareFormData(): any {
    const formValue = this.notificacionForm.value;

    const data: any = {
      fechaEnvio: formValue.fechaEnvio,
      organoImpartidorJusticia: formValue.organoImpartidorJusticia,
      tipoMedioNotificacion: formValue.tipoMedioNotificacion,
      idExpediente: formValue.idExpediente,
      idTipoAsunto: formValue.idTipoAsunto,
      documentos: this.documentos,
      partes: this.partes
    };

    // Add amparo data if provided
    if (formValue.numeroExpedienteDJ) {
      data.amparo = {
        numeroExpedienteDJ: formValue.numeroExpedienteDJ,
        expedienteElectronico: formValue.expedienteElectronico,
        JUZGADO: formValue.juzgado
      };
    }

    return data;
  }

  onCancel(): void {
    if (this.notificacionForm.dirty && !this.isViewMode) {
      if (confirm('¿Está seguro que desea cancelar? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/dashboard/notificaciones']);
      }
    } else {
      this.router.navigate(['/dashboard/notificaciones']);
    }
  }

  onEdit(): void {
    if (this.isViewMode && this.notificacionId) {
      this.router.navigate(['/dashboard/notificaciones/editar', this.notificacionId]);
    }
  }

  // Helper methods
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.notificacionForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.notificacionForm): string {
    const field = formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Email inválido';
    }
    return '';
  }

  getExpedienteLabel(expediente: any): string {
    return `${expediente.expedienteCJF} - ${expediente.origen || ''}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
