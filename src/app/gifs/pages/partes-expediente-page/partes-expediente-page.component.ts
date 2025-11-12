import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PartesExpedienteService } from '../../services/partes-expediente.service';
import { PartesExpediente } from '../../interfaces/partes-expediente.interface';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-partes-expediente-page',
  templateUrl: './partes-expediente-page.component.html',
  styleUrls: ['./partes-expediente-page.component.css']
})
export class PartesExpedientePageComponent implements OnInit {
  partes: PartesExpediente[] = [];
  filteredPartes: PartesExpediente[] = [];
  loading = false;
  searchTerm = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private partesExpedienteService: PartesExpedienteService,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.partesExpedienteService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.partes = response.data;
          this.filteredPartes = this.partes;
          this.totalItems = this.partes.length;
        } else {
          this.toastr.error(response.message || 'Error al cargar partes del expediente', 'Error');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading partes expediente:', error);
        this.loading = false;
        this.toastr.error('No se pudieron cargar las partes del expediente. Intente nuevamente.', 'Error de Carga');
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    if (!this.searchTerm.trim()) {
      this.filteredPartes = this.partes;
      this.totalItems = this.partes.length;
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredPartes = this.partes.filter(parte =>
      parte.nombreCompleto?.toLowerCase().includes(searchLower) ||
      parte.nombre?.toLowerCase().includes(searchLower) ||
      parte.apPaterno?.toLowerCase().includes(searchLower) ||
      parte.apMaterno?.toLowerCase().includes(searchLower) ||
      parte.caracter?.toLowerCase().includes(searchLower) ||
      parte.personaJuridica?.toLowerCase().includes(searchLower)
    );
    this.totalItems = this.filteredPartes.length;
  }

  onCreate(): void {
    this.router.navigate(['/dashboard/partes/nuevo']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/dashboard/partes/editar', id]);
  }

  onDelete(id: number): void {
    const parte = this.partes.find(p => p.idParte === id);
    if (!parte) return;

    const modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Eliminar Parte';
    modalRef.componentInstance.message = `¿Está seguro de que desea eliminar la parte "${parte.nombreCompleto}"?`;
    modalRef.componentInstance.confirmText = 'Eliminar';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger-modern';
    modalRef.componentInstance.icon = 'warning';

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.partesExpedienteService.delete(id).subscribe({
            next: (response) => {
              if (response.success) {
                this.toastr.success('Parte eliminada exitosamente', 'Eliminada');
                this.loadData();
              } else {
                this.toastr.error(response.message || 'Error al eliminar la parte', 'Error');
              }
            },
            error: (error) => {
              console.error('Error deleting parte:', error);
              this.toastr.error('No se pudo eliminar la parte. Intente nuevamente.', 'Error');
            }
          });
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  // Pagination helpers
  get paginatedPartes(): PartesExpediente[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPartes.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5; // Show maximum 5 page numbers

    if (total <= maxVisible) {
      // If total pages <= 5, show all pages
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // Calculate start and end page numbers to show
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    // Adjust if end exceeds total pages
    if (end > total) {
      end = total;
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changeItemsPerPage(items: number): void {
    this.itemsPerPage = Number(items); // Ensure it's a number
    this.currentPage = 1;
  }
}
