import { Component, ViewEncapsulation, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { routes } from '../../app.routes';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
interface Movimiento {
  id: number;
  solicitante: string;
  codigoActivo: string;
  nombreActivo: string;
  tipoActivo: string;
  ambienteAsignado?: string;
  ambienteTrasladado?: string;
  fechaMovimiento: Date;
  estado: 'Disponible' | 'Ocupado' | 'Mantenimiento';
}

interface Ambiente {
  id: number;
  nombre: string;
}

interface TipoActivo {
  value: string;
  label: string;
  checked: boolean;
}

interface AppliedFilter {
  key: string;
  label: string;
  value: string;
}

interface ChartLegendItem {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, TopBarComponent, SidebarComponent],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None
})
export class EstadisticasComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChartRef!: ElementRef;
  @ViewChild('pieChart') pieChartRef!: ElementRef;
  
  // Propiedades generales
  movimientos: Movimiento[] = [];
  movimientosFiltrados: Movimiento[] = [];
  ambientes: Ambiente[] = [];
  tiposActivo: TipoActivo[] = [];
  activosTags: string[] = [];
  nuevoActivoTag: string = '';
  sidebarActive: boolean = true;
  filtersCollapsed: boolean = false;
  screenWidth: number;
  chartView: 'bar' | 'pie' | 'line' = 'bar';
  barChart: Chart | null = null;
  pieChart: Chart | null = null;
  
  // Propiedades de filtrado
  filters = {
    fechaDesde: '',
    fechaHasta: '',
    ambiente: '',
    tipoMovimiento: '',
    usuarioInvolucrado: ''
  };
  
  appliedFilters: AppliedFilter[] = [];
  
  // Propiedades de exportación
  exportOptions = {
    pdf: false,
    excel: false
  };
  
  // Propiedades de estadísticas
  stats = {
    totalMovimientos: 0,
    activosMovidos: 0,
    ambientesActivos: 0,
    mantenimientos: 0
  };
  
  // Propiedades de ordenamiento
  sortColumn: string = 'fechaMovimiento';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Propiedades de paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;
  
  // Leyenda del gráfico
  chartLegend: ChartLegendItem[] = [];
  
  // Fecha actual para límite en datepickers
  maxDate: string;
  
  // Usuario actual
  usuarioActual = {
    nombre: 'Juan Benicio',
    rol: 'Administrador'
  };
  
  // Acceso a Math para usar en la plantilla
  Math = Math;
  
  constructor(private datePipe: DatePipe) {
    // Inicializar el ancho de pantalla
    this.screenWidth = window.innerWidth;
    
    // Ajustar sidebar según tamaño de pantalla
    this.checkScreenSize();
    
    // Obtener fecha actual para límite de datepickers
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    // Cargar datos
    this.cargarMovimientos();
    this.cargarAmbientes();
    this.cargarTiposActivo();
    this.actualizarEstadisticas();
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.inicializarGraficos();
    }, 100);
  }

  // Método para detectar cambios en el tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    this.checkScreenSize();
    
    // Reiniciar gráficos al cambiar tamaño de pantalla
    this.actualizarGraficos();
  }

  // Comprobar tamaño de pantalla y ajustar sidebar
  checkScreenSize(): void {
    if (this.screenWidth < 991) {
      this.sidebarActive = false;
      this.filtersCollapsed = true;
    } else {
      this.sidebarActive = true;
      this.filtersCollapsed = false;
    }
  }

  // Cambiar estado del sidebar
  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }
  
  // Cambiar estado del panel de filtros
  toggleFilters(): void {
    this.filtersCollapsed = !this.filtersCollapsed;
  }

  // Cargar movimientos de activos
  cargarMovimientos(): void {
    // Aquí normalmente harías una llamada a un servicio
    // Por ahora, usamos datos de ejemplo
    const fechaActual = new Date();
    const fechaAyer = new Date(fechaActual);
    fechaAyer.setDate(fechaAyer.getDate() - 1);
    const fechaAnteayer = new Date(fechaActual);
    fechaAnteayer.setDate(fechaAnteayer.getDate() - 2);
    
    this.movimientos = [
      {
        id: 1,
        solicitante: 'Juan Benicio',
        codigoActivo: 'AA-001',
        nombreActivo: 'Mesa',
        tipoActivo: 'Silla',
        ambienteAsignado: 'Ambiente 1',
        fechaMovimiento: fechaActual,
        estado: 'Disponible'
      },
      {
        id: 2,
        solicitante: 'Jorge Mario',
        codigoActivo: 'AB-002',
        nombreActivo: 'Teclado Dell',
        tipoActivo: 'Mouse Dell',
        ambienteAsignado: 'Ambiente 2',
        fechaMovimiento: fechaAyer,
        estado: 'Ocupado'
      },
      {
        id: 3,
        solicitante: 'Carlos Lopez',
        codigoActivo: 'AC-003',
        nombreActivo: 'Mouse Dell',
        tipoActivo: 'Mouse Dell',
        ambienteAsignado: 'Ambiente 3',
        ambienteTrasladado: 'Ambiente 1',
        fechaMovimiento: fechaAnteayer,
        estado: 'Mantenimiento'
      },
      {
        id: 4,
        solicitante: 'Jaime Ortiz',
        codigoActivo: 'AD-004',
        nombreActivo: 'Silla',
        tipoActivo: 'Silla',
        ambienteAsignado: 'Ambiente 4',
        fechaMovimiento: fechaAyer,
        estado: 'Disponible'
      },
      {
        id: 5,
        solicitante: 'Rodrigo Perez',
        codigoActivo: 'AE-005',
        nombreActivo: 'Monitor Dell',
        tipoActivo: 'Mouse Dell',
        ambienteAsignado: 'Ambiente 2',
        ambienteTrasladado: 'Ambiente 3',
        fechaMovimiento: fechaActual,
        estado: 'Ocupado'
      }
    ];
    
    // Agregar más movimientos para demostrar paginación
    for (let i = 6; i <= 25; i++) {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
      
      const estados: ('Disponible' | 'Ocupado' | 'Mantenimiento')[] = ['Disponible', 'Ocupado', 'Mantenimiento'];
      const randomEstado = estados[Math.floor(Math.random() * estados.length)];
      
      const tiposActivo = ['Silla', 'Mesa', 'Mouse Dell', 'Teclado Dell', 'Monitor Dell'];
      const randomTipo = tiposActivo[Math.floor(Math.random() * tiposActivo.length)];
      
      const solicitantes = ['Juan Benicio', 'Jorge Mario', 'Carlos Lopez', 'Jaime Ortiz', 'Rodrigo Perez'];
      const randomSolicitante = solicitantes[Math.floor(Math.random() * solicitantes.length)];
      
      this.movimientos.push({
        id: i,
        solicitante: randomSolicitante,
        codigoActivo: `A${String.fromCharCode(64 + Math.floor(i / 5))}-${i.toString().padStart(3, '0')}`,
        nombreActivo: randomTipo,
        tipoActivo: randomTipo,
        ambienteAsignado: `Ambiente ${Math.floor(Math.random() * 4) + 1}`,
        ambienteTrasladado: Math.random() > 0.5 ? `Ambiente ${Math.floor(Math.random() * 4) + 1}` : undefined,
        fechaMovimiento: randomDate,
        estado: randomEstado
      });
    }
    
    // Inicializar los movimientos filtrados
    this.movimientosFiltrados = [...this.movimientos];
    this.totalItems = this.movimientosFiltrados.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    // Aplicar paginación
    this.aplicarPaginacion();
  }

  // Cargar ambientes disponibles
  cargarAmbientes(): void {
    // Aquí normalmente harías una llamada a un servicio
    this.ambientes = [
      { id: 1, nombre: 'Ambiente 1' },
      { id: 2, nombre: 'Ambiente 2' },
      { id: 3, nombre: 'Ambiente 3' },
      { id: 4, nombre: 'Ambiente 4' }
    ];
  }
  
  // Cargar tipos de activo
  cargarTiposActivo(): void {
    this.tiposActivo = [
      { value: 'silla', label: 'Silla', checked: true },
      { value: 'mesa', label: 'Mesa', checked: false },
      { value: 'mouse-dell', label: 'Mouse Dell', checked: true },
      { value: 'teclado-dell', label: 'Teclado Dell', checked: false }
    ];
  }
  
  // Añadir tag de activo
  addActivoTag(): void {
    if (this.nuevoActivoTag && !this.activosTags.includes(this.nuevoActivoTag)) {
      this.activosTags.push(this.nuevoActivoTag);
      this.nuevoActivoTag = '';
    }
  }
  
  // Eliminar tag de activo
  removeActivoTag(tag: string): void {
    this.activosTags = this.activosTags.filter(t => t !== tag);
  }
  
  // Alternar tipo de activo
  toggleTipoActivo(tipo: TipoActivo): void {
    tipo.checked = !tipo.checked;
  }
  
  // Aplicar filtros
  aplicarFiltros(): void {
    // Limpiar filtros aplicados actuales
    this.appliedFilters = [];
    
    // Filtrar por fecha desde
    if (this.filters.fechaDesde) {
      const fechaDesde = new Date(this.filters.fechaDesde);
      this.movimientosFiltrados = this.movimientos.filter(m => 
        new Date(m.fechaMovimiento) >= fechaDesde
      );
      this.appliedFilters.push({
        key: 'fechaDesde',
        label: 'Desde',
        value: this.datePipe.transform(fechaDesde, 'dd/MM/yyyy') || ''
      });
    } else {
      this.movimientosFiltrados = [...this.movimientos];
    }
    
    // Filtrar por fecha hasta
    if (this.filters.fechaHasta) {
      const fechaHasta = new Date(this.filters.fechaHasta);
      fechaHasta.setHours(23, 59, 59);
      this.movimientosFiltrados = this.movimientosFiltrados.filter(m => 
        new Date(m.fechaMovimiento) <= fechaHasta
      );
      this.appliedFilters.push({
        key: 'fechaHasta',
        label: 'Hasta',
        value: this.datePipe.transform(fechaHasta, 'dd/MM/yyyy') || ''
      });
    }
    
    // Filtrar por tipos de activo seleccionados (checkboxes)
    const tiposSeleccionados = this.tiposActivo
      .filter(t => t.checked)
      .map(t => t.label);
    
    if (tiposSeleccionados.length > 0) {
      this.movimientosFiltrados = this.movimientosFiltrados.filter(m => 
        tiposSeleccionados.includes(m.tipoActivo)
      );
      this.appliedFilters.push({
        key: 'tiposActivo',
        label: 'Tipos de Activo',
        value: tiposSeleccionados.join(', ')
      });
    }
    
    // Filtrar por tags de activo
    if (this.activosTags.length > 0) {
      this.movimientosFiltrados = this.movimientosFiltrados.filter(m => 
        this.activosTags.some(tag => 
          m.nombreActivo.toLowerCase().includes(tag.toLowerCase()) || 
          m.tipoActivo.toLowerCase().includes(tag.toLowerCase())
        )
      );
      this.appliedFilters.push({
        key: 'activosTags',
        label: 'Tags de Activo',
        value: this.activosTags.join(', ')
      });
    }
    
    // Filtrar por ambiente
    if (this.filters.ambiente) {
      this.movimientosFiltrados = this.movimientosFiltrados.filter(m => 
        m.ambienteAsignado === this.filters.ambiente || 
        m.ambienteTrasladado === this.filters.ambiente
      );
      this.appliedFilters.push({
        key: 'ambiente',
        label: 'Ambiente',
        value: this.filters.ambiente
      });
    }
    
    // Filtrar por tipo de movimiento
    if (this.filters.tipoMovimiento) {
      this.movimientosFiltrados = this.movimientosFiltrados.filter(m => 
        m.estado === this.filters.tipoMovimiento
      );
      this.appliedFilters.push({
        key: 'tipoMovimiento',
        label: 'Tipo de Movimiento',
        value: this.filters.tipoMovimiento
      });
    }
    
    // Filtrar por usuario involucrado
    if (this.filters.usuarioInvolucrado) {
      this.movimientosFiltrados = this.movimientosFiltrados.filter(m => 
        m.solicitante.toLowerCase().includes(this.filters.usuarioInvolucrado.toLowerCase())
      );
      this.appliedFilters.push({
        key: 'usuarioInvolucrado',
        label: 'Usuario',
        value: this.filters.usuarioInvolucrado
      });
    }
    
    // Actualizar paginación
    this.currentPage = 1;
    this.totalItems = this.movimientosFiltrados.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    // Aplicar paginación
    this.aplicarPaginacion();
    
    // Actualizar gráficos
    this.actualizarGraficos();
  }
  
  // Remover un filtro aplicado
  removeFilter(filter: AppliedFilter): void {
    switch (filter.key) {
      case 'fechaDesde':
        this.filters.fechaDesde = '';
        break;
      case 'fechaHasta':
        this.filters.fechaHasta = '';
        break;
      case 'tiposActivo':
        this.tiposActivo.forEach(t => t.checked = false);
        break;
      case 'activosTags':
        this.activosTags = [];
        break;
      case 'ambiente':
        this.filters.ambiente = '';
        break;
      case 'tipoMovimiento':
        this.filters.tipoMovimiento = '';
        break;
      case 'usuarioInvolucrado':
        this.filters.usuarioInvolucrado = '';
        break;
    }
    
    // Volver a aplicar filtros
    this.aplicarFiltros();
  }
  
  // Limpiar todos los filtros
  clearAllFilters(): void {
    this.filters = {
      fechaDesde: '',
      fechaHasta: '',
      ambiente: '',
      tipoMovimiento: '',
      usuarioInvolucrado: ''
    };
    
    this.tiposActivo.forEach(t => t.checked = false);
    this.activosTags = [];
    
    // Resetear los movimientos filtrados
    this.movimientosFiltrados = [...this.movimientos];
    this.appliedFilters = [];
    
    // Actualizar paginación
    this.currentPage = 1;
    this.totalItems = this.movimientosFiltrados.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    // Aplicar paginación
    this.aplicarPaginacion();
    
    // Actualizar gráficos
    this.actualizarGraficos();
  }
  
  // Verificar si se puede exportar
  canExport(): boolean {
    return this.exportOptions.pdf || this.exportOptions.excel;
  }
  
  // Exportar reporte
  exportReport(): void {
    if (!this.canExport()) return;
    
    if (this.exportOptions.pdf) {
      // Lógica para exportar a PDF
      console.log('Exportando a PDF...');
      alert('Exportando a PDF. Esta función se implementaría con una librería real.');
    }
    
    if (this.exportOptions.excel) {
      // Lógica para exportar a Excel
      console.log('Exportando a Excel...');
      alert('Exportando a Excel. Esta función se implementaría con una librería real.');
    }
  }
  
  // Inicializar gráficos
  inicializarGraficos(): void {
    this.crearGraficos();
  }
  
  // Crear gráficos
  crearGraficos(): void {
    // Destruir gráficos existentes
    if (this.barChart) {
      this.barChart.destroy();
    }
    
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    
    // Preparar datos para los gráficos
    const tiposActivo = [...new Set(this.movimientosFiltrados.map(m => m.tipoActivo))];
    const conteosPorTipo = tiposActivo.map(tipo => {
      return this.movimientosFiltrados.filter(m => m.tipoActivo === tipo).length;
    });
    
    // Generar colores
    const colores = [
      '#6096BA', // Azul medio
      '#A3CEF1', // Azul claro
      '#274C77', // Azul oscuro
      '#8FB8DE', // Otro tono de azul
      '#E7ECEF', // Gris claro
    ];
    
    // Crear gráfico de barras
    if (this.barChartRef && this.barChartRef.nativeElement) {
      const ctx = this.barChartRef.nativeElement.getContext('2d');
      
      this.barChart = new Chart(ctx, {
        type: this.chartView === 'line' ? 'line' : 'bar',
        data: {
          labels: tiposActivo,
          datasets: [{
            label: 'Número de movimientos',
            data: conteosPorTipo,
            backgroundColor: colores,
            borderColor: this.chartView === 'line' ? '#6096BA' : colores,
            borderWidth: 1,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
    
    // Crear gráfico de pastel
    if (this.pieChartRef && this.pieChartRef.nativeElement) {
      const ctx = this.pieChartRef.nativeElement.getContext('2d');
      
      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: tiposActivo,
          datasets: [{
            data: conteosPorTipo,
            backgroundColor: colores,
            borderColor: '#FFFFFF',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
    
    // Actualizar leyenda
    this.chartLegend = tiposActivo.map((tipo, index) => {
      return {
        label: tipo,
        value: conteosPorTipo[index],
        color: colores[index % colores.length]
      };
    });
  }
  
  // Actualizar gráficos
  actualizarGraficos(): void {
    setTimeout(() => {
      this.crearGraficos();
    }, 100);
  }
  
  // Cambiar vista de gráfico
  setChartView(view: 'bar' | 'pie' | 'line'): void {
    this.chartView = view;
    this.actualizarGraficos();
  }
  
  // Actualizar estadísticas generales
  actualizarEstadisticas(): void {
    this.stats = {
      totalMovimientos: this.movimientos.length,
      activosMovidos: [...new Set(this.movimientos.map(m => m.codigoActivo))].length,
      ambientesActivos: [...new Set(this.movimientos
        .flatMap(m => [m.ambienteAsignado, m.ambienteTrasladado])
        .filter(a => a))].length,
      mantenimientos: this.movimientos.filter(m => m.estado === 'Mantenimiento').length
    };
  }
  
  // Ordenar tabla
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      // Cambiar dirección si ya está ordenado por esta columna
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Nueva columna, ordenar ascendente por defecto
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    // Ordenar movimientos
    this.movimientosFiltrados.sort((a: any, b: any) => {
      let aValue = a[column];
      let bValue = b[column];
      
      // Manejo especial para fechas
      if (column === 'fechaMovimiento') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Comparar valores
      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    // Aplicar paginación
    this.aplicarPaginacion();
  }
  
  // Obtener icono para la columna ordenada
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
  
  // Cambiar página
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    
    this.currentPage = page;
    this.aplicarPaginacion();
  }
  
  // Obtener números de página para la paginación
  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar un subconjunto de páginas
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
      
      // Ajustar si estamos cerca del final
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  
  // Aplicar paginación
  aplicarPaginacion(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    
    // Asegurar que movimientosFiltrados use los movimientos actuales filtrados
    const allFilteredMovimientos = [...this.movimientosFiltrados];
    
    // Aplicar paginación
    this.movimientosFiltrados = allFilteredMovimientos.slice(start, end);
  }

  // Cerrar sesión
  cerrarSesion(): void {
    // Aquí iría la lógica de cerrar sesión
    console.log('Cerrando sesión...');
  }
}