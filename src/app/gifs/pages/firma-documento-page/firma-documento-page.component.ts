import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { DocumentosNotificacionService } from '../../services/documentos-notificacion.service';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-firma-documento-page',
  templateUrl: './firma-documento-page.component.html',
  styleUrls: ['./firma-documento-page.component.css']
})
export class FirmaDocumentoPageComponent implements OnInit {
  firmaForm: FormGroup;
  notificaciones: any[] = [];
  documentos: any[] = [];
  selectedNotificacion: any = null;
  selectedDocumento: any = null;
  loading = false;
  submitting = false;
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private documentosService: DocumentosNotificacionService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.firmaForm = this.fb.group({
      idNotificacion: ['', Validators.required],
      idDocumento: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      observaciones: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.checkAdminAccess();
    this.loadNotificaciones();
  }

  private checkAdminAccess(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.perfil?.nombre?.toLowerCase() === 'administrador';

    if (!this.isAdmin) {
      this.toastr.error('Solo los administradores pueden firmar documentos', 'Acceso Denegado');
      this.router.navigate(['/dashboard']);
    }
  }

  loadNotificaciones(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();

    const request = currentUser?.organoImpartidorJusticia
      ? this.notificacionService.getByOrgano(currentUser.organoImpartidorJusticia)
      : this.notificacionService.getAll();

    request.subscribe({
      next: (response) => {
        if (response.success) {
          // Filter notifications that have documents
          this.notificaciones = (response.data || []).filter(
            (n: any) => n.documentosNotificacion && n.documentosNotificacion.length > 0
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notificaciones:', error);
        this.toastr.error('Error al cargar las notificaciones', 'Error');
        this.loading = false;
      }
    });
  }

  onNotificacionChange(): void {
    const idNotificacion = this.firmaForm.get('idNotificacion')?.value;
    if (idNotificacion) {
      this.selectedNotificacion = this.notificaciones.find(n => n.idNotificacion == idNotificacion);
      this.documentos = this.selectedNotificacion?.documentosNotificacion || [];

      // Reset documento selection
      this.firmaForm.patchValue({ idDocumento: '' });
      this.selectedDocumento = null;
    }
  }

  onDocumentoChange(): void {
    const idDocumento = this.firmaForm.get('idDocumento')?.value;
    if (idDocumento) {
      this.selectedDocumento = this.documentos.find(d => d.idDocumentoNotificacion == idDocumento);

      // Check if already signed
      if (this.selectedDocumento?.firmado) {
        this.toastr.warning('Este documento ya ha sido firmado', 'Advertencia');
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.firmaForm.invalid) {
      Object.keys(this.firmaForm.controls).forEach(key => {
        this.firmaForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Complete todos los campos requeridos', 'Validación');
      return;
    }

    if (this.selectedDocumento?.firmado) {
      this.toastr.error('Este documento ya está firmado', 'Error');
      return;
    }

    // Validate password (simple validation - in production you'd verify against user's password)
    const password = this.firmaForm.get('password')?.value;
    if (password.length < 6) {
      this.toastr.error('La contraseña debe tener al menos 6 caracteres', 'Error');
      return;
    }

    this.submitting = true;

    try {
      const currentUser = this.authService.getCurrentUser();
      const documentBase64 = this.selectedDocumento.fileBase64;

      // Generate document hash (SHA-256)
      const hashDocumento = await this.generateDocumentHash(documentBase64);

      // Prepare signature data
      const signatureData = {
        idDocumentoNotificacion: this.selectedDocumento.idDocumentoNotificacion,
        firmadoPor: currentUser?.idUsuario || '',
        nombreFirmante: `${currentUser?.nombre || ''} ${currentUser?.apPaterno || ''} ${currentUser?.apMaterno || ''}`.trim(),
        fechaFirmado: new Date().toISOString(),
        hashDocumentoOriginal: hashDocumento,
        observaciones: this.firmaForm.get('observaciones')?.value || '',
        // Simple signature proof: user + timestamp + hash
        pkcs7Base64: this.generateSimpleSignature(currentUser, hashDocumento)
      };

      // Send to backend to update document
      this.documentosService.firmarDocumento(signatureData).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success(
              'Documento firmado exitosamente',
              'Firma Electrónica',
              { timeOut: 5000 }
            );
            this.resetForm();
            this.loadNotificaciones();
          } else {
            this.toastr.error(response.message || 'Error al firmar documento', 'Error');
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error signing document:', error);
          this.toastr.error('Error al firmar el documento', 'Error');
          this.submitting = false;
        }
      });
    } catch (error) {
      console.error('Error processing signature:', error);
      this.toastr.error('Error al procesar la firma', 'Error');
      this.submitting = false;
    }
  }

  private async generateDocumentHash(base64Data: string): Promise<string> {
    // Remove data URL prefix if present
    const cleanBase64 = base64Data.replace(/^data:.*;base64,/, '');

    // Convert base64 to binary
    const binaryString = window.atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  }

  private generateSimpleSignature(user: any, documentHash: string): string {
    // Create a simple signature record with user info + timestamp + hash
    const signatureData = {
      usuario: user.usuario,
      nombre: `${user.nombre} ${user.apPaterno} ${user.apMaterno}`,
      idUsuario: user.idUsuario,
      organo: user.organoImpartidorJusticia,
      timestamp: new Date().toISOString(),
      documentHash: documentHash,
      version: '1.0'
    };

    // Convert to base64 (this is not cryptographic signing, just a record)
    return btoa(JSON.stringify(signatureData));
  }

  resetForm(): void {
    this.firmaForm.reset();
    this.selectedNotificacion = null;
    this.selectedDocumento = null;
    this.documentos = [];
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  getNotificacionLabel(notif: any): string {
    const folio = notif.expediente?.expedienteCJF || 'N/A';
    const fecha = new Date(notif.fechaEnvio).toLocaleDateString('es-MX');
    return `Folio: ${folio} - Fecha: ${fecha}`;
  }

  getDocumentoLabel(doc: any): string {
    const firmado = doc.firmado ? ' ✓ FIRMADO' : '';
    return `${doc.nombre}${firmado}`;
  }

  isDocumentoFirmado(doc: any): boolean {
    return doc?.firmado === true;
  }
}
