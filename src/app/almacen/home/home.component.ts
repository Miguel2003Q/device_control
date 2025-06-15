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

interface Movimiento {
  tipo: 'entrada' | 'salida' | 'mantenimiento' | 'nuevo';
  activo: string;
  serial: string;
  descripcion: string;
  ubicacion: string;
  tiempo: string;
}

interface Mantenimiento {
  dia: string;
  mes: string;
  activo: string;
  tipo: string;
  urgencia: 'normal' | 'urgente';
}

interface AlertaStock {
  mensaje: string;
  categoria: string;
}

interface ActivoDestacado extends Activo {
  usoMensual: number;
}

interface Metrica {
  titulo: string;
  valor: string;
  icon: string;
  cambio: number;
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
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  sidebarActive = false;
  fechaActual = '';
  notificacionesPendientes = 3;
  filtroActivo = 'todos';
  
  private timeInterval?: Subscription;
  private estadoChart?: Chart;

  estadisticasPrincipales: EstadisticaPrincipal[] = [
    {
      value: 247,
      label: 'Total de Activos',
      icon: 'fas fa-boxes',
      colorClass: 'primary',
      trend: {
        type: 'positive',
        icon: 'fa-arrow-up',
        text: '+12 este mes'
      }
    },
    {
      value: 189,
      label: 'Activos Disponibles',
      icon: 'fas fa-check-circle',
      colorClass: 'success',
      trend: {
        type: 'positive',
        icon: 'fa-arrow-up',
        text: '76.5% del total'
      }
    },
    {
      value: 45,
      label: 'En Uso',
      icon: 'fas fa-user-check',
      colorClass: 'warning',
      trend: {
        type: 'negative',
        icon: 'fa-arrow-down',
        text: '-5 vs ayer'
      }
    },
    {
      value: 13,
      label: 'En Mantenimiento',
      icon: 'fas fa-tools',
      colorClass: 'danger',
      trend: {
        type: 'positive',
        icon: 'fa-arrow-up',
        text: '+2 programados'
      }
    }
  ];

  estadosActivos: EstadoActivo[] = [
    { nombre: 'Activo', cantidad: 189, color: '#4CAF50' },
    { nombre: 'En Uso', cantidad: 45, color: '#FF9800' },
    { nombre: 'Mantenimiento', cantidad: 13, color: '#F44336' },
    { nombre: 'Inactivo', cantidad: 0, color: '#9E9E9E' }
  ];

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

  ultimosMovimientos: Movimiento[] = [
    {
      tipo: 'entrada',
      activo: 'Laptop Dell Latitude 5520',
      serial: 'DLL-2024-0145',
      descripcion: 'Devuelto por instructor después de clase',
      ubicacion: 'Almacén Principal',
      tiempo: 'Hace 15 minutos'
    },
    {
      tipo: 'salida',
      activo: 'Proyector Epson X41+',
      serial: 'EPS-2023-0089',
      descripcion: 'Prestado para clase en Aula 305',
      ubicacion: 'Aula 305',
      tiempo: 'Hace 1 hora'
    },
    {
      tipo: 'mantenimiento',
      activo: 'Impresora HP LaserJet',
      serial: 'HPL-2022-0034',
      descripcion: 'Enviado a mantenimiento preventivo',
      ubicacion: 'Taller de Servicio',
      tiempo: 'Hace 2 horas'
    },
    {
      tipo: 'nuevo',
      activo: 'Monitor Samsung 24"',
      serial: 'SMS-2024-0201',
      descripcion: 'Nuevo activo registrado en el sistema',
      ubicacion: 'Almacén Principal',
      tiempo: 'Hace 3 horas'
    }
  ];

  proximosMantenimientos: Mantenimiento[] = [
    {
      dia: '15',
      mes: 'DIC',
      activo: 'Aire Acondicionado - Lab 201',
      tipo: 'Mantenimiento Preventivo',
      urgencia: 'normal'
    },
    {
      dia: '18',
      mes: 'DIC',
      activo: 'UPS Central',
      tipo: 'Revisión Baterías',
      urgencia: 'urgente'
    },
    {
      dia: '22',
      mes: 'DIC',
      activo: 'Proyectores Aulas 301-305',
      tipo: 'Limpieza de Lentes',
      urgencia: 'normal'
    }
  ];

  alertasStock: AlertaStock[] = [
    {
      mensaje: 'Stock bajo de toner para impresoras HP',
      categoria: 'Consumibles'
    },
    {
      mensaje: 'Solo 2 proyectores disponibles',
      categoria: 'Audiovisuales'
    },
    {
      mensaje: 'Cables HDMI por debajo del mínimo',
      categoria: 'Accesorios'
    }
  ];

  activosDestacados: ActivoDestacado[] = [
    {
      idactivo: 1,
      nombre: 'Laptop Dell Latitude 5520',
      url: 'assets/images/laptop.jpg',
      serial: 'DLL-2024-0145',
      estado: 'Activo',
      observaciones: 'Equipo en excelente estado',
      espacio: { idespacio: 1, nombre: 'Lab 201', descripcion: ''},
      tipoActivo: { idtipoact: 1, nombre: 'Equipos de Cómputo' },
      usoMensual: 85
    },
    {
      idactivo: 2,
      nombre: 'Proyector Epson X41+',
      url: 'assets/images/proyector.jpg',
      serial: 'EPS-2023-0089',
      estado: 'Activo',
      observaciones: 'Lámpara con 1200 horas de uso',
      espacio: { idespacio: 2, nombre: 'Aula 305', descripcion: ''},
      tipoActivo: { idtipoact: 2, nombre: 'Equipos Audiovisuales' },
      usoMensual: 92
    },
    {
      idactivo: 3,
      nombre: 'Mesa de Trabajo Industrial',
      url: 'assets/images/mesa.jpg',
      serial: 'MTI-2022-0067',
      estado: 'Activo',
      observaciones: 'Mesa reforzada para talleres',
      espacio: { idespacio: 3, nombre: 'Taller Mecánica', descripcion: ''},
      tipoActivo: { idtipoact: 3, nombre: 'Mobiliario' },
      usoMensual: 78
    },
    {
      idactivo: 4,
      nombre: 'Kit Herramientas Eléctricas',
      url: 'assets/images/herramientas.jpg',
      serial: 'KHE-2023-0102',
      estado: 'En Mantenimiento',
      observaciones: 'Revisión programada',
      espacio: { idespacio: 4, nombre: 'Almacén', descripcion: ''},
      tipoActivo: { idtipoact: 4, nombre: 'Herramientas' },
      usoMensual: 65
    }
  ];

  filtrosTabla = [
    { value: 'todos', label: 'Todos' },
    { value: 'semana', label: 'Esta Semana' },
    { value: 'mes', label: 'Este Mes' }
  ];

  metricas: Metrica[] = [
    {
      titulo: 'Rotación de Inventario',
      valor: '3.2x',
      icon: 'fas fa-sync-alt',
      cambio: 15
    },
    {
      titulo: 'Tiempo Promedio de Préstamo',
      valor: '4.5h',
      icon: 'fas fa-clock',
      cambio: -8
    },
    {
      titulo: 'Tasa de Disponibilidad',
      valor: '87%',
      icon: 'fas fa-chart-line',
      cambio: 5
    },
    {
      titulo: 'Solicitudes Atendidas',
      valor: '156',
      icon: 'fas fa-clipboard-check',
      cambio: 22
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.actualizarFecha();
    this.iniciarActualizacionTiempo();
    this.animarNumeros();
  }

  ngAfterViewInit(): void {
    this.crearGraficoEstados();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      this.timeInterval.unsubscribe();
    }
    if (this.estadoChart) {
      this.estadoChart.destroy();
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

  animarNumeros(): void {
    setTimeout(() => {
      const elementos = document.querySelectorAll('.stat-value');
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