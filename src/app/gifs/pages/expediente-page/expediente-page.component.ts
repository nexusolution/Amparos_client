import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExpedienteService } from '../../services/expediente.service';
import { Expediente } from '../../interfaces/expediente.interface';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-expediente-page',
  templateUrl: './expediente-page.component.html',
  styleUrls: ['./expediente-page.component.css']
})
export class ExpedientePageComponent implements OnInit {
  expedientes: Expediente[] = [];
  filteredExpedientes: Expediente[] = [];
  loading = false;
  searchTerm = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private expedienteService: ExpedienteService,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.expedienteService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.expedientes = response.data;
          this.filteredExpedientes = this.expedientes;
          this.totalItems = this.expedientes.length;
        } else {
          this.toastr.error(response.message || 'Error al cargar expedientes', 'Error');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading expedientes:', error);
        this.loading = false;
        this.toastr.error('No se pudieron cargar los expedientes. Intente nuevamente.', 'Error de Carga');
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    if (!this.searchTerm.trim()) {
      this.filteredExpedientes = this.expedientes;
      this.totalItems = this.expedientes.length;
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredExpedientes = this.expedientes.filter(exp =>
      exp.expedienteCJF?.toLowerCase().includes(searchLower) ||
      exp.origen?.toLowerCase().includes(searchLower) ||
      exp.UHEE?.toLowerCase().includes(searchLower)
    );
    this.totalItems = this.filteredExpedientes.length;
  }

  onCreate(): void {
    this.router.navigate(['/dashboard/expedientes/nuevo']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/dashboard/expedientes/editar', id]);
  }

  onDelete(id: number): void {
    const expediente = this.expedientes.find(e => e.idExpediente === id);
    if (!expediente) return;

    const modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Eliminar Expediente';
    modalRef.componentInstance.message = `¿Está seguro de que desea eliminar el expediente "${expediente.expedienteCJF}"?`;
    modalRef.componentInstance.confirmText = 'Eliminar';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger-modern';
    modalRef.componentInstance.icon = 'warning';

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.expedienteService.delete(id).subscribe({
            next: (response) => {
              if (response.success) {
                this.toastr.success('Expediente eliminado exitosamente', 'Eliminado');
                this.loadData();
              } else {
                this.toastr.error(response.message || 'Error al eliminar el expediente', 'Error');
              }
            },
            error: (error) => {
              console.error('Error deleting expediente:', error);
              this.toastr.error('No se pudo eliminar el expediente. Intente nuevamente.', 'Error');
            }
          });
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  getExpedienteType(tipo: number): string {
    const types: { [key: number]: string } = {
      1: 'Tipo 1',
      2: 'Tipo 2',
      3: 'Tipo 3'
    };
    return types[tipo] || 'Desconocido';
  }

  // Pagination helpers
  get paginatedExpedientes(): Expediente[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredExpedientes.slice(start, end);
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
