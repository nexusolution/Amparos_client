import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ExpedienteService } from '../../services/expediente.service';
import { AmparosService } from '../../services/amparos.service';
import { NotificacionService } from '../../services/notificacion.service';
import { PromocionService } from '../../services/promocion.service';
import { DocumentosNotificacionService } from '../../services/documentos-notificacion.service';
import { PartesExpedienteService } from '../../services/partes-expediente.service';

@Component({
  selector: 'app-dashboard-home-page',
  templateUrl: './dashboard-home-page.component.html',
  styleUrls: ['./dashboard-home-page.component.css']
})
export class DashboardHomePageComponent implements OnInit {
  loading = false;
  error: string | null = null;

  stats = {
    expedientes: {
      total: 0,
      electronic: 0,
      physical: 0,
      electronicPercentage: 0,
      physicalPercentage: 0
    },
    amparos: {
      total: 0,
      electronic: 0,
      physical: 0,
      electronicPercentage: 0,
      physicalPercentage: 0
    },
    notificaciones: {
      total: 0,
      last30Days: 0,
      thisMonth: 0
    },
    promociones: {
      total: 0,
      last30Days: 0,
      thisMonth: 0
    },
    documentos: {
      total: 0,
      signed: 0,
      unsigned: 0,
      signedPercentage: 0,
      unsignedPercentage: 0
    },
    partes: {
      total: 0
    }
  };

  recentNotificaciones: any[] = [];
  recentPromociones: any[] = [];
  recentAmparos: any[] = [];

  constructor(
    private router: Router,
    private expedienteService: ExpedienteService,
    private amparosService: AmparosService,
    private notificacionService: NotificacionService,
    private promocionService: PromocionService,
    private documentosService: DocumentosNotificacionService,
    private partesService: PartesExpedienteService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      expedientesStats: this.expedienteService.getStatistics(),
      amparosStats: this.amparosService.getStatistics(),
      notificacionesStats: this.notificacionService.getStatistics(),
      promocionesStats: this.promocionService.getStatistics(),
      documentosStats: this.documentosService.getStatistics(),
      partesAll: this.partesService.getAll(),
      recentNotificaciones: this.notificacionService.getRecent(30),
      recentPromociones: this.promocionService.getRecent(30),
      recentAmparos: this.amparosService.getAll()
    }).subscribe({
      next: (results) => {
        // Process Expedientes stats - Extract data from API response
        if (results.expedientesStats && results.expedientesStats.data) {
          const expStats = results.expedientesStats.data;
          this.stats.expedientes = {
            total: expStats.total || 0,
            electronic: expStats.electronic || 0,
            physical: expStats.physical || 0,
            electronicPercentage: this.calculatePercentage(
              expStats.electronic || 0,
              expStats.total || 0
            ),
            physicalPercentage: this.calculatePercentage(
              expStats.physical || 0,
              expStats.total || 0
            )
          };
        }

        // Process Amparos stats - Extract data from API response
        if (results.amparosStats && results.amparosStats.data) {
          const amparosStats = results.amparosStats.data;
          this.stats.amparos = {
            total: amparosStats.total || 0,
            electronic: amparosStats.electronic || 0,
            physical: amparosStats.physical || 0,
            electronicPercentage: this.calculatePercentage(
              amparosStats.electronic || 0,
              amparosStats.total || 0
            ),
            physicalPercentage: this.calculatePercentage(
              amparosStats.physical || 0,
              amparosStats.total || 0
            )
          };
        }

        // Process Notificaciones stats - Extract data from API response
        if (results.notificacionesStats && results.notificacionesStats.data) {
          const notiStats = results.notificacionesStats.data;
          this.stats.notificaciones = {
            total: notiStats.total || 0,
            last30Days: notiStats.last30Days || 0,
            thisMonth: notiStats.thisMonth || 0
          };
        }

        // Process Promociones stats - Extract data from API response
        if (results.promocionesStats && results.promocionesStats.data) {
          const promoStats = results.promocionesStats.data;
          this.stats.promociones = {
            total: promoStats.total || 0,
            last30Days: promoStats.last30Days || 0,
            thisMonth: promoStats.thisMonth || 0
          };
        }

        // Process Documentos stats - Extract data from API response
        if (results.documentosStats && results.documentosStats.data) {
          const docStats = results.documentosStats.data;
          this.stats.documentos = {
            total: docStats.total || 0,
            signed: docStats.signed || 0,
            unsigned: docStats.unsigned || 0,
            signedPercentage: this.calculatePercentage(
              docStats.signed || 0,
              docStats.total || 0
            ),
            unsignedPercentage: this.calculatePercentage(
              docStats.unsigned || 0,
              docStats.total || 0
            )
          };
        }

        // Process Partes stats - Count from all partes
        if (results.partesAll && results.partesAll.data) {
          this.stats.partes = {
            total: results.partesAll.data.length || 0
          };
        }

        // Process recent activities - Extract data from API response
        this.recentNotificaciones = (results.recentNotificaciones?.data || []).slice(0, 5);
        this.recentPromociones = (results.recentPromociones?.data || []).slice(0, 5);
        this.recentAmparos = (results.recentAmparos?.data || []).slice(0, 5);

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error = 'No se pudieron cargar los datos del dashboard. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.loadDashboardData();
  }

  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  // Navigation methods
  navigateToExpedientes(): void {
    this.router.navigate(['/dashboard/expedientes']);
  }

  navigateToAmparos(): void {
    this.router.navigate(['/dashboard/amparos']);
  }

  navigateToNotificaciones(): void {
    this.router.navigate(['/dashboard/notificacion']);
  }

  navigateToPromociones(): void {
    this.router.navigate(['/dashboard/promociones']);
  }

  navigateToPartes(): void {
    this.router.navigate(['/dashboard/partes']);
  }

  navigateToCreateNotificacion(): void {
    this.router.navigate(['/dashboard/notificacion/nuevo']);
  }

  navigateToCreateAmparo(): void {
    this.router.navigate(['/dashboard/amparos/nuevo']);
  }

  navigateToCreatePromocion(): void {
    this.router.navigate(['/dashboard/promociones/nuevo']);
  }

  viewNotificacion(id: number): void {
    this.router.navigate(['/dashboard/notificacion/ver', id]);
  }

  viewPromocion(id: number): void {
    this.router.navigate(['/dashboard/promociones/editar', id]);
  }

  viewAmparo(id: number): void {
    this.router.navigate(['/dashboard/amparos/editar', id]);
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
