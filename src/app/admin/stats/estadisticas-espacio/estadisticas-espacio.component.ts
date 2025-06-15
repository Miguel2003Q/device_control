import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, debounceTime } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import * as FileSaver from 'file-saver';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from "../../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";

// Registrar Chart.js
Chart.register(...registerables);

interface EstadisticasEspacioDTO {
  totalEspacios: number;
  totalEspaciosActivos: number;
  totalEspaciosEliminados: number;
  capacidadTotal: number;
  capacidadPromedio: number;
  espaciosPorEstado: { [key: string]: number };
  capacidadMaxima: number;
  capacidadMinima: number;
  rangoCapacidades: { [key: string]: number };
  topEspaciosPorCapacidad: { [key: string]: number };
  porcentajeUtilizacionPorEstado: { [key: string]: number };
  porcentajeEspaciosActivos: number;
  porcentajeEspaciosEliminados: number;
}

interface ViewMode {
  estado: 'chart' | 'table';
  capacidad: 'chart' | 'table';
}

@Component({
  selector: 'app-estadisticas-espacio',
  standalone: true,
  imports: [CommonModule, TopBarComponent, SidebarComponent],
  templateUrl: './estadisticas-espacio.component.html',
  styleUrls: ['./estadisticas-espacio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Optimización de detección de cambios
})
export class EstadisticasEspacioComponent implements OnInit, AfterViewInit {

  sidebarActive: boolean = false;

  @ViewChild('estadoChart', { static: false }) estadoChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('capacidadChart', { static: false }) capacidadChartRef?: ElementRef<HTMLCanvasElement>;

  estadisticas: EstadisticasEspacioDTO | null = null;
  loading = false;
  showJson = false;
  showPdfModal = false;
  pdfUrl: SafeResourceUrl | null = null;

  viewMode: ViewMode = {
    estado: 'chart',
    capacidad: 'chart'
  };

  private estadoChart: Chart | null = null;
  private capacidadChart: Chart | null = null;
  private refreshSubject = new Subject<void>(); // Para debounce de refresh

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef // Para detección de cambios manual
  ) { }

  ngOnInit(): void {
    // Configurar debounce para refresh
    this.refreshSubject.pipe(debounceTime(500)).subscribe(() => this.loadEstadisticas());
    this.loadEstadisticas();
  }

  ngAfterViewInit(): void {
    // this.initializeCharts();
  }

  loadEstadisticas(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.http.get<EstadisticasEspacioDTO>('http://localhost:8080/api/espacios/reportes/estadisticas')
      .pipe(
        catchError((error) => {
          console.error('Error al cargar estadísticas:', error);
          this.estadisticas = this.getMockData();
          this.initializeCharts(); // Initialize with mock data
          alert('Error al cargar estadísticas. Usando datos de prueba.');
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((data) => {
        if (data) {
          this.estadisticas = data;
          this.initializeCharts(); // Initialize with real data
        }
      });
  }

  refreshData(): void {
    this.refreshSubject.next(); // Activar refresh con debounce
  }

  initializeCharts(): void {
    if (this.estadisticas) {
      if (this.viewMode.estado === 'chart' && this.estadoChartRef) {
        this.createEstadoChart();
      }
      if (this.viewMode.capacidad === 'chart' && this.capacidadChartRef) {
        this.createCapacidadChart();
      }
    }
  }

  createEstadoChart(): void {
    if (!this.estadoChartRef || this.viewMode.estado !== 'chart' || !this.estadisticas) return;

    const ctx = this.estadoChartRef.nativeElement;
    if (this.estadoChart) {
      this.estadoChart.destroy();
    }

    const labels = Object.keys(this.estadisticas.espaciosPorEstado || {});
    const data = Object.values(this.estadisticas.espaciosPorEstado || []);
    if (labels.length === 0 || data.length === 0) {
      console.warn('No data available for estadoChart');
      return;
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#70ad47', '#e74c3c', '#f39c12', '#3498db', '#9b59b6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 20, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
                const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.estadoChart = new Chart(ctx, config);
    this.cdr.markForCheck();
  }

  createCapacidadChart(): void {
    if (!this.capacidadChartRef || this.viewMode.capacidad !== 'chart' || !this.estadisticas) return;

    const ctx = this.capacidadChartRef.nativeElement;
    if (this.capacidadChart) {
      this.capacidadChart.destroy();
    }

    const labels = Object.keys(this.estadisticas.rangoCapacidades);
    const data = Object.values(this.estadisticas.rangoCapacidades);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad de Espacios',
          data: data,
          backgroundColor: '#2c5aa0',
          borderRadius: 6
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
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.capacidadChart = new Chart(ctx, config);
    this.cdr.markForCheck();
  }

  toggleView(type: keyof ViewMode): void {
    this.viewMode[type] = this.viewMode[type] === 'chart' ? 'table' : 'chart';
    this.initializeCharts();
    this.cdr.markForCheck();
  }

  getEstadosList(): Array<{ key: string, value: number }> {
    if (!this.estadisticas || !this.estadisticas.espaciosPorEstado) return [];
    return Object.entries(this.estadisticas.espaciosPorEstado).map(([key, value]) => ({ key, value }));
  }

  getRangosList(): Array<{ key: string, value: number }> {
    if (!this.estadisticas || !this.estadisticas.rangoCapacidades) return [];
    return Object.entries(this.estadisticas.rangoCapacidades).map(([key, value]) => ({ key, value }));
  }

  getTopEspaciosList(): Array<{ key: string, value: number }> {
    if (!this.estadisticas || !this.estadisticas.topEspaciosPorCapacidad) return [];
    return Object.entries(this.estadisticas.topEspaciosPorCapacidad).map(([key, value]) => ({ key, value }));
  }

  getUtilizacionList(): Array<{ key: string, value: number }> {
    if (!this.estadisticas || !this.estadisticas.porcentajeUtilizacionPorEstado) return [];
    return Object.entries(this.estadisticas.porcentajeUtilizacionPorEstado).map(([key, value]) => ({ key, value }));
  }

  getPercentage(value: number, total: number): number {
    if (!total || total === 0) return 0;
    return (value / total) * 100;
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('disponible')) return 'disponible';
    if (statusLower.includes('ocupado')) return 'ocupado';
    if (statusLower.includes('mantenimiento')) return 'mantenimiento';
    if (statusLower.includes('reservado')) return 'reservado';
    return '';
  }

  toggleJsonView(): void {
    this.showJson = !this.showJson;
    this.cdr.markForCheck();
  }

  copyJson(): void {
    if (this.estadisticas) {
      const jsonString = JSON.stringify(this.estadisticas, null, 2);
      navigator.clipboard.writeText(jsonString).then(() => {
        alert('JSON copiado al portapapeles'); // Reemplazar con servicio de notificaciones
      }).catch(err => {
        console.error('Error al copiar:', err);
        alert('Error al copiar JSON');
      });
    }
  }

  downloadJson(): void {
    if (this.estadisticas) {
      const jsonString = JSON.stringify(this.estadisticas, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      FileSaver.saveAs(blob, `estadisticas_espacios_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    }
  }

  viewPDF(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.http.get('http://localhost:8080/api/espacios/reportes/estadisticas/pdf', { responseType: 'blob' })
      .pipe(
        catchError((error) => {
          console.error('Error al generar PDF:', error);
          alert('Error al generar el PDF. Verifica el servidor o intenta de nuevo.');
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.showPdfModal = true;
        }
      });
  }

  downloadPDF(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.http.get('http://localhost:8080/api/espacios/reportes/estadisticas/pdf', { responseType: 'blob' })
      .pipe(
        catchError((error) => {
          console.error('Error al descargar PDF:', error);
          alert('Error al descargar el PDF. Verifica el servidor o intenta de nuevo.');
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((blob) => {
        if (blob) {
          FileSaver.saveAs(blob, `estadisticas_espacios_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`);
        }
      });
  }

  downloadExcel(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.http.get('http://localhost:8080/api/espacios/reportes/estadisticas/excel', { responseType: 'blob' })
      .pipe(
        catchError((error) => {
          console.error('Error al descargar Excel:', error);
          alert('Error al descargar el Excel. Verifica el servidor o intenta de nuevo.');
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((blob) => {
        if (blob) {
          FileSaver.saveAs(blob, `estadisticas_espacios_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`);
        }
      });
  }

  closePdfModal(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showPdfModal = false;
    this.pdfUrl = null;
    this.cdr.markForCheck();
  }

  private getMockData(): EstadisticasEspacioDTO {
    return {
      totalEspacios: 150,
      totalEspaciosActivos: 135,
      totalEspaciosEliminados: 15,
      capacidadTotal: 5450,
      capacidadPromedio: 40.37,
      espaciosPorEstado: {
        'Disponible': 65,
        'Ocupado': 45,
        'Mantenimiento': 15,
        'Reservado': 10
      },
      capacidadMaxima: 200,
      capacidadMinima: 10,
      rangoCapacidades: {
        '0-20 personas': 25,
        '21-50 personas': 70,
        '51-100 personas': 35,
        'Más de 100 personas': 5
      },
      topEspaciosPorCapacidad: {
        'Auditorio Principal': 200,
        'Sala de Conferencias A': 150,
        'Aula Magna': 120,
        'Laboratorio de Cómputo': 100,
        'Sala de Reuniones VIP': 80,
        'Aula 301': 75,
        'Biblioteca Central': 70,
        'Cafetería': 60,
        'Sala de Profesores': 50,
        'Aula 201': 45
      },
      porcentajeUtilizacionPorEstado: {
        'Disponible': 48.15,
        'Ocupado': 33.33,
        'Mantenimiento': 11.11,
        'Reservado': 7.41
      },
      porcentajeEspaciosActivos: 90.0,
      porcentajeEspaciosEliminados: 10.0
    };
  }

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}