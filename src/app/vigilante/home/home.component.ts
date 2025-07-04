import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { interval, Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { EspacioService } from '../../core/services/espacio.service';
import { Espacio } from '../../core/models/espacio.model';
import { SolicitudEspacioService } from '../../core/services/solicitudEspacio.service';
import { SolicitudEspacio } from '../../core/models/solicitudEspacio.model';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

Chart.register(...registerables);

interface SummaryCard {
  value: number;
  label: string;
  icon: string;
  bgColor: string;
  iconColor: string;
  trend: {
    type: 'positive' | 'negative' | 'neutral';
    icon: string;
    text: string;
  };
  sparklineData: string;
}

interface Actividad {
  tipo: string;
  icono: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
}

interface EstadisticaDiaria {
  icono: string;
  valor: number;
  label: string;
  porcentaje: number;
  color: string;
}

@Component({
  selector: 'app-vigilante-home',
  imports: [CommonModule, TopBarComponent, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.6s ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('tileAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

  @Input() sidebarActive: boolean = false;

  fechaActual = '';
  horaActual = '';
  pisoSeleccionado = 'Todos';
  pisos = ['Todos', '1', '2', '3', '4'];
  ambientes: Espacio[] = [];
  summaryCards: SummaryCard[] = [];
  actividadesRecientes: Actividad[] = [];
  solicitudes: SolicitudEspacio[] = [];
  estadisticasDiarias: EstadisticaDiaria[] = [];


  private timeInterval?: Subscription;
  private ocupacionChart?: Chart;
  private pisoChart?: Chart;

  constructor(private espacioService: EspacioService, private solicitudEspacioService: SolicitudEspacioService) { }

  ngOnInit(): void {
    this.cargarAmbientes();
    this.cargarActividadesDesdeSolicitudes();
    // this.generarEstadisticasDiarias();
    this.animarNumeros();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      this.timeInterval.unsubscribe();
    }
    if (this.ocupacionChart) {
      this.ocupacionChart.destroy();
    }
    if (this.pisoChart) {
      this.pisoChart.destroy();
    }
  }

  cargarAmbientes(): void {
    this.espacioService.obtenerTodosLosEspacios().subscribe({
      next: (ambientes: Espacio[]) => {
        this.ambientes = ambientes;

        const total = ambientes.length;
        const ocupados = ambientes.filter(a => a.estado === "Ocupado").length;
        const disponibles = ambientes.filter(a => a.estado === "Disponible").length;
        const tasaOcupacion = total > 0 ? Math.round((ocupados / total) * 100) : 0;

        this.summaryCards = [
          {
            value: total,
            label: 'Ambientes Totales',
            icon: 'fas fa-door-open',
            bgColor: 'rgba(96, 150, 186, 0.1)',
            iconColor: '#6096BA',
            trend: {
              type: 'neutral',
              icon: 'fa-minus',
              text: 'Sin cambios'
            },
            sparklineData: 'M0,30 L10,25 L20,27 L30,22 L40,24 L50,20 L60,23 L70,18 L80,22 L90,15 L100,20'
          },
          {
            value: ocupados,
            label: 'Ambientes Ocupados',
            icon: 'fas fa-user-clock',
            bgColor: 'rgba(255, 152, 0, 0.1)',
            iconColor: '#FF9800',
            trend: {
              type: 'positive',
              icon: 'fa-arrow-up',
              text: '+12% vs ayer'
            },
            sparklineData: 'M0,35 L10,32 L20,30 L30,28 L40,25 L50,22 L60,20 L70,18 L80,15 L90,12 L100,10'
          },
          {
            value: disponibles,
            label: 'Ambientes Disponibles',
            icon: 'fas fa-check-circle',
            bgColor: 'rgba(76, 175, 80, 0.1)',
            iconColor: '#4CAF50',
            trend: {
              type: 'negative',
              icon: 'fa-arrow-down',
              text: '-8% vs ayer'
            },
            sparklineData: 'M0,10 L10,15 L20,12 L30,18 L40,22 L50,25 L60,22 L70,28 L80,25 L90,30 L100,28'
          },
          {
            value: tasaOcupacion,
            label: 'Tasa de Ocupación %',
            icon: 'fas fa-chart-line',
            bgColor: 'rgba(163, 206, 241, 0.1)',
            iconColor: '#A3CEF1',
            trend: {
              type: 'positive',
              icon: 'fa-arrow-up',
              text: 'Óptimo'
            },
            sparklineData: 'M0,20 L10,22 L20,25 L30,28 L40,32 L50,30 L60,35 L70,33 L80,38 L90,35 L100,40'
          }
        ];
      },
      error: (error: Error) => {
        alert('Error al cargar los ambientes: ' + error.message);
      }
    });
  }

  cargarActividadesDesdeSolicitudes(): void {
    this.solicitudEspacioService.obtenerTodosLosMovimientos().subscribe({
      next: (solicitudes: SolicitudEspacio[]) => {
        this.solicitudes = solicitudes;
        this.actividadesRecientes = solicitudes
          .sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()) // Ordenar por fecha descendente
          .slice(0, 3) // Tomar las 3 más recientes
          .map((solicitud) => ({
            tipo: solicitud.estado.toLowerCase(), // Importante para el ngClass
            icono: this.obtenerIconoPorEstado(solicitud.estado),
            titulo: this.obtenerTituloPorEstado(solicitud.estado),
            descripcion: `${solicitud.espacio.nombre} - ${solicitud.motivo}`,
            tiempo: this.formatearTiempo(solicitud.fechaSolicitud)
          }));

          // Para cargar las estadísticas diarias despues de obtener las solicitudes
          this.generarEstadisticasDiarias();
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
      }
    });
  }


  obtenerIconoPorEstado(estado: string): string {
    switch (estado.toLowerCase().trim()) {
      case 'pendiente': return 'fa-sign-out-alt';
      case 'aprobado': return 'fa-check-circle';
      case 'rechazado': return 'fa-times-circle';
      case 'entregado': return 'fa-box';
      case 'devuelto': return 'fa-undo-alt';
      default: return 'fa-info-circle';
    }
  }

  obtenerTituloPorEstado(estado: string): string {
    return `Solicitud ${estado.charAt(0).toUpperCase() + estado.slice(1)}`;
  }



  formatearTiempo(fecha: Date | string): string {
    return 'Hace ' + formatDistanceToNow(new Date(fecha), { locale: es, addSuffix: false });
  }

  generarEstadisticasDiarias(): void {

    this.estadisticasDiarias = [
      {
        icono: 'fas fa-calendar-day',
        valor: this.getTotalSolicitudes(),
        label: 'Solicitudes ',
        porcentaje: 100,
        color: '#2196F3'
      },
      {
        icono: 'fas fa-check-circle', 
        valor: this.getSolicitudesPorEstado('Aprobado'),
        label: 'Aprobación solicitudes',
        porcentaje: this.getSolicitudesPorEstado('Aprobado')/ this.getTotalSolicitudes() * 100,
        color: '#4CAF50'
      },
      {
        icono: 'fas fa-hourglass-half',
        valor: this.getHorasPromedioUso(),
        label: 'Duración promedio (h)',
        porcentaje: 82,
        color: '#FF5722'
      },
      {
        icono: 'fas fa-door-open',
        valor: this.getEspaciosUtilizados(),
        label: 'Ambientes usados',
        porcentaje: 25,
        color: '#795548'
      },
     
    ];
  }


  getTotalSolicitudes(): number {
    console.log('Total de solicitudes:', this.solicitudes.length);
    return this.solicitudes.length;
  }

  getSolicitudesPorEstado(estado: string): number {
    return this.solicitudes.filter(s => s.estado.toLowerCase() === estado.toLowerCase()).length;
  }

  getHorasPromedioUso(): number {
    const duraciones = this.solicitudes
      .filter(s => s.fechaPres && s.fechaDevol)
      .map(s => {
        const pres = new Date(s.fechaPres).getTime();
        const devol = new Date(s.fechaDevol).getTime();
        return (devol - pres) / (1000 * 60 * 60); // horas
      });

    const total = duraciones.reduce((a, b) => a + b, 0);
    return duraciones.length > 0 ? parseFloat((total / duraciones.length).toFixed(2)) : 0;
  }

  getEspaciosUtilizados(): number {
    const ids = new Set(this.solicitudes.map(s => s.espacio?.idespacio));
    return ids.size;
  }

  getEficienciaUso(): number {
    const completadas = this.solicitudes.filter(s => s.estado.toLowerCase() === 'completada').length;
    const total = this.solicitudes.length;
    return total > 0 ? parseFloat(((completadas / total) * 100).toFixed(2)) : 0;
  }

  animarNumeros(): void {
    setTimeout(() => {
      const elementos = document.querySelectorAll('.card-value');
      elementos.forEach((elemento: any) => {
        const valorFinal = parseInt(elemento.getAttribute('data-value') || '0');
        this.animarValor(elemento, 0, valorFinal, 1500);
      });
    }, 300);
  }

  animarValor(elemento: HTMLElement, inicio: number, fin: number, duracion: number): void {
    let tiempoInicio: number | null = null;
    const paso = (tiempo: number) => {
      if (!tiempoInicio) tiempoInicio = tiempo;
      const progreso = Math.min((tiempo - tiempoInicio) / duracion, 1);
      const valor = Math.floor(progreso * (fin - inicio) + inicio);

      // Para porcentajes
      if (elemento.parentElement?.querySelector('.card-label')?.textContent?.includes('%')) {
        elemento.textContent = valor + '%';
      } else {
        elemento.textContent = valor.toString();
      }

      if (progreso < 1) {
        window.requestAnimationFrame(paso);
      }
    };
    window.requestAnimationFrame(paso);
  }

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}