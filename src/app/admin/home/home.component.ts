import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { forkJoin, interval, Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { Usuario } from '../../core/models/usuario.model';
import { SolicitudEspacio } from '../../core/models/solicitudEspacio.model';
import { Activo } from '../../core/models/activo.model';
import { EspacioService } from '../../core/services/espacio.service';
import { SolicitudEspacioService } from '../../core/services/solicitudEspacio.service';
import { ActivoService } from '../../core/services/activo.service';
import { UsuarioService } from '../../core/services/usuario.service';

Chart.register(...registerables);

interface SummaryCard {
  title: string;
  value: string;
  icon: string;
  type: 'primary' | 'success' | 'warning' | 'info';
  trend: {
    type: 'positive' | 'negative';
    icon: string;
    value: number;
  };
}

interface RolUsuario {
  nombre: string;
  cantidad: number;
  color: string;
}

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, TopBarComponent, SidebarComponent, RouterLink],
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
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

  usuarios: Usuario[] = [];
  solicitudes: SolicitudEspacio[] = [];
  espaciosOcupados: number = 0;
  totalEspacios: number = 100;
  activos: Activo[] = [];
  totalActivosDisponibles = 0;
  porcentajeActivosDisponibles: number = 0;


  sidebarActive = false;
  fabActive = false;
  horaActual = '';
  selectedPeriod: 'day' | 'week' | 'month' | 'year' = 'week';

  totalUsuarios = 0;
  usuariosActivos = 0;
  totalActivos = 0;

  private timeInterval?: Subscription;
  private activityChart?: Chart;
  private usersChart?: Chart;
  private miniCharts: Chart[] = [];

  summaryCards: SummaryCard[] = [];

  usuariosPorRol: RolUsuario[] = [];

  constructor(private router: Router,
    private usuarioService: UsuarioService,
    private solicitudEspacioService: SolicitudEspacioService,
    private activoService: ActivoService,
    private espacioService: EspacioService) { }

  ngOnInit(): void {
    this.cargarDatosDashboard();
    this.actualizarHora();
    this.iniciarActualizacionTiempo();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      this.timeInterval.unsubscribe();
    }
    if (this.activityChart) {
      this.activityChart.destroy();
    }
    if (this.usersChart) {
      this.usersChart.destroy();
    }
    this.miniCharts.forEach(chart => chart.destroy());
  }

  inicializarSummaryCards(): void {
    const totalUsuarios = this.usuarios.length;
    const totalSolicitudesHoy = this.solicitudes.filter(s => this.esHoy(s.fechaSolicitud)).length;
    const porcentajeOcupacion = this.totalEspacios > 0
      ? Math.round((this.espaciosOcupados / this.totalEspacios) * 100)
      : 0;
    this.totalActivosDisponibles = this.activos.filter(a => a.estado === 'D').length;
    // Para centro de gestión
    this.porcentajeActivosDisponibles = (this.totalActivosDisponibles / this.activos.length * 100);
    this.totalActivos = this.activos.length;
    this.totalUsuarios = totalUsuarios;
    this.usuariosActivos = totalUsuarios;

    this.summaryCards = [
      {
        title: 'Usuarios Totales',
        value: totalUsuarios.toString(),
        icon: 'fas fa-users',
        type: 'primary',
        trend: {
          type: 'positive',
          icon: 'fa-arrow-up',
          value: 12 // puedes calcularlo según histórico
        }
      },
      {
        title: 'Solicitudes Hoy',
        value: totalSolicitudesHoy.toString(),
        icon: 'fas fa-clipboard-list',
        type: 'success',
        trend: {
          type: 'positive',
          icon: 'fa-arrow-up',
          value: 23 // cambia esto si tienes un valor comparativo
        }
      },
      {
        title: 'Ocupación Espacios',
        value: `${porcentajeOcupacion}%`,
        icon: 'fas fa-building',
        type: 'warning',
        trend: {
          type: porcentajeOcupacion < 70 ? 'negative' : 'positive',
          icon: porcentajeOcupacion < 70 ? 'fa-arrow-down' : 'fa-arrow-up',
          value: 5 // opcionalmente dinámico
        }
      },
      {
        title: 'Activos disponibles',
        value: this.totalActivosDisponibles.toString(),
        icon: 'fas fa-boxes',
        type: 'info',
        trend: {
          type: 'positive',
          icon: 'fa-arrow-up',
          value: 8 // histórico si aplica
        }
      }
    ];
    this.animarNumeros();
  }

  inicializarUsuariosPorRol(): void {
    const conteo: { [rol: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0
    };

    this.usuarios.forEach(usuario => {
      if (conteo[usuario.rol] !== undefined) {
        conteo[usuario.rol]++;
      }
    });

    this.usuariosPorRol = Object.entries(this.MAPA_ROLES).map(([rolStr, info]) => {
      const rol = +rolStr; // Convertimos string a number
      return {
        nombre: info.nombre,
        cantidad: conteo[rol] || 0,
        color: info.color
      };
    });
  }


  private readonly MAPA_ROLES: { [rol: number]: { nombre: string; color: string } } = {
    1: { nombre: 'Vigilante', color: '#007bff' },
    2: { nombre: 'Instructor', color: '#28a745' },
    3: { nombre: 'Almacen', color: '#ffc107' },
    4: { nombre: 'Administrador', color: '#6c757d' }
  };



  esHoy(fecha: Date | string): boolean {
    const hoy = new Date();
    const f = new Date(fecha);
    return f.getDate() === hoy.getDate() &&
      f.getMonth() === hoy.getMonth() &&
      f.getFullYear() === hoy.getFullYear();
  }

  cargarDatosDashboard(): void {
    forkJoin({  //Para hacer todas las peticiones en paralelo
      usuarios: this.usuarioService.obtenerTodosLosUsuarios(),
      solicitudes: this.solicitudEspacioService.obtenerTodosLosMovimientos(),
      espacios: this.espacioService.obtenerTodosLosEspacios(),
      activos: this.activoService.obtenerTodosLosActivos()
    }).subscribe({
      next: ({ usuarios, solicitudes, espacios, activos }) => {
        this.usuarios = usuarios;
        this.solicitudes = solicitudes;
        this.totalEspacios = espacios.length;
        this.espaciosOcupados = espacios.filter(e => e.estado === "Ocupado").length;
        this.activos = activos;

        this.inicializarSummaryCards();
        this.inicializarUsuariosPorRol();
        this.crearGraficos();
      this.crearMiniGraficos();
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard', err);
      }
    });
  }


  actualizarHora(): void {
    const now = new Date();
    this.horaActual = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  iniciarActualizacionTiempo(): void {
    this.timeInterval = interval(60000).subscribe(() => {
      this.actualizarHora();
    });
  }

  animarNumeros(): void {
    setTimeout(() => {
      const elementos = document.querySelectorAll('.card-value');
      elementos.forEach((elemento: any) => {
        const valorTexto = elemento.textContent;
        const esPorcentaje = valorTexto.includes('%');
        const valorNumerico = parseInt(valorTexto.replace('%', ''));

        if (!isNaN(valorNumerico)) {
          this.animarValor(elemento, 0, valorNumerico, 1500, esPorcentaje);
        }
      });

      // Animar también las métricas en tiempo real
      const metricas = document.querySelectorAll('.metric-value');
      metricas.forEach((elemento: any) => {
        const valor = parseInt(elemento.textContent);
        if (!isNaN(valor)) {
          this.animarValor(elemento, 0, valor, 1200, false);
        }
      });
    }, 300);
  }

  animarValor(elemento: HTMLElement, inicio: number, fin: number, duracion: number, esPorcentaje: boolean): void {
    let tiempoInicio: number | null = null;
    const paso = (tiempo: number) => {
      if (!tiempoInicio) tiempoInicio = tiempo;
      const progreso = Math.min((tiempo - tiempoInicio) / duracion, 1);
      const valor = Math.floor(progreso * (fin - inicio) + inicio);

      elemento.textContent = esPorcentaje ? `${valor}%` : valor.toString();

      if (progreso < 1) {
        window.requestAnimationFrame(paso);
      }
    };
    window.requestAnimationFrame(paso);
  }

  crearGraficos(): void {
    // Gráfico de usuarios por rol
    const ctxUsers = document.getElementById('usersChart') as HTMLCanvasElement;
    if (ctxUsers) {
      this.usersChart = new Chart(ctxUsers, {
        type: 'doughnut',
        data: {
          labels: this.usuariosPorRol.map(r => r.nombre),
          datasets: [{
            data: this.usuariosPorRol.map(r => r.cantidad),
            backgroundColor: this.usuariosPorRol.map(r => r.color),
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }

  crearMiniGraficos(): void {
    this.summaryCards.forEach((card, index) => {
      const ctx = document.getElementById(`miniChart${index}`) as HTMLCanvasElement;
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['', '', '', '', '', '', ''],
            datasets: [{
              data: this.generateRandomData(7, 20, 100),
              borderColor: this.getColorForCardType(card.type),
              borderWidth: 2,
              fill: false,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false }
            },
            scales: {
              x: { display: false },
              y: { display: false }
            }
          }
        });
        this.miniCharts.push(chart);
      }
    });
  }

  getColorForCardType(type: 'primary' | 'success' | 'warning' | 'info'): string {
    const colors: { [key in 'primary' | 'success' | 'warning' | 'info']: string } = {
      'primary': '#1a237e',
      'success': '#00c853',
      'warning': '#ffab00',
      'info': '#2962ff'
    };
    return colors[type] || '#757575';
  }

  generateRandomData(count: number, min: number, max: number): number[] {
    const data = [];
    let prev = Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 0; i < count; i++) {
      const change = Math.floor(Math.random() * 20) - 10;
      prev = Math.max(min, Math.min(max, prev + change));
      data.push(prev);
    }
    return data;
  }

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  toggleFab(): void {
    this.fabActive = !this.fabActive;
  }

  generarReporte(): void {
    console.log('Generando reporte administrativo...');

    // Simulación de generación de reporte
    const tipoReporte = prompt('Seleccione el tipo de reporte:\n1. Reporte General\n2. Reporte de Usuarios\n3. Reporte de Espacios\n4. Reporte de Activos');

    if (tipoReporte) {
      // Mostrar loading
      const mensajeGenerando = 'Generando reporte...';
      console.log(mensajeGenerando);

      // Simular descarga después de 2 segundos
      setTimeout(() => {
        alert('Reporte generado y descargado exitosamente');
        // Aquí iría la lógica real de generación y descarga del PDF
      }, 2000);
    }
  }

  // Limpiar recursos al destruir el componente
  limpiarRecursos(): void {
    if (this.timeInterval) {
      this.timeInterval.unsubscribe();
    }

    // Destruir todos los gráficos
    if (this.activityChart) {
      this.activityChart.destroy();
    }
    if (this.usersChart) {
      this.usersChart.destroy();
    }
    this.miniCharts.forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  }

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}