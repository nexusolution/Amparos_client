import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent {
  @Input() pdfBase64: string = '';
  @Input() fileName: string = 'document.pdf';
  @Input() title: string = 'Visualizador de PDF';

  pdfUrl: SafeResourceUrl | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadPdf();
  }

  private loadPdf(): void {
    try {
      if (!this.pdfBase64) {
        this.error = 'No se proporcionó un archivo PDF';
        this.loading = false;
        return;
      }

      // Remove data URL prefix if present
      const base64Data = this.pdfBase64.replace(/^data:application\/pdf;base64,/, '');

      // Create blob URL from base64
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.loading = false;
    } catch (error) {
      console.error('Error loading PDF:', error);
      this.error = 'Error al cargar el PDF. El archivo puede estar corrupto.';
      this.loading = false;
    }
  }

  downloadPdf(): void {
    try {
      const base64Data = this.pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${base64Data}`;
      link.download = this.fileName;
      link.click();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  }

  openInNewTab(): void {
    try {
      const base64Data = this.pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening PDF:', error);
    }
  }

  close(): void {
    this.activeModal.close();
  }
}
