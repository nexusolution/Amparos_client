import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AmparosService } from '../../services/amparos.service';
import { AmparosPJ } from '../../interfaces/amparos.interface';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-amparos-page',
  templateUrl: './amparos-page.component.html',
  styleUrls: ['./amparos-page.component.css']
})
export class AmparosPageComponent implements OnInit {
  amparos: AmparosPJ[] = [];
  filteredAmparos: AmparosPJ[] = [];
  loading = false;
  searchTerm = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private amparosService: AmparosService,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.amparosService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.amparos = response.data;
          this.filteredAmparos = this.amparos;
          this.totalItems = this.amparos.length;
        } else {
          this.toastr.error(response.message || 'Error al cargar amparos', 'Error');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading amparos:', error);
        this.loading = false;
        this.toastr.error('No se pudieron cargar los amparos. Intente nuevamente.', 'Error de Carga');
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    if (!this.searchTerm.trim()) {
      this.filteredAmparos = this.amparos;
      this.totalItems = this.amparos.length;
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredAmparos = this.amparos.filter(amparo =>
      amparo.numeroExpedienteDJ?.toLowerCase().includes(searchLower) ||
      amparo.JUZGADO?.toLowerCase().includes(searchLower)
    );
    this.totalItems = this.filteredAmparos.length;
  }

  onCreate(): void {
    this.router.navigate(['/dashboard/amparos/nuevo']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/dashboard/amparos/editar', id]);
  }

  onDelete(id: number): void {
    const amparo = this.amparos.find(a => a.idAmparosPJ === id);
    if (!amparo) return;

    const modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Eliminar Amparo';
    modalRef.componentInstance.message = `¿Está seguro de que desea eliminar el amparo "${amparo.numeroExpedienteDJ}"?`;
    modalRef.componentInstance.confirmText = 'Eliminar';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger-modern';
    modalRef.componentInstance.icon = 'warning';

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.amparosService.delete(id).subscribe({
            next: (response) => {
              if (response.success) {
                this.toastr.success('Amparo eliminado exitosamente', 'Eliminado');
                this.loadData();
              } else {
                this.toastr.error(response.message || 'Error al eliminar el amparo', 'Error');
              }
            },
            error: (error) => {
              console.error('Error deleting amparo:', error);
              this.toastr.error('No se pudo eliminar el amparo. Intente nuevamente.', 'Error');
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
  get paginatedAmparos(): AmparosPJ[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAmparos.slice(start, end);
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
