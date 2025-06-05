import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TopBarComponent } from '../shared/top-bar/top-bar.component';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";

interface HistorialEstado {
  estado: string;
  fecha: Date;
  usuario?: string;
}

interface Solicitud {
  id: number;
  tipo: 'ambiente' | 'activo';
  ambiente?: string;
  activo?: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Cancelado' | 'Completado';
  fechaSolicitud: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
  horaInicio?: string;
  horaFin?: string;
  motivo: string;
  observaciones?: string;
  numAsistentes?: number;
  ubicacion?: string;
  fechaActualizacion: Date;
  responsable?: string;
  historialEstados: HistorialEstado[];
}

interface Estadisticas {
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  completadas: number;
}

@Component({
  selector: 'app-historial-solicitudes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TopBarComponent, SidebarComponent],
  templateUrl: './historial-solicitudes.component.html',
  styleUrls: ['./historial-solicitudes.component.css'],
  providers: [DatePipe]
})
export class HistorialSolicitudesComponent implements OnInit {
  // Properties for filtering and search
  searchTerm: string = '';
  filtroEstado: string = '';
  filtroPeriodo: string = '';
  filtroTipo: string = '';

  // Data and state
  solicitudes: Solicitud[] = [];
  solicitudesFiltradas: Solicitud[] = [];
  estadisticas: Estadisticas = { pendientes: 0, aprobadas: 0, rechazadas: 0, completadas: 0 };
  loading: boolean = false;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Modal
  showModalDetalles: boolean = false;
  solicitudSeleccionada: Solicitud | null = null;

  sidebarActive: boolean = false;

  constructor(private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.loading = true;
    // Mock data for demonstration (replace with service call)
    this.solicitudes = [
      {
        id: 1,
        tipo: 'ambiente',
        ambiente: 'Aula 101',
        estado: 'Aprobado',
        fechaSolicitud: new Date('2025-05-20T10:00:00'),
        fechaInicio: new Date('2025-06-01T09:00:00'),
        fechaFin: new Date('2025-06-01T12:00:00'),
        horaInicio: '09:00',
        horaFin: '12:00',
        motivo: 'Clase de Matemáticas',
        numAsistentes: 30,
        ubicacion: 'Edificio A',
        fechaActualizacion: new Date('2025-05-21T15:00:00'),
        responsable: 'Admin Juan',
        historialEstados: [
          { estado: 'Pendiente', fecha: new Date('2025-05-20T10:00:00'), usuario: 'Usuario' },
          { estado: 'Aprobado', fecha: new Date('2025-05-21T15:00:00'), usuario: 'Admin Juan' }
        ]
      },
      {
        id: 2,
        tipo: 'activo',
        activo: 'Proyector Epson',
        estado: 'Pendiente',
        fechaSolicitud: new Date('2025-05-22T14:00:00'),
        motivo: 'Presentación de proyecto',
        fechaActualizacion: new Date('2025-05-22T14:00:00'),
        historialEstados: [
          { estado: 'Pendiente', fecha: new Date('2025-05-22T14:00:00'), usuario: 'Usuario' }
        ]
      }
      // Add more mock data as needed
    ];

    setTimeout(() => { // Simulate API delay
      this.actualizarEstadisticas();
      this.filtrarSolicitudes();
      this.loading = false;
    }, 1000);
  }

  actualizarHistorial(): void {
    this.loading = true;
    // Placeholder for service call to refresh data
    setTimeout(() => {
      this.cargarHistorial();
    }, 1000);
  }

  filtrarSolicitudes(): void {
    let filtered = [...this.solicitudes];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(solicitud =>
        (solicitud.ambiente?.toLowerCase().includes(term) ||
         solicitud.activo?.toLowerCase().includes(term) ||
         solicitud.motivo.toLowerCase().includes(term) ||
         this.datePipe.transform(solicitud.fechaSolicitud, 'dd/MM/yyyy')?.includes(term) ||
         solicitud.observaciones?.toLowerCase().includes(term))
      );
    }

    // Filter by status
    if (this.filtroEstado) {
      filtered = filtered.filter(solicitud => solicitud.estado === this.filtroEstado);
    }

    // Filter by type
    if (this.filtroTipo) {
      filtered = filtered.filter(solicitud => solicitud.tipo === this.filtroTipo);
    }

    // Filter by period
    if (this.filtroPeriodo) {
      const now = new Date();
      filtered = filtered.filter(solicitud => {
        const fecha = solicitud.fechaSolicitud;
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

    this.solicitudesFiltradas = filtered;
    this.updatePagination();
  }

  actualizarEstadisticas(): void {
    this.estadisticas = {
      pendientes: this.solicitudes.filter(s => s.estado === 'Pendiente').length,
      aprobadas: this.solicitudes.filter(s => s.estado === 'Aprobado').length,
      rechazadas: this.solicitudes.filter(s => s.estado === 'Rechazado').length,
      completadas: this.solicitudes.filter(s => s.estado === 'Completado').length
    };
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.solicitudesFiltradas.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.solicitudesFiltradas = this.solicitudesFiltradas.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
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
    this.filtrarSolicitudes();
  }

  verDetalles(solicitud: Solicitud): void {
    this.solicitudSeleccionada = solicitud;
    this.showModalDetalles = true;
  }

  cerrarModal(event: Event): void {
    if (event.target === event.currentTarget || (event.target as HTMLElement).closest('.close-btn, .btn-secondary')) {
      this.showModalDetalles = false;
      this.solicitudSeleccionada = null;
    }
  }

  cancelarSolicitud(solicitud: Solicitud): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
      // Placeholder for service call
      solicitud.estado = 'Cancelado';
      solicitud.fechaActualizacion = new Date();
      solicitud.historialEstados.push({
        estado: 'Cancelado',
        fecha: new Date(),
        usuario: 'Usuario Actual' // Replace with actual user
      });
      this.actualizarEstadisticas();
      this.filtrarSolicitudes();
    }
  }

  duplicarSolicitud(solicitud: Solicitud): void {
    // Placeholder for duplicating request
    const nuevaSolicitud: Solicitud = {
      ...solicitud,
      id: this.solicitudes.length + 1,
      estado: 'Pendiente',
      fechaSolicitud: new Date(),
      fechaActualizacion: new Date(),
      historialEstados: [
        { estado: 'Pendiente', fecha: new Date(), usuario: 'Usuario Actual' }
      ]
    };
    this.solicitudes.push(nuevaSolicitud);
    this.actualizarEstadisticas();
    this.filtrarSolicitudes();
  }

  descargarComprobante(solicitud: Solicitud): void {
    // Placeholder for downloading receipt
    console.log(`Descargando comprobante para solicitud #${solicitud.id}`);
    // Example: window.open(`/api/comprobante/${solicitud.id}`, '_blank');
  }

  exportarHistorial(): void {
    // Placeholder for exporting history
    console.log('Exportando historial a Excel');
    // Example: Use a library like XLSX to export solicitudesFiltradas
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