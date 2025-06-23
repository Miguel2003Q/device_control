import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TopBarComponent } from '../shared/top-bar/top-bar.component';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { SolicitudEspacio } from '../../core/models/solicitudEspacio.model';
import { SolicitudEspacioService } from '../../core/services/solicitudEspacio.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

interface Estadisticas {
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  completadas: number;
  canceladas: number;
}

@Component({
  selector: 'app-historial-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TopBarComponent, SidebarComponent],
  templateUrl: './historial-solicitudes.component.html',
  styleUrls: ['./historial-solicitudes.component.css'],
  providers: [DatePipe]
})
export class HistorialSolicitudesComponent implements OnInit, OnDestroy {
  // Properties for filtering and search
  searchTerm: string = '';
  filtroEstado: string = '';
  filtroPeriodo: string = '';

  // Data and state
  solicitudes: SolicitudEspacio[] = [];
  solicitudesFiltradas: SolicitudEspacio[] = [];
  solicitudesEnPagina: SolicitudEspacio[] = [];
  estadisticas: Estadisticas = { pendientes: 0, aprobadas: 0, rechazadas: 0, completadas: 0, canceladas: 0 };
  loading: boolean = false;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Modal
  showModalDetalles: boolean = false;
  solicitudSeleccionada: SolicitudEspacio | null = null;

  // Sidebar
  sidebarActive: boolean = false;

  // Subscriptions
  private destroy$ = new Subject<void>();

  constructor(
    private toast: ToastrService,
    private datePipe: DatePipe,
    private solicitudService: SolicitudEspacioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarHistorial(): void {
    this.loading = true;
    
    this.solicitudService.obtenerTodosLosMovimientos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (solicitudes) => {
          this.solicitudes = solicitudes;
          this.actualizarEstadisticas();
          this.filtrarSolicitudes();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar el historial:', error);
          this.loading = false;
          // Aquí puedes agregar una notificación de error
        }
      });
  }

  actualizarHistorial(): void {
    this.cargarHistorial();
  }

  filtrarSolicitudes(): void {
    let filtered = [...this.solicitudes];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(solicitud =>
        solicitud.espacio.nombre?.toLowerCase().includes(term) ||
        solicitud.motivo?.toLowerCase().includes(term) ||
        this.datePipe.transform(solicitud.fechaSolicitud, 'dd/MM/yyyy')?.includes(term) ||
        solicitud.usuario.nombre?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (this.filtroEstado) {
      filtered = filtered.filter(solicitud => solicitud.estado === this.filtroEstado);
    }

    // Filter by period
    if (this.filtroPeriodo) {
      const now = new Date();
      filtered = filtered.filter(solicitud => {
        const fecha = new Date(solicitud.fechaSolicitud);
        switch (this.filtroPeriodo) {
          case 'hoy':
            return this.isSameDay(fecha, now);
          case 'semana':
            return this.isSameWeek(fecha, now);
          case 'mes':
            return this.isSameMonth(fecha, now);
          case 'trimestre':
            return this.isWithinMonths(fecha, now, 3);
          case 'año':
            return this.isSameYear(fecha, now);
          default:
            return true;
        }
      });
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => {
      return new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime();
    });

    this.solicitudesFiltradas = filtered;
    this.updatePagination();
  }

  actualizarEstadisticas(): void {
    this.estadisticas = {
      pendientes: this.solicitudes.filter(s => s.estado === 'Pendiente').length,
      aprobadas: this.solicitudes.filter(s => s.estado === 'Aprobada').length,
      rechazadas: this.solicitudes.filter(s => s.estado === 'Rechazada').length,
      completadas: this.solicitudes.filter(s => s.estado === 'Completada').length,
      canceladas: this.solicitudes.filter(s => s.estado === 'Cancelada').length
    };
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.solicitudesFiltradas.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = this.currentPage * this.pageSize;
    
    this.solicitudesEnPagina = this.solicitudesFiltradas.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  cambiarPagina(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  verDetalles(solicitud: SolicitudEspacio): void {
    this.solicitudSeleccionada = solicitud;
    this.showModalDetalles = true;
  }

  cerrarModal(event: Event): void {
    this.showModalDetalles = false;
    this.solicitudSeleccionada = null;
  }

  cancelarSolicitud(solicitud: SolicitudEspacio): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
      this.loading = true;
      
      this.solicitudService.cancelarSolicitud(solicitud.idmov!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Actualizar el estado localmente
            this.toast.success('Solicitud cancelada exitosamente', 'Éxito');
            solicitud.estado = 'Cancelada';
            this.actualizarEstadisticas();
            this.filtrarSolicitudes();
            this.loading = false;
            // Aquí puedes agregar una notificación de éxito
          },
          error: (error) => {
            console.error('Error al cancelar la solicitud:', error);
            this.loading = false;
            // Aquí puedes agregar una notificación de error
          }
        });
    }
  }

  duplicarSolicitud(solicitud: SolicitudEspacio): void {
    // Navegar a la página de nueva solicitud con los datos pre-llenados
    this.solicitudService.setSolicitudParaDuplicar(solicitud);
    this.router.navigate(['/espacios/nueva-solicitud']);
  }

  descargarComprobante(solicitud: SolicitudEspacio): void {
    this.solicitudService.descargarComprobante(solicitud.idmov!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          // Crear un enlace temporal para descargar el archivo
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `comprobante_solicitud_${solicitud.idmov}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error al descargar el comprobante:', error);
          // Aquí puedes agregar una notificación de error
        }
      });
  }

  exportarHistorial(): void {
    this.solicitudService.exportarHistorial(this.solicitudesFiltradas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          // Crear un enlace temporal para descargar el archivo
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `historial_solicitudes_${new Date().toISOString().split('T')[0]}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error al exportar el historial:', error);
          this.toast.error('Error al exportar el historial', 'Error');
        }
      });
  }

  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'fa-clock';
      case 'Aprobado': return 'fa-check-circle';
      case 'Rechazado': return 'fa-times-circle';
      case 'Cancelado': return 'fa-ban';
      case 'Completado': return 'fa-check-double';
      default: return 'fa-info-circle';
    }
  }

  getTimelineClass(estado: string): string {
    return estado.toLowerCase();
  }

  // Método para calcular la duración de la reserva
  getDuracionReserva(fechaPres: string, fechaDevol: string): string {
    const inicio = new Date(fechaPres);
    const fin = new Date(fechaDevol);
    const diffMs = fin.getTime() - inicio.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    } else {
      return `${diffMinutes}min`;
    }
  }

  // Helper methods for period filtering
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private isSameWeek(date1: Date, date2: Date): boolean {
    const oneDay = 24 * 60 * 60 * 1000;
    const startOfWeek = new Date(date2.getTime() - (date2.getDay() * oneDay));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek.getTime() + (7 * oneDay));
    return date1 >= startOfWeek && date1 < endOfWeek;
  }

  private isSameMonth(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth();
  }

  private isWithinMonths(date1: Date, date2: Date, months: number): boolean {
    const cutoff = new Date(date2.getFullYear(), date2.getMonth() - months, date2.getDate());
    return date1 >= cutoff;
  }

  private isSameYear(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear();
  }

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}