import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentosNotificacion } from '../../interfaces/documentos-notificacion.interface';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent {
  @Input() documents: any[] = [];
  @Input() viewMode: boolean = false;
  @Output() deleteDocument = new EventEmitter<number>();
  @Output() downloadDocument = new EventEmitter<number>();
  @Output() viewDocument = new EventEmitter<number>();

  onDelete(index: number): void {
    if (confirm('¿Está seguro que desea eliminar este documento?')) {
      this.deleteDocument.emit(index);
    }
  }

  onDownload(index: number): void {
    this.downloadDocument.emit(index);
  }

  onView(index: number): void {
    this.viewDocument.emit(index);
  }

  formatFileSize(bytes: number | string): string {
    const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (!size || size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return Math.round(size / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(extension: string): string {
    const ext = extension?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '#ef4444'; // Red
      case 'doc':
      case 'docx':
        return '#3b82f6'; // Blue
      case 'xls':
      case 'xlsx':
        return '#10b981'; // Green
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '#f59e0b'; // Orange
      default:
        return '#6b7280'; // Gray
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
