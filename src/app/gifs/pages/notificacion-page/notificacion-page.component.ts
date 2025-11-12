import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificacionService } from '../../services/notificacion.service';
import { Notificacion } from '../../interfaces/notificacion.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notificacion-page',
  templateUrl: './notificacion-page.component.html',
  styleUrls: ['./notificacion-page.component.css']
})
export class NotificacionPageComponent implements OnInit, OnDestroy {
  notificaciones: Notificacion[] = [];
  filteredNotificaciones: Notificacion[] = [];
  loading = false;
  searchTerm = '';
  selectedDateFilter = '';
  selectedMateriaFilter = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Filters
  materias: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private notificacionService: NotificacionService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNotificaciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotificaciones(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();

    // Filter by current user's organo - operators see only their department
    const request = currentUser?.organoImpartidorJusticia
      ? this.notificacionService.getByOrgano(currentUser.organoImpartidorJusticia)
      : this.notificacionService.getAll();

    request.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificaciones = response.data || [];
            this.filteredNotificaciones = [...this.notificaciones];
            this.totalItems = this.notificaciones.length;
            this.extractMaterias();
            this.applyFilters();
          } else {
            this.toastr.error(response.message || 'Error al cargar notificaciones', 'Error');
            this.notificaciones = [];
            this.filteredNotificaciones = [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading notificaciones:', error);
          this.loading = false;
          this.toastr.error('No se pudieron cargar las notificaciones. Intente nuevamente.', 'Error de Carga');
          this.notificaciones = [];
          this.filteredNotificaciones = [];
        }
      });
  }

  extractMaterias(): void {
    const materiasSet = new Set<string>();
    this.notificaciones.forEach(notif => {
      if (notif.expediente?.tipoMateria) {
        materiasSet.add(notif.expediente.tipoMateria.toString());
      }
    });
    this.materias = Array.from(materiasSet).sort();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.notificaciones];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(notif =>
        notif.idNotificacion.toString().includes(term) ||
        notif.expediente?.expedienteCJF?.toLowerCase().includes(term) ||
        notif.tipoAsunto?.nombre?.toLowerCase().includes(term) ||
        this.getAmparoNumber(notif)?.toLowerCase().includes(term)
      );
    }

    // Date filter
    if (this.selectedDateFilter) {
      filtered = filtered.filter(notif => {
        const notifDate = new Date(notif.fechaEnvio);
        const filterDate = new Date(this.selectedDateFilter);
        return notifDate.toDateString() === filterDate.toDateString();
      });
    }

    // Materia filter
    if (this.selectedMateriaFilter) {
      filtered = filtered.filter(notif =>
        notif.expediente?.tipoMateria?.toString() === this.selectedMateriaFilter
      );
    }

    this.filteredNotificaciones = filtered;
    this.totalItems = filtered.length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDateFilter = '';
    this.selectedMateriaFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  // Pagination helpers
  get paginatedNotificaciones(): Notificacion[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredNotificaciones.slice(start, end);
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

  // Helper methods to get related data
  getAmparoNumber(notificacion: Notificacion): string {
    if (notificacion.amparosPJ && notificacion.amparosPJ.length > 0) {
      return notificacion.amparosPJ[0].numeroExpedienteDJ || 'N/A';
    }
    return 'N/A';
  }

  getProcedimiento(notificacion: Notificacion): string {
    return notificacion.tipoMedioNotificacion || 'N/A';
  }

  getFolio(notificacion: Notificacion): string {
    return notificacion.expediente?.expedienteCJF || 'N/A';
  }

  getCuaderno(notificacion: Notificacion): string {
    if (notificacion.amparosPJ && notificacion.amparosPJ.length > 0) {
      return notificacion.amparosPJ[0].JUZGADO || 'N/A';
    }
    return 'N/A';
  }

  getAsunto(notificacion: Notificacion): string {
    return notificacion.tipoAsunto?.nombre || 'N/A';
  }

  getMateria(notificacion: Notificacion): string {
    return notificacion.expediente?.tipoMateria?.toString() || 'N/A';
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

  // CRUD Actions
  onCreate(): void {
    this.router.navigate(['/dashboard/notificacion/nuevo']);
  }

  onView(notificacion: Notificacion): void {
    this.router.navigate(['/dashboard/notificacion/ver', notificacion.idNotificacion]);
  }

  onEdit(notificacion: Notificacion): void {
    this.router.navigate(['/dashboard/notificacion/editar', notificacion.idNotificacion]);
  }

  onDelete(notificacion: Notificacion): void {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Confirmar Eliminación';
    modalRef.componentInstance.message = `¿Está seguro que desea eliminar la notificación #${notificacion.idNotificacion}? Esta acción no se puede deshacer.`;
    modalRef.componentInstance.confirmText = 'Eliminar';
    modalRef.componentInstance.cancelText = 'Cancelar';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger-modern';

    modalRef.result.then(
      (result) => {
        if (result) {
          this.deleteNotificacion(notificacion.idNotificacion);
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  private deleteNotificacion(id: number): void {
    this.notificacionService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Notificación eliminada exitosamente', 'Éxito');
            this.loadNotificaciones();
          } else {
            this.toastr.error(response.message || 'Error al eliminar la notificación', 'Error');
          }
        },
        error: (error) => {
          console.error('Error deleting notificacion:', error);
          this.toastr.error('No se pudo eliminar la notificación. Intente nuevamente.', 'Error');
        }
      });
  }

  onViewDocuments(notificacion: Notificacion): void {
    if (notificacion.documentosNotificacion && notificacion.documentosNotificacion.length > 0) {
      this.toastr.info(`Esta notificación tiene ${notificacion.documentosNotificacion.length} documento(s)`, 'Documentos');
      // Navigate to view page where documents can be seen
      this.router.navigate(['/dashboard/notificacion/ver', notificacion.idNotificacion]);
    } else {
      this.toastr.warning('Esta notificación no tiene documentos adjuntos', 'Sin Documentos');
    }
  }

  getDocumentCount(notificacion: Notificacion): number {
    return notificacion.documentosNotificacion?.length || 0;
  }

  hasDocuments(notificacion: Notificacion): boolean {
    return this.getDocumentCount(notificacion) > 0;
  }
}
