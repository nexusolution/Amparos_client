import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PromocionService } from '../../services/promocion.service';
import { Promocion } from '../../interfaces/promocion.interface';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-promocion-page',
  templateUrl: './promocion-page.component.html',
  styleUrls: ['./promocion-page.component.css']
})
export class PromocionPageComponent implements OnInit {
  promociones: Promocion[] = [];
  filteredPromociones: Promocion[] = [];
  loading = false;
  searchTerm = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private promocionService: PromocionService,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.promocionService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.promociones = response.data;
          this.filteredPromociones = this.promociones;
          this.totalItems = this.promociones.length;
        } else {
          this.toastr.error(response.message || 'Error al cargar promociones', 'Error');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading promociones:', error);
        this.loading = false;
        this.toastr.error('No se pudieron cargar las promociones. Intente nuevamente.', 'Error de Carga');
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    if (!this.searchTerm.trim()) {
      this.filteredPromociones = this.promociones;
      this.totalItems = this.promociones.length;
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredPromociones = this.promociones.filter(promocion =>
      promocion.tipoCuaderno?.toLowerCase().includes(searchLower) ||
      promocion.idAmparosPJ?.toString().includes(searchLower)
    );
    this.totalItems = this.filteredPromociones.length;
  }

  onCreate(): void {
    this.router.navigate(['/dashboard/promociones/nuevo']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/dashboard/promociones/editar', id]);
  }

  onDelete(id: number): void {
    const promocion = this.promociones.find(p => p.idPromocion === id);
    if (!promocion) return;

    const modalRef = this.modalService.open(ConfirmModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Eliminar Promoción';
    modalRef.componentInstance.message = `¿Está seguro de que desea eliminar la promoción #${promocion.idPromocion}?`;
    modalRef.componentInstance.confirmText = 'Eliminar';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger-modern';
    modalRef.componentInstance.icon = 'warning';

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          this.promocionService.delete(id).subscribe({
            next: (response) => {
              if (response.success) {
                this.toastr.success('Promoción eliminada exitosamente', 'Eliminada');
                this.loadData();
              } else {
                this.toastr.error(response.message || 'Error al eliminar la promoción', 'Error');
              }
            },
            error: (error) => {
              console.error('Error deleting promocion:', error);
              this.toastr.error('No se pudo eliminar la promoción. Intente nuevamente.', 'Error');
            }
          });
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  // Pagination helpers
  get paginatedPromociones(): Promocion[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPromociones.slice(start, end);
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
