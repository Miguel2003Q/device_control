import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { interval, Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { SolicitudEspacioService } from '../../core/services/solicitudEspacio.service';
import { SolicitudEspacio } from '../../core/models/solicitudEspacio.model';
import { LoadingService } from '../../core/services/loading.service';

Chart.register(...registerables);

interface Estadistica {
  value: string;
  label: string;
  icon: string;
  bgColor: string;
  color: string;
  trend: {
    type: 'positive' | 'negative';
    icon: string;
    value: string;
  };
  chartData: string;
}

interface Solicitud {
  id: number;
  ambiente: string;
  fecha: string;
  horario: string;
  duracion: string;
  capacidad: number;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Cancelada' | 'Completada';
}

interface CalendarDay {
  number: number;
  isToday: boolean;
  hasEvent: boolean;
  events: Array<{ title: string; color: string }>;
}

@Component({
  selector: 'app-instructor-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.6s ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ],
  imports: [TopBarComponent, SidebarComponent, CommonModule, RouterModule]
})
export class InstructorHomeComponent implements OnInit, OnDestroy, AfterViewInit {
  sidebarActive = false;
  fechaActual = '';
  horasAcumuladas = 124;
  solicitudesAprobadas = 45;
  showReportModal = false;
  selectedPeriod = 'month';
  currentWeek = '';
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  private timeInterval?: Subscription;
  private usageChart?: Chart;

  estadisticas: Estadistica[] = [];

  solicitudesRecientes: Solicitud[] = [];

  currentWeekDays: CalendarDay[] = [];

  constructor(private router: Router, private solicitudService: SolicitudEspacioService, private loading: LoadingService) { }

  ngOnInit(): void {
    this.loading.show();
    this.cargarEstadisticasMes();
    this.cargarSolicitudesRecientes();
    this.actualizarFecha();
    this.iniciarActualizacionTiempo();
    this.generarCalendario();
    this.loading.hide();
  }

  ngAfterViewInit(): void {
    this.crearGraficoUso();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      this.timeInterval.unsubscribe();
    }
    if (this.usageChart) {
      this.usageChart.destroy();
    }
  }

  cargarSolicitudesRecientes(): void {
    this.solicitudService.getMisSolicitudes().subscribe((solicitudes: SolicitudEspacio[]) => {
      const recientes = solicitudes
        .sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime())
        .slice(0, 3)
        .map(s => {
          const fechaPres = new Date(s.fechaPres);
          const fechaDevol = new Date(s.fechaDevol);
          const duracionHoras = ((fechaDevol.getTime() - fechaPres.getTime()) / (1000 * 60 * 60)).toFixed(0);

          return {
            id: s.idmov ?? 0,
            ambiente: s.espacio?.nombre || 'Desconocido',
            fecha: this.formatearFecha(fechaPres),
            horario: `${this.formatearHora(fechaPres)} - ${this.formatearHora(fechaDevol)}`,
            duracion: `${duracionHoras} horas`,
            capacidad: s.espacio?.capacidad || 0,
            estado: s.estado as 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Cancelada' | 'Completada'
          };
        });

      this.solicitudesRecientes = recientes;
    });
  }


  cargarEstadisticasMes(): void {
    this.solicitudService.getMisSolicitudes().subscribe((solicitudes: SolicitudEspacio[]) => {
      const ahora = new Date();
      const mesActual = ahora.getMonth();
      const anioActual = ahora.getFullYear();

      // Filtrar solicitudes del mes actual
      const solicitudesMes = solicitudes.filter(s => {
        const fecha = new Date(s.fechaSolicitud);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
      });

      // 1. Total de solicitudes este mes
      const total = solicitudesMes.length;

      // 2. Total aprobadas
      const aprobadas = solicitudesMes.filter(s => s.estado === 'Aprobada').length;
      const porcentajeAprobadas = total > 0 ? Math.round((aprobadas / total) * 100) : 0;

      // 3. Duración promedio (en horas)
      const solicitudesConDevolucion = solicitudesMes.filter(s => s.fechaPres && s.fechaDevol);
      const duraciones = solicitudesConDevolucion.map(s => {
        const inicio = new Date(s.fechaPres).getTime();
        const fin = new Date(s.fechaDevol).getTime();
        return (fin - inicio) / (1000 * 60 * 60); // horas
      });
      const duracionPromedio = duraciones.length > 0
        ? (duraciones.reduce((a, b) => a + b, 0) / duraciones.length).toFixed(1)
        : '0';

      // 4. Pendientes
      const pendientes = solicitudesMes.filter(s => s.estado === 'Pendiente').length;

      this.estadisticas = [
        {
          value: `${total}`,
          label: 'Solicitudes este mes',
          icon: 'fas fa-calendar-alt',
          bgColor: 'rgba(96, 150, 186, 0.1)',
          color: '#6096BA',
          trend: {
            type: 'positive',
            icon: 'fa-circle',
            value: ''
          },
          chartData: 'M0,25 L10,22 L20,20 L30,18 L40,15 L50,12 L60,10 L70,8 L80,10 L90,5 L100,8'
        },
        {
          value: `${porcentajeAprobadas}%`,
          label: 'Aprobadas',
          icon: 'fas fa-check-circle',
          bgColor: 'rgba(76, 175, 80, 0.1)',
          color: '#4CAF50',
          trend: {
            type: 'positive',
            icon: 'fa-arrow-up',
            value: ''
          },
          chartData: 'M0,20 L10,18 L20,22 L30,15 L40,18 L50,10 L60,15 L70,8 L80,12 L90,5 L100,10'
        },
        {
          value: `${duracionPromedio}h`,
          label: 'Duración promedio',
          icon: 'fas fa-clock',
          bgColor: 'rgba(255, 152, 0, 0.1)',
          color: '#FF9800',
          trend: {
            type: 'negative',
            icon: 'fa-clock',
            value: ''
          },
          chartData: 'M0,15 L10,12 L20,10 L30,8 L40,10 L50,5 L60,8 L70,3 L80,5 L90,2 L100,5'
        },
        {
          value: `${pendientes}`,
          label: 'Pendientes',
          icon: 'fas fa-hourglass-half',
          bgColor: 'rgba(244, 67, 54, 0.1)',
          color: '#F44336',
          trend: {
            type: 'negative',
            icon: 'fa-exclamation-triangle',
            value: ''
          },
          chartData: 'M0,20 L10,18 L20,15 L30,12 L40,10 L50,8 L60,10 L70,5 L80,8 L90,3 L100,5'
        }
      ];
    });
  }

  private formatearFecha(fecha: Date): string {
  const hoy = new Date();
  const mañana = new Date();
  mañana.setDate(hoy.getDate() + 1);

  if (fecha.toDateString() === hoy.toDateString()) {
    return 'Hoy';
  } else if (fecha.toDateString() === mañana.toDateString()) {
    return 'Mañana';
  } else {
    return fecha.toLocaleDateString('es-CO', { weekday: 'long' }); // e.g. 'viernes'
  }
}

private formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
}


  actualizarFecha(): void {
    const now = new Date();
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const fechaString = now.toLocaleDateString('es-ES', opciones);
    this.fechaActual = fechaString.charAt(0).toUpperCase() + fechaString.slice(1);
  }

  iniciarActualizacionTiempo(): void {
    this.timeInterval = interval(60000).subscribe(() => {
      this.actualizarFecha();
    });
  }

  generarCalendario(): void {
    const today = new Date();
    const currentWeek = this.getWeekDates(today);

    this.currentWeek = this.formatMonth(today);
    this.currentWeekDays = currentWeek.map(date => ({
      number: date.getDate(),
      isToday: this.isToday(date),
      hasEvent: Math.random() > 0.6,
      events: this.getEventsForDate(date)
    }));
  }

  getWeekDates(date: Date): Date[] {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      week.push(new Date(startOfWeek));
      startOfWeek.setDate(startOfWeek.getDate() + 1);
    }

    return week;
  }

  formatMonth(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options)
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getEventsForDate(date: Date): Array<{ title: string; color: string }> {
    // Simulación de eventos
    const events = [];
    if (Math.random() > 0.5) {
      events.push({ title: 'Clase', color: '#6096BA' });
    }
    if (Math.random() > 0.7) {
      events.push({ title: 'Reunión', color: '#FF9800' });
    }
    return events;
  }

  crearGraficoUso(): void {
    const ctx = document.getElementById('usageChart') as HTMLCanvasElement;
    if (ctx) {
      this.usageChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
          datasets: [{
            label: 'Horas de uso',
            data: [6, 8, 7, 9, 8, 4],
            backgroundColor: 'rgba(96, 150, 186, 0.6)',
            borderColor: '#6096BA',
            borderWidth: 2,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  }

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  getStatusIcon(estado: 'Aprobada' | 'Pendiente' | 'Rechazada' | 'Cancelada' | 'Completada'): string {
    const icons: { [key in 'Aprobada' | 'Pendiente' | 'Rechazada' | 'Cancelada' | 'Completada']: string } = {
      'Aprobada': 'fa-check',
      'Pendiente': 'fa-clock',
      'Rechazada': 'fa-times',
      'Cancelada': 'fa-ban',
      'Completada': 'fa-check-double'
    };
    return icons[estado] || 'fa-question';
  }

  previousWeek(): void {
    // Implementar navegación de calendario
    console.log('Semana anterior');
  }

  nextWeek(): void {
    // Implementar navegación de calendario
    console.log('Semana siguiente');
  }

  generarReporte(): void {
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
  }

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
  }

  downloadReport(): void {
    console.log('Descargando reporte para período:', this.selectedPeriod);
    // Aquí iría la lógica para generar y descargar el PDF
    this.closeReportModal();

    // Simulación de descarga exitosa
    setTimeout(() => {
      alert('Reporte descargado exitosamente');
    }, 1000);
  }

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}