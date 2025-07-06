import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Notificacion } from '../../core/models/notificacion.model';
import { NotificacionService } from '../../core/services/notificacion.service';
import { NotificationSoundService } from '../../core/services/notification-sound.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  @ViewChild('notificacionesDropdown') dropdownElement!: ElementRef;

  @Input() dropdownId!: number;
  @Input() openedId!: number | null;
  @Output() toggle = new EventEmitter<number | null>();

  notificaciones: Notificacion[] = [];
  notificacionesFiltradas: Notificacion[] = [];
  contadorNoLeidas: number = 0;
  // mostrarDropdown: boolean = false;
  cargando: boolean = false;
  filtro: 'todas' | 'no-leidas' = 'todas';
  busqueda: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private notificacionService: NotificacionService,
    private router: Router, private eRef: ElementRef,
    private notificationSoundService: NotificationSoundService
  ) { }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.toggle.emit(null); // Esto cierra el dropdown desde el padre
    }
  }

  get mostrarDropdown(): boolean {
    return this.openedId === this.dropdownId;
  }

  ngOnInit(): void {
    this.cargarNotificaciones();
    this.suscribirseAContador();
    this.suscribirseANuevasNotificaciones();
    this.notificacionService.solicitarPermisoNotificaciones();

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  /**
   * Maneja clics fuera del dropdown
   */
  private handleClickOutside(event: Event): void {
    if (this.dropdownElement && !this.dropdownElement.nativeElement.contains(event.target)) {
      this.toggle.emit(null); // Le dice al padre que cierre el dropdown
    }
  }

  /**
   * Carga las notificaciones
   */
  cargarNotificaciones(): void {
    this.cargando = true;
    this.notificacionService.obtenerNotificaciones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notificaciones) => {
          this.notificaciones = notificaciones;
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar notificaciones:', error);
          this.cargando = false;
        }
      });
  }

  /**
   * Se suscribe al contador de notificaciones no leídas
   */
  suscribirseAContador(): void {
    this.notificacionService.contadorNoLeidas$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.contadorNoLeidas = count;
      });
  }

  /**
   * Se suscribe a nuevas notificaciones en tiempo real
   */
  suscribirseANuevasNotificaciones(): void {
    this.notificacionService.nuevaNotificacion$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notificacion => {
        // Agregar al principio de la lista
        this.notificaciones.unshift(notificacion);
        this.aplicarFiltros();

        // Mostrar animación de nueva notificación
        this.mostrarAnimacionNuevaNotificacion();
      });
  }

  /**
   * Toggle del dropdown
   */
  toggleDropdown(event: Event): void {
    event.stopPropagation();

    const nuevoEstado = this.mostrarDropdown ? null : this.dropdownId;
    this.toggle.emit(nuevoEstado);

    if (!this.mostrarDropdown && this.filtro === 'todas') {
      this.cargarNotificaciones();
    }
  }

  /**
   * Aplica los filtros activos
   */
  aplicarFiltros(): void {
    let filtradas = [...this.notificaciones];

    // Filtrar por estado de lectura
    if (this.filtro === 'no-leidas') {
      filtradas = filtradas.filter(n => !n.leida);
    }

    // Filtrar por búsqueda
    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase();
      filtradas = filtradas.filter(n =>
        n.titulo.toLowerCase().includes(termino) ||
        n.mensaje.toLowerCase().includes(termino)
      );
    }

    this.notificacionesFiltradas = filtradas;
  }

  /**
   * Marca una notificación como leída y navega si es necesario
   */
  marcarComoLeida(notificacion: Notificacion, event: Event): void {
    event.stopPropagation();

    if (!notificacion.leida) {
      this.notificacionService.marcarComoLeida(notificacion.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notificacion.leida = true;
            this.aplicarFiltros();
          },
          error: (error) => console.error('Error al marcar como leída:', error)
        });
    }

    // Navegar si hay URL de redirección
    if (notificacion.urlRedireccion && !this.router.url.startsWith('/ins')) {
      this.toggle.emit(null);

      if (notificacion.solicitudId) {
        // Navegar a la solicitud específica
        this.router.navigate(['/vig/solicitudes-espacios'], {
          queryParams: { id: notificacion.solicitudId }
        });
      } else {
        // Navegar a la URL especificada
        this.router.navigateByUrl(notificacion.urlRedireccion);
      }
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  marcarTodasComoLeidas(): void {
    this.notificacionService.marcarTodasComoLeidas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificaciones.forEach(n => n.leida = true);
          this.aplicarFiltros();
        },
        error: (error) => console.error('Error al marcar todas como leídas:', error)
      });
  }

  /**
   * Elimina una notificación
   */
  eliminarNotificacion(notificacion: Notificacion, event: Event): void {
    event.stopPropagation();

    if (confirm('¿Estás seguro de eliminar esta notificación?')) {
      this.notificacionService.eliminarNotificacion(notificacion.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificaciones = this.notificaciones.filter(n => n.id !== notificacion.id);
            this.aplicarFiltros();

            // Actualizar contador si era no leída
            if (!notificacion.leida) {
              this.notificacionService.actualizarContador();
            }
          },
          error: (error) => console.error('Error al eliminar notificación:', error)
        });
    }
  }

  /**
   * Cambia el filtro activo
   */
  cambiarFiltro(filtro: 'todas' | 'no-leidas'): void {
    this.filtro = filtro;
    this.aplicarFiltros();
  }

  /**
   * Obtiene el tiempo relativo desde la fecha
   */
  obtenerTiempoRelativo(fecha: string): string {
    const ahora = new Date();
    const fechaNotificacion = new Date(fecha);
    const diferencia = ahora.getTime() - fechaNotificacion.getTime();

    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    if (horas < 24) return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    if (dias < 7) return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;

    return fechaNotificacion.toLocaleDateString();
  }

  /**
   * Muestra una animación cuando llega una nueva notificación
   */
  private mostrarAnimacionNuevaNotificacion(): void {
    // Implementar animación visual/sonido si se desea
    this.notificationSoundService.playNotificationSound();
  }

  /**
   * Navega a ver todas las notificaciones
   */
  verTodasLasNotificaciones(): void {
    this.toggle.emit(null);
    this.router.navigate(['/notificaciones']);
  }
}
