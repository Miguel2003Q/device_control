import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { interval, Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';

// Importar interfaces
import { Activo } from '../../core/models/activo.model';
import { TipoActivo } from '../../core/models/TipoActivo';
import { Espacio } from '../../core/models/espacio.model';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { ActivoService } from '../../core/services/activo.service';

Chart.register(...registerables);

interface EstadisticaPrincipal {
  value: number;
  label: string;
  icon: string;
  colorClass: string;
  trend: {
    type: 'positive' | 'negative';
    icon: string;
    text: string;
  };
}

interface EstadoActivo {
  nombre: string;
  cantidad: number;
  color: string;
}

interface Categoria {
  nombre: string;
  cantidad: number;
  porcentaje: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-almacen-home',
  imports: [CommonModule, RouterLink, TopBarComponent, SidebarComponent],
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
  sidebarActive = false;
  fechaActual = '';
  notificacionesPendientes = 3;
  filtroActivo = 'todos';
  activos: Activo[] = [];

  private timeInterval?: Subscription;
  private estadoChart?: Chart;

  estadisticasPrincipales: EstadisticaPrincipal[] = [];

  estadosActivos: EstadoActivo[] = [];

  categorias: Categoria[] = [
    {
      nombre: 'Equipos de Cómputo',
      cantidad: 85,
      porcentaje: 34.4,
      icon: 'fas fa-desktop',
      color: '#6096BA'
    },
    {
      nombre: 'Mobiliario',
      cantidad: 67,
      porcentaje: 27.1,
      icon: 'fas fa-chair',
      color: '#4CAF50'
    },
    {
      nombre: 'Equipos Audiovisuales',
      cantidad: 43,
      porcentaje: 17.4,
      icon: 'fas fa-tv',
      color: '#FF9800'
    },
    {
      nombre: 'Herramientas',
      cantidad: 32,
      porcentaje: 13.0,
      icon: 'fas fa-wrench',
      color: '#9C27B0'
    },
    {
      nombre: 'Material Didáctico',
      cantidad: 20,
      porcentaje: 8.1,
      icon: 'fas fa-book',
      color: '#2196F3'
    }
  ];

  constructor(private router: Router, private activoService: ActivoService) { }

  ngOnInit(): void {
    this.getEstadisticasPrincipales();
    // this.inicializarEstadosActivos();
    this.actualizarFecha();
    this.iniciarActualizacionTiempo();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      this.timeInterval.unsubscribe();
    }
    if (this.estadoChart) {
      this.estadoChart.destroy();
    }
  }

  inicializarTiposDeActivos(): void {
    const resumen: { [key: string]: number } = {};
    const total = this.activos.length;

    // Contar los activos por tipo
    this.activos.forEach(activo => {
      const tipoNombre = activo.tipoActivo.nombre;
      if (!resumen[tipoNombre]) {
        resumen[tipoNombre] = 0;
      }
      resumen[tipoNombre]++;
    });

    // Asignar colores e íconos (puedes ajustarlos como quieras o generar dinámicamente)
    const colores: string[] = ['#6096BA', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3', '#F44336'];
    const iconos: string[] = ['fas fa-desktop', 'fas fa-chair', 'fas fa-tv', 'fas fa-wrench', 'fas fa-book', 'fas fa-cogs'];

    let colorIndex = 0;

    // Construir el array `categorias`
    this.categorias = Object.keys(resumen).map((tipoNombre, i) => {
      const cantidad = resumen[tipoNombre];
      return {
        nombre: tipoNombre,
        cantidad,
        porcentaje: +(cantidad / total * 100).toFixed(1),
        icon: iconos[i % iconos.length],
        color: colores[colorIndex++ % colores.length]
      };
    });
  }


  inicializarEstadosActivos(): void {
    const estados = ['Disponible', 'Ocupado', 'Mantenimiento'];
    const colores: { [key: string]: string } = {
      'Disponible': '#4CAF50',
      'Ocupado': '#FF9800',
      'Mantenimiento': '#F44336'
    };

    const resumen: { [key: string]: number } = {
      'Disponible': 0,
      'Ocupado': 0,
      'Mantenimiento': 0
    };

    // Cuenta los activos por estado
    this.activos.forEach(activo => {
      const estadoNombre = this.estadoMap[activo.estado]; // convierte 'D' a 'Disponible', etc.
      if (estadoNombre && resumen.hasOwnProperty(estadoNombre)) {
        resumen[estadoNombre]++;
      }
    });

    // Construye el array de estadosActivos actualizado
    this.estadosActivos = estados.map(estado => ({
      nombre: estado,
      cantidad: resumen[estado],
      color: colores[estado]
    }));
  }



  getEstadisticasPrincipales(): void {
    this.activoService.obtenerTodosLosActivos().subscribe((activos) => {
      this.activos = activos;
      this.inicializarEstadosActivos(); // Actualiza los estados activos
      this.crearGraficoEstados();
      this.inicializarTiposDeActivos(); // Inicializa las categorías de activos
      const total = activos.length;
      const disponibles = activos.filter(a => this.estadoMap[a.estado] === 'Disponible').length;
      const enUso = activos.filter(a => this.estadoMap[a.estado] === 'Ocupado').length;
      const enMantenimiento = activos.filter(a => this.estadoMap[a.estado] === 'Mantenimiento').length;

      this.estadisticasPrincipales = [
        {
          value: total,
          label: 'Total de Activos',
          icon: 'fas fa-boxes',
          colorClass: 'primary',
          trend: {
            type: 'positive',
            icon: 'fa-arrow-up',
            text: `+${Math.floor(Math.random() * 20)} este mes` // ejemplo de tendencia
          }
        },
        {
          value: disponibles,
          label: 'Activos Disponibles',
          icon: 'fas fa-check-circle',
          colorClass: 'success',
          trend: {
            type: 'positive',
            icon: 'fa-arrow-up',
            text: `${((disponibles / total) * 100).toFixed(1)}% del total`
          }
        },
        {
          value: enUso,
          label: 'Ocupados',
          icon: 'fas fa-user-check',
          colorClass: 'warning',
          trend: {
            type: enUso < 50 ? 'negative' : 'positive', // lógica ejemplo
            icon: enUso < 50 ? 'fa-arrow-down' : 'fa-arrow-up',
            text: enUso < 50 ? '-5 vs ayer' : '+3 vs ayer'
          }
        },
        {
          value: enMantenimiento,
          label: 'En Mantenimiento',
          icon: 'fas fa-tools',
          colorClass: 'danger',
          trend: {
            type: 'positive',
            icon: 'fa-arrow-up',
            text: `+${Math.floor(Math.random() * 5)} programados`
          }
        }
      ];
      // Usa setTimeout para esperar al render
      setTimeout(() => this.animarNumeros(), 50);
    });
  }

  estadoMap: { [key: string]: string } = {
    'D': 'Disponible',
    'O': 'Ocupado',
    'M': 'Mantenimiento'
  };

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

  animarNumeros(): void {
    setTimeout(() => {
      const elementos = document.querySelectorAll('.stat-value');
      elementos.forEach((el: any) => {
        const valorFinal = parseInt(el.getAttribute('data-value') || '0', 10);
        this.animarValor(el, 0, valorFinal, 1500);
      });
    }, 300);
  }


  animarValor(elemento: HTMLElement, inicio: number, fin: number, duracion: number): void {
    let tiempoInicio: number | null = null;
    const paso = (tiempo: number) => {
      if (!tiempoInicio) tiempoInicio = tiempo;
      const progreso = Math.min((tiempo - tiempoInicio) / duracion, 1);
      const valor = Math.floor(progreso * (fin - inicio) + inicio);
      elemento.textContent = valor.toString();

      if (progreso < 1) {
        window.requestAnimationFrame(paso);
      }
    };
    window.requestAnimationFrame(paso);
  }

  crearGraficoEstados(): void {
    const ctx = document.getElementById('estadoChart') as HTMLCanvasElement;
    if (ctx) {
      this.estadoChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.estadosActivos.map(e => e.nombre),
          datasets: [{
            data: this.estadosActivos.map(e => e.cantidad),
            backgroundColor: this.estadosActivos.map(e => e.color),
            borderWidth: 0
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

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  exportarInventario(): void {
    console.log('Exportando inventario...');
    // Aquí iría la lógica para exportar el inventario a Excel
    // Por ejemplo, usando una librería como SheetJS

    // Simulación de exportación exitosa
    setTimeout(() => {
      alert('Inventario exportado exitosamente');
    }, 1000);
  }

  getMovimientoIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'entrada': 'fa-sign-in-alt',
      'salida': 'fa-sign-out-alt',
      'mantenimiento': 'fa-tools',
      'nuevo': 'fa-plus-circle'
    };
    return icons[tipo] || 'fa-question';
  }

  cambiarFiltro(filtro: string): void {
    this.filtroActivo = filtro;
    // Aquí iría la lógica para filtrar los activos destacados
    console.log('Filtrando por:', filtro);
  }

  // Método para navegar a la vista de detalles del activo
  verDetalleActivo(idActivo: number): void {
    this.router.navigate(['/activo', idActivo]);
  }

  // Método para buscar activo por serial
  buscarActivoPorSerial(event: Event): void {
    const input = event.target as HTMLInputElement;
    const serial = input.value;

    if (serial.length > 3) {
      // Aquí iría la lógica de búsqueda
      console.log('Buscando activo con serial:', serial);
    }
  }

  // Método para programar mantenimiento
  programarMantenimiento(): void {
    this.router.navigate(['/mantenimiento/programar']);
  }

  // Método para escanear código QR
  escanearQR(): void {
    this.router.navigate(['/escanear-qr']);
  }

  // Método auxiliar para formatear fechas
  formatearFecha(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short'
    };
    return fecha.toLocaleDateString('es-ES', opciones).toUpperCase();
  }

  // Método para calcular porcentajes
  calcularPorcentaje(valor: number, total: number): number {
    return Math.round((valor / total) * 100);
  }

  // Método para obtener el color según el estado
  getColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      'Activo': '#4CAF50',
      'En Uso': '#FF9800',
      'En Mantenimiento': '#F44336',
      'Inactivo': '#9E9E9E'
    };
    return colores[estado] || '#757575';
  }

  // Método para actualizar estadísticas (simulación)
  actualizarEstadisticas(): void {
    // Aquí se conectaría con el servicio para obtener datos actualizados
    console.log('Actualizando estadísticas...');
  }

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}