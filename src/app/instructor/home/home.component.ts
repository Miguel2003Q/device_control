import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { interval, Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { CommonModule } from '@angular/common';

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
  estado: 'aprobado' | 'pendiente' | 'rechazado';
}

interface CalendarDay {
  number: number;
  isToday: boolean;
  hasEvent: boolean;
  events: Array<{ title: string; color: string }>;
}

interface ProximaClase {
  hora: string;
  fecha: string;
  ambiente: string;
  materia: string;
  estudiantes: number;
  color: string;
}

interface Notificacion {
  type: 'success' | 'info' | 'warning';
  icon: string;
  message: string;
  time: string;
}

interface ReportPeriod {
  value: string;
  label: string;
  icon: string;
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

  estadisticas: Estadistica[] = [
    {
      value: '12',
      label: 'Clases esta semana',
      icon: 'fas fa-calendar-check',
      bgColor: 'rgba(96, 150, 186, 0.1)',
      color: '#6096BA',
      trend: {
        type: 'positive',
        icon: 'fa-arrow-up',
        value: '+20%'
      },
      chartData: 'M0,25 L10,22 L20,20 L30,18 L40,15 L50,12 L60,10 L70,8 L80,10 L90,5 L100,8'
    },
    {
      value: '356',
      label: 'Estudiantes totales',
      icon: 'fas fa-users',
      bgColor: 'rgba(76, 175, 80, 0.1)',
      color: '#4CAF50',
      trend: {
        type: 'positive',
        icon: 'fa-arrow-up',
        value: '+15%'
      },
      chartData: 'M0,20 L10,18 L20,22 L30,15 L40,18 L50,10 L60,15 L70,8 L80,12 L90,5 L100,10'
    },
    {
      value: '95%',
      label: 'Asistencia promedio',
      icon: 'fas fa-user-check',
      bgColor: 'rgba(255, 152, 0, 0.1)',
      color: '#FF9800',
      trend: {
        type: 'positive',
        icon: 'fa-arrow-up',
        value: '+3%'
      },
      chartData: 'M0,15 L10,12 L20,10 L30,8 L40,10 L50,5 L60,8 L70,3 L80,5 L90,2 L100,5'
    },
    {
      value: '4.8',
      label: 'Valoración estudiantes',
      icon: 'fas fa-star',
      bgColor: 'rgba(163, 206, 241, 0.1)',
      color: '#A3CEF1',
      trend: {
        type: 'positive',
        icon: 'fa-arrow-up',
        value: '+0.2'
      },
      chartData: 'M0,20 L10,18 L20,15 L30,12 L40,10 L50,8 L60,10 L70,5 L80,8 L90,3 L100,5'
    }
  ];

  solicitudesRecientes: Solicitud[] = [
    {
      id: 1,
      ambiente: 'Laboratorio 201',
      fecha: 'Hoy',
      horario: '14:00 - 16:00',
      duracion: '2 horas',
      capacidad: 30,
      estado: 'aprobado'
    },
    {
      id: 2,
      ambiente: 'Aula 305',
      fecha: 'Mañana',
      horario: '08:00 - 10:00',
      duracion: '2 horas',
      capacidad: 40,
      estado: 'pendiente'
    },
    {
      id: 3,
      ambiente: 'Auditorio Principal',
      fecha: 'Viernes',
      horario: '10:00 - 12:00',
      duracion: '2 horas',
      capacidad: 100,
      estado: 'aprobado'
    }
  ];

  currentWeekDays: CalendarDay[] = [];

  proximasClases: ProximaClase[] = [
    {
      hora: '08:00',
      fecha: 'Hoy',
      ambiente: 'Lab 201',
      materia: 'Programación Web',
      estudiantes: 28,
      color: '#6096BA'
    },
    {
      hora: '14:00',
      fecha: 'Hoy',
      ambiente: 'Aula 305',
      materia: 'Base de Datos',
      estudiantes: 35,
      color: '#4CAF50'
    },
    {
      hora: '10:00',
      fecha: 'Mañana',
      ambiente: 'Lab 102',
      materia: 'Redes',
      estudiantes: 25,
      color: '#FF9800'
    }
  ];

  notificaciones: Notificacion[] = [
    {
      type: 'success',
      icon: 'fa-check-circle',
      message: 'Tu solicitud para el Lab 201 fue aprobada',
      time: 'Hace 2 horas'
    },
    {
      type: 'info',
      icon: 'fa-info-circle',
      message: 'Recuerda: Clase especial mañana en el auditorio',
      time: 'Hace 5 horas'
    },
    {
      type: 'warning',
      icon: 'fa-exclamation-circle',
      message: 'El ambiente 304 estará en mantenimiento el viernes',
      time: 'Ayer'
    }
  ];

  reportPeriods: ReportPeriod[] = [
    { value: 'week', label: 'Última Semana', icon: 'fa-calendar-week' },
    { value: 'month', label: 'Último Mes', icon: 'fa-calendar-alt' },
    { value: 'quarter', label: 'Último Trimestre', icon: 'fa-calendar' },
    { value: 'year', label: 'Último Año', icon: 'fa-calendar-check' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.actualizarFecha();
    this.iniciarActualizacionTiempo();
    this.generarCalendario();
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

  getStatusIcon(estado: 'aprobado' | 'pendiente' | 'rechazado'): string {
    const icons: { [key in 'aprobado' | 'pendiente' | 'rechazado']: string } = {
      'aprobado': 'fa-check',
      'pendiente': 'fa-clock',
      'rechazado': 'fa-times'
    };
    return icons[estado];
  }

  getStatusText(estado: 'aprobado' | 'pendiente' | 'rechazado'): string {
    const texts = {
      'aprobado': 'Aprobado',
      'pendiente': 'Pendiente',
      'rechazado': 'Rechazado'
    };
    return texts[estado];
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