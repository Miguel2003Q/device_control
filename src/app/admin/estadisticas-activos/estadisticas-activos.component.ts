import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { TopBarComponent } from '../shared/top-bar/top-bar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { ActivoService } from '../../core/services/activo.service';
import { EspacioService } from '../../core/services/espacio.service';
import { TipoActivoService } from '../../core/services/tipoactivo.service';
import { LoadingService } from '../../core/services/loading.service';
import { ToastrService } from 'ngx-toastr';
import { Activo } from '../../core/models/activo.model';
import { Espacio } from '../../core/models/espacio.model';
import { TipoActivo } from '../../core/models/TipoActivo';
import { Router } from '@angular/router';

// Registrar Chart.js
Chart.register(...registerables);

interface Estadisticas {
  totalActivos: number;
  activosDisponibles: number;
  activosOcupados: number;
  activosMantenimiento: number;
  porcentajeCambio: number;
}

interface EspacioEstadistica {
  idespacio?: number;
  nombre: string;
  totalActivos: number;
  disponibles: number;
  ocupados: number;
  mantenimiento: number;
  porcentajeOcupacion: number;
  tasaUso?: number;
  tiempoPromedio?: number;
}

interface TopActivo {
  nombre: string;
  tipoActivo: string;
  espacio: string;
  vecesUtilizado: number;
}

@Component({
  selector: 'app-estadisticas-activos',
  standalone: true,
  imports: [CommonModule, FormsModule, TopBarComponent, SidebarComponent],
  templateUrl: './estadisticas-activos.component.html',
  styleUrls: ['./estadisticas-activos.component.css']
})
export class EstadisticasActivosComponent implements OnInit, OnDestroy {
  @ViewChild('estadoChart') estadoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tipoChart') tipoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tendenciaChart') tendenciaChartRef!: ElementRef<HTMLCanvasElement>;

  // Propiedades
  sidebarActive: boolean = true;
  screenWidth: number;
  selectedPeriod: string = 'month';
  searchEspacio: string = '';
  chartType: 'pie' | 'doughnut' = 'pie';
  barChartType: 'bar' | 'horizontalBar' = 'bar';
  timeRange: string = '30d';
  showModalDetalles: boolean = false;
  espacioSeleccionado: EspacioEstadistica | null = null;
  activosEspacioModal: any[] = [];

  // Datos
  activos: Activo[] = [];
  espacios: Espacio[] = [];
  tiposActivo: TipoActivo[] = [];
  estadisticas: Estadisticas = {
    totalActivos: 0,
    activosDisponibles: 0,
    activosOcupados: 0,
    activosMantenimiento: 0,
    porcentajeCambio: 0
  };
  espaciosEstadisticas: EspacioEstadistica[] = [];
  espaciosEstadisticasFiltrados: EspacioEstadistica[] = [];
  topActivos: TopActivo[] = [];

  // Charts
  estadoChart: Chart | null = null;
  tipoChart: Chart | null = null;
  tendenciaChart: Chart | null = null;
  espacioModalChart: Chart | null = null;

  constructor(
    private activoService: ActivoService,
    private espacioService: EspacioService,
    private tipoActivoService: TipoActivoService,
    private loading: LoadingService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    // Destruir gráficos al destruir componente
    this.estadoChart?.destroy();
    this.tipoChart?.destroy();
    this.tendenciaChart?.destroy();
    this.espacioModalChart?.destroy();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    this.checkScreenSize();
    // Redimensionar gráficos
    this.estadoChart?.resize();
    this.tipoChart?.resize();
    this.tendenciaChart?.resize();
  }

  checkScreenSize(): void {
    if (this.screenWidth < 991) {
      this.sidebarActive = false;
    } else {
      this.sidebarActive = true;
    }
  }

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  async cargarDatos(): Promise<void> {
    this.loading.show();
    try {
      // Cargar datos en paralelo
      const [activos, espacios, tiposActivo] = await Promise.all([
        this.activoService.obtenerTodosLosActivos().toPromise(),
        this.espacioService.obtenerTodosLosEspacios().toPromise(),
        this.tipoActivoService.obtenerTodosLosTiposActivos().toPromise()
      ]);

      this.activos = activos || [];
      this.espacios = espacios || [];
      this.tiposActivo = tiposActivo || [];

      this.calcularEstadisticas();
      this.calcularEstadisticasPorEspacio();
      this.generarTopActivos();
      
      // Esperar a que los elementos canvas estén disponibles
      setTimeout(() => {
        this.inicializarGraficos();
      }, 100);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.toastr.error('Error al cargar las estadísticas');
    } finally {
      this.loading.hide();
    }
  }

  calcularEstadisticas(): void {
    const total = this.activos.length;
    const disponibles = this.activos.filter(a => a.estado === 'D').length;
    const ocupados = this.activos.filter(a => a.estado === 'O').length;
    const mantenimiento = this.activos.filter(a => a.estado === 'M').length;

    // Simular cambio porcentual (en producción vendría del backend)
    const cambio = Math.floor(Math.random() * 20) - 10;

    this.estadisticas = {
      totalActivos: total,
      activosDisponibles: disponibles,
      activosOcupados: ocupados,
      activosMantenimiento: mantenimiento,
      porcentajeCambio: cambio
    };
  }

  calcularPorcentaje(tipo: string): string {
    const total = this.estadisticas.totalActivos;
    if (total === 0) return '0';

    let cantidad = 0;
    switch (tipo) {
      case 'disponibles':
        cantidad = this.estadisticas.activosDisponibles;
        break;
      case 'ocupados':
        cantidad = this.estadisticas.activosOcupados;
        break;
      case 'mantenimiento':
        cantidad = this.estadisticas.activosMantenimiento;
        break;
    }

    return ((cantidad / total) * 100).toFixed(1);
  }

  calcularEstadisticasPorEspacio(): void {
    this.espaciosEstadisticas = this.espacios.map(espacio => {
      const activosEspacio = this.activos.filter(a => a.espacio?.idespacio === espacio.idespacio);
      const total = activosEspacio.length;
      const disponibles = activosEspacio.filter(a => a.estado === 'D').length;
      const ocupados = activosEspacio.filter(a => a.estado === 'O').length;
      const mantenimiento = activosEspacio.filter(a => a.estado === 'M').length;
      
      const porcentajeOcupacion = total > 0 ? Math.round((ocupados / total) * 100) : 0;
      
      return {
        idespacio: espacio.idespacio,
        nombre: espacio.nombre,
        totalActivos: total,
        disponibles,
        ocupados,
        mantenimiento,
        porcentajeOcupacion,
        tasaUso: Math.floor(Math.random() * 100), // Simulado
        tiempoPromedio: Math.floor(Math.random() * 24) // Simulado
      };
    });

    this.espaciosEstadisticasFiltrados = [...this.espaciosEstadisticas];
  }

  generarTopActivos(): void {
    // Simular top activos (en producción vendría del backend con datos reales de uso)
    this.topActivos = this.activos
      .slice(0, 10)
      .map(activo => ({
        nombre: activo.nombre,
        tipoActivo: activo.tipoActivo?.nombre || 'Sin tipo',
        espacio: activo.espacio?.nombre || 'Sin espacio',
        vecesUtilizado: Math.floor(Math.random() * 100) + 20
      }))
      .sort((a, b) => b.vecesUtilizado - a.vecesUtilizado);
  }

  inicializarGraficos(): void {
    this.crearGraficoEstado();
    this.crearGraficoTipo();
    this.crearGraficoTendencia();
    this.crearMiniCharts();
  }

  crearGraficoEstado(): void {
    if (!this.estadoChartRef?.nativeElement) return;

    const ctx = this.estadoChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.estadoChart?.destroy();

    const data = {
      labels: ['Disponibles', 'Ocupados', 'Mantenimiento'],
      datasets: [{
        data: [
          this.estadisticas.activosDisponibles,
          this.estadisticas.activosOcupados,
          this.estadisticas.activosMantenimiento
        ],
        backgroundColor: ['#4CAF50', '#F44336', '#FF9800'],
        borderWidth: 0
      }]
    };

    this.estadoChart = new Chart(ctx, {
      type: this.chartType as ChartType,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = this.estadisticas.totalActivos;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  crearGraficoTipo(): void {
    if (!this.tipoChartRef?.nativeElement) return;

    const ctx = this.tipoChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.tipoChart?.destroy();

    // Agrupar activos por tipo
    const activosPorTipo = new Map<string, number>();
    this.activos.forEach(activo => {
      const tipo = activo.tipoActivo?.nombre || 'Sin tipo';
      activosPorTipo.set(tipo, (activosPorTipo.get(tipo) || 0) + 1);
    });

    const labels = Array.from(activosPorTipo.keys());
    const data = Array.from(activosPorTipo.values());

    this.tipoChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad de Activos',
          data: data,
          backgroundColor: '#6096BA',
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: this.barChartType === 'horizontalBar' ? 'y' : 'x',
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  crearGraficoTendencia(): void {
    if (!this.tendenciaChartRef?.nativeElement) return;

    const ctx = this.tendenciaChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.tendenciaChart?.destroy();

    // Generar datos de tendencia simulados
    const labels = this.generarEtiquetasTiempo();
    const dataDisponibles = this.generarDatosTendencia();
    const dataOcupados = this.generarDatosTendencia();
    const dataMantenimiento = this.generarDatosTendencia();

    this.tendenciaChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Disponibles',
            data: dataDisponibles,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4
          },
          {
            label: 'Ocupados',
            data: dataOcupados,
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            tension: 0.4
          },
          {
            label: 'Mantenimiento',
            data: dataMantenimiento,
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 5
            }
          }
        }
      }
    });
  }

  crearMiniCharts(): void {
    // Crear mini gráficos para top activos
    setTimeout(() => {
      this.topActivos.forEach((activo, index) => {
        const canvas = document.getElementById(`miniChart${index}`) as HTMLCanvasElement;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['', '', '', '', ''],
            datasets: [{
              data: this.generarDatosMini(),
              borderColor: '#6096BA',
              borderWidth: 2,
              pointRadius: 0,
              fill: false
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
      });
    }, 200);
  }

  generarEtiquetasTiempo(): string[] {
    const labels: string[] = [];
    const dias = this.timeRange === '7d' ? 7 : this.timeRange === '30d' ? 30 : this.timeRange === '90d' ? 90 : 365;
    
    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      
      if (dias <= 7) {
        labels.push(fecha.toLocaleDateString('es', { weekday: 'short' }));
      } else if (dias <= 30) {
        labels.push(fecha.getDate().toString());
      } else {
        labels.push(fecha.toLocaleDateString('es', { month: 'short', day: 'numeric' }));
      }
    }
    
    return labels;
  }

  generarDatosTendencia(): number[] {
    const dias = this.timeRange === '7d' ? 7 : this.timeRange === '30d' ? 30 : this.timeRange === '90d' ? 90 : 365;
    return Array.from({ length: dias }, () => Math.floor(Math.random() * 50) + 10);
  }

  generarDatosMini(): number[] {
    return Array.from({ length: 5 }, () => Math.floor(Math.random() * 20) + 5);
  }

  changeChartType(type: 'pie' | 'doughnut'): void {
    this.chartType = type;
    this.crearGraficoEstado();
  }

  changeBarChartType(type: 'bar' | 'horizontalBar'): void {
    this.barChartType = type;
    this.crearGraficoTipo();
  }

  changeTimeRange(range: string): void {
    this.timeRange = range;
    this.crearGraficoTendencia();
  }

  onPeriodChange(): void {
    // Recargar datos según el período seleccionado
    this.cargarDatos();
  }

  filtrarEspacios(): void {
    const termino = this.searchEspacio.toLowerCase();
    this.espaciosEstadisticasFiltrados = this.espaciosEstadisticas.filter(espacio =>
      espacio.nombre.toLowerCase().includes(termino)
    );
  }

  verDetallesEspacio(espacio: EspacioEstadistica): void {
    this.espacioSeleccionado = espacio;
    this.activosEspacioModal = this.activos
      .filter(a => a.espacio?.idespacio === espacio.idespacio)
      .map(a => ({
        nombre: a.nombre,
        tipoActivo: a.tipoActivo?.nombre || 'Sin tipo',
        estado: this.getEstadoLabel(a.estado)
      }));
    
    this.showModalDetalles = true;
    
    // Crear gráfico del modal después de mostrarlo
    setTimeout(() => {
      this.crearGraficoEspacioModal();
    }, 100);
  }

  crearGraficoEspacioModal(): void {
    const canvas = document.getElementById('espacioModalChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.espacioModalChart?.destroy();

    this.espacioModalChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Disponibles', 'Ocupados', 'Mantenimiento'],
        datasets: [{
          data: [
            this.espacioSeleccionado?.disponibles || 0,
            this.espacioSeleccionado?.ocupados || 0,
            this.espacioSeleccionado?.mantenimiento || 0
          ],
          backgroundColor: ['#4CAF50', '#F44336', '#FF9800']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  getEstadoLabel(estado: string): string {
    const estados: { [key: string]: string } = {
      'D': 'Disponible',
      'O': 'Ocupado',
      'M': 'Mantenimiento'
    };
    return estados[estado] || estado;
  }

  cerrarModal(event: Event): void {
    this.showModalDetalles = false;
    this.espacioSeleccionado = null;
    this.espacioModalChart?.destroy();
  }

  exportarReporte(): void {
    this.router.navigate(['/gestion-activos']);
    }
}