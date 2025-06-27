import { Component, OnInit, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  CommonModule,
  DatePipe,
  NgIf,
  NgFor,
  NgClass,
  SlicePipe
} from '@angular/common';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { ActivatedRoute } from '@angular/router';
import { SolicitudEspacioService } from '../../core/services/solicitudEspacio.service';
import { SolicitudEspacio } from '../../core/models/solicitudEspacio.model';
import { Espacio } from '../../core/models/espacio.model';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  standalone: true,
  selector: 'app-solicitudes-espacios',
  templateUrl: './solicitudes-espacios.component.html',
  styleUrls: ['./solicitudes-espacios.component.css'],
  providers: [DatePipe],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    NgClass,
    SlicePipe,
    TopBarComponent,
    SidebarComponent
  ]
})
export class SolicitudesEspaciosComponent implements OnInit {
  searchTerm = '';
  filtroEstado = '';
  solicitudDestacada: number | null = null;

  solicitudes: SolicitudEspacio[] = [];
  solicitudesFiltradas: SolicitudEspacio[] = [];
  solicitudesPendientes: SolicitudEspacio[] = [];
  ambientesDisponibles: Espacio[] = [];

  showModalSolicitud = false;
  solicitudForm: FormGroup;
  isSubmitting = false;
  minDate: string;

  sidebarActive = false;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private solicitudService: SolicitudEspacioService,
    private ngZone: NgZone,
    private toast: ToastrService,
    private loading: LoadingService
  ) {
    const today = new Date();
    this.minDate = this.datePipe.transform(today, 'yyyy-MM-dd')!;
    this.solicitudForm = this.fb.group({
      ambiente: ['', Validators.required],
      fechaPrestamo: ['', Validators.required],
      horaPrestamo: ['', Validators.required],
      fechaDevolucion: ['', Validators.required],
      horaDevolucion: ['', Validators.required],
      motivo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = +params['id'];
      if (id) this.solicitudDestacada = id;
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.loading.show();

    this.solicitudService.obtenerTodosLosMovimientos().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.filtrarSolicitudes();
        this.solicitudesPendientes = this.solicitudes.filter(s => s.estado === 'Pendiente');
        this.loading.hide();

        if (this.solicitudDestacada) {
          setTimeout(() => this.destacarSolicitud(this.solicitudDestacada!), 300);
        }
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
        this.toast.error('Error al cargar solicitudes:');
        this.loading.hide();
      }
    });
  }

  filtrarSolicitudes(): void {
    let filtered = [...this.solicitudes];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.espacio?.nombre?.toLowerCase().includes(term) ||
        s.usuario?.nombre?.toLowerCase().includes(term) ||
        s.motivo?.toLowerCase().includes(term)
      );
    }

    if (this.filtroEstado) {
      filtered = filtered.filter(s => s.estado === this.filtroEstado);
    }

    if (this.solicitudDestacada) {
      const index = filtered.findIndex(s => s.idmov === this.solicitudDestacada);
      if (index !== -1) {
        const [destacada] = filtered.splice(index, 1);
        filtered.unshift(destacada);
      }
    }

    this.solicitudesFiltradas = filtered;
  }

  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'fa-clock';
      case 'Aprobada': return 'fa-check-circle';
      case 'Rechazada': return 'fa-times-circle';
      case 'En Proceso': return 'fa-hourglass-half';
      default: return 'fa-info-circle';
    }
  }

  aprobarSolicitud(id: number): void {
    this.loading.show();
    const solicitud = this.solicitudes.find(s => s.idmov === id);
    if (solicitud) {
      this.solicitudService.aprobarSolicitud(solicitud.idmov ?? 0).subscribe({
      next: (data) => {

        solicitud.estado = 'Aprobada';
        this.filtrarSolicitudes();
        this.solicitudesPendientes = this.solicitudes.filter(s => s.estado === 'Pendiente');
        this.loading.hide();
        this.toast.success('¡Solicitud aprobada!');
      },
      error: (err) => {
        console.error('Error al aprobar la solicitud:', err);
        this.toast.error('Error al aprobar la solicitud');
        this.loading.hide();
      }
      });
    }
  }

  rechazarSolicitud(id: number): void {
    if (confirm('¿Desea rechazar esta solicitud?')) {
      this.loading.show();
    const solicitud = this.solicitudes.find(s => s.idmov === id);
    if (solicitud) {
      this.solicitudService.rechazarSolicitud(solicitud.idmov ?? 0).subscribe({
      next: (data) => {

        solicitud.estado = 'Rechazada';
        this.filtrarSolicitudes();
        this.solicitudesPendientes = this.solicitudes.filter(s => s.estado === 'Pendiente');
        this.loading.hide();
        this.toast.success('¡Solicitud rechazada!');
      },
      error: (err) => {
        console.error('Error al rechazar la solicitud:', err);
        this.toast.error('Error al rechazar la solicitud');
        this.loading.hide();
      }
      });
    }
  }
}

  abrirModalSolicitudAmbiente(): void {
    this.solicitudForm.reset();
    this.showModalSolicitud = true;
  }

  cerrarModalSolicitud(event: Event): void {
    if (
      event.target === event.currentTarget ||
      (event.target as HTMLElement).closest('.close-modal-btn, .cancel-btn')
    ) {
      this.showModalSolicitud = false;
      this.solicitudForm.reset();
      this.isSubmitting = false;
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.solicitudForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  enviarSolicitudAmbiente(): void {
    if (this.solicitudForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const espacioId = this.solicitudForm.value.ambiente;
      const espacio = this.ambientesDisponibles.find(e => e.idespacio === espacioId);

      const nuevaSolicitud: Partial<SolicitudEspacio> = {
        espacio: espacio!,
        fechaPres: this.solicitudForm.value.fechaPrestamo,
        fechaDevol: this.solicitudForm.value.fechaDevolucion,
        motivo: this.solicitudForm.value.motivo,
        estado: 'Pendiente'
      };

      this.solicitudService.crearSolicitud(nuevaSolicitud).subscribe({
        next: (respuesta) => {
          this.solicitudes.push(respuesta);
          this.filtrarSolicitudes();
          this.solicitudesPendientes = this.solicitudes.filter(s => s.estado === 'Pendiente');
          this.cerrarModalSolicitud(new Event('click'));
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error al enviar solicitud:', err);
          this.isSubmitting = false;
        }
      });
    }
  }

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  destacarSolicitud(id: number): void {
    const el = document.querySelector(`[data-solicitud-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// notification.interceptor.ts - Interceptor para manejar notificaciones de respuestas
// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
// import { Observable, tap } from 'rxjs';
// import { NotificacionService } from '../services/notificacion.service';

// @Injectable()
// export class NotificationInterceptor implements HttpInterceptor {
  
//   constructor(private notificacionService: NotificacionService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     return next.handle(req).pipe(
//       tap(event => {
//         if (event instanceof HttpResponse) {
//           // Verificar si la respuesta incluye información de notificación
//           const notification = event.headers.get('X-Notification');
//           if (notification) {
//             try {
//               const notificationData = JSON.parse(notification);
//               // Procesar la notificación
//               this.notificacionService.actualizarContador();
//             } catch (e) {
//               console.error('Error al procesar notificación del header:', e);
//             }
//           }
//         }
//       })
//     );
//   }
// }

