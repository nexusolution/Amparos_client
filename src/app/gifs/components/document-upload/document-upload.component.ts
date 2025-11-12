import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent {
  @Input() maxSize: number = 10485760; // 10MB default
  @Input() acceptedTypes: string[] = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  @Input() multiple: boolean = true;
  @Output() filesSelected = new EventEmitter<File[]>();

  selectedFiles: File[] = [];
  isDragging = false;
  uploadProgress: number = 0;

  constructor(private toastr: ToastrService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  handleFiles(files: File[]): void {
    const validFiles: File[] = [];

    for (const file of files) {
      // Validate file size
      if (file.size > this.maxSize) {
        this.toastr.error(
          `El archivo "${file.name}" excede el tamaño máximo de ${this.formatFileSize(this.maxSize)}`,
          'Archivo Muy Grande'
        );
        continue;
      }

      // Validate file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (this.acceptedTypes.length > 0 && !this.acceptedTypes.includes(fileExtension)) {
        this.toastr.error(
          `El archivo "${file.name}" no es un tipo de archivo permitido`,
          'Tipo de Archivo No Válido'
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      if (this.multiple) {
        this.selectedFiles = [...this.selectedFiles, ...validFiles];
      } else {
        this.selectedFiles = [validFiles[0]];
      }
      this.filesSelected.emit(this.selectedFiles);
      this.toastr.success(
        `${validFiles.length} archivo(s) seleccionado(s)`,
        'Archivos Agregados'
      );
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.filesSelected.emit(this.selectedFiles);
    this.toastr.info('Archivo eliminado', 'Información');
  }

  clearFiles(): void {
    this.selectedFiles = [];
    this.filesSelected.emit(this.selectedFiles);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'file-text';
      case 'doc':
      case 'docx':
        return 'file-text';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      default:
        return 'file';
    }
  }
}
