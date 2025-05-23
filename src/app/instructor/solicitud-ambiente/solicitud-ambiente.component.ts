import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

interface SolicitudAmbiente {
  id: number;
  ambiente: string;
  fechaPrestamo: Date;
  horaPrestamo: string;
  fechaDevolucion: Date;
  horaDevolucion: string;
  solicitante: string;
  motivo: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'En Proceso';
}

interface SolicitudActivo {
  id: number;
  codigoActivo: string;
  ambienteOrigen: string;
  ambienteDestino: string;
  fechaMovimiento: Date;
  motivo: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'En Proceso';
}

interface Ambiente {
  id: number;
  nombre: string;
  estado: 'Disponible' | 'Ocupado' | 'Mantenimiento';
  capacidad: number;
  ubicacion: string;
}

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './solicitud-ambiente.component.html',
  styleUrls: ['./solicitud-ambiente.component.css']
})
export class SolicitudAmbienteComponent implements OnInit {
  // Propiedades generales
  activeTab: 'ambientes' | 'solicitudes' = 'solicitudes';
  sidebarActive: boolean = true;
  screenWidth: number;
  searchTerm: string = '';
  filtroEstado: string = '';
  
  // Datos
  solicitudesAmbiente: SolicitudAmbiente[] = [];
  solicitudesActivo: SolicitudActivo[] = [];
  ambientes: Ambiente[] = [];
  ambientesDisponibles: Ambiente[] = [];
  
  // Datos filtrados
  solicitudesAmbienteFiltradas: SolicitudAmbiente[] = [];
  solicitudesActivoFiltradas: SolicitudActivo[] = [];
  ambientesFiltrados: Ambiente[] = [];
  
  // Modal
  showModalSolicitud: boolean = false;
  solicitudForm: FormGroup;
  isSubmitting: boolean = false;
  
  // Notificaciones
  notificaciones: any[] = [];
  alertas: any[] = [];
  
  // Fecha mínima para solicitudes
  minDate: string;
  
  // Usuario actual
  usuarioActual = {
    nombre: 'Juan Benicio',
    rol: 'Administrador'
  };
  
  constructor(private fb: FormBuilder) {
    // Inicializar el ancho de pantalla
    this.screenWidth = window.innerWidth;
    
    // Ajustar sidebar según tamaño de pantalla
    this.checkScreenSize();
    
    // Obtener fecha actual como mínima
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    // Inicializar formulario
    this.solicitudForm = this.fb.group({
      ambiente: ['', [Validators.required]],
      fechaPrestamo: ['', [Validators.required]],
      horaPrestamo: ['', [Validators.required]],
      fechaDevolucion: ['', [Validators.required]],
      horaDevolucion: ['', [Validators.required]],
      motivo: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Cargar datos
    this.cargarSolicitudesAmbiente();
    this.cargarSolicitudesActivo();
    this.cargarAmbientes();
    this.cargarNotificaciones();
  }

  // Método para detectar cambios en el tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    this.checkScreenSize();
  }

  // Comprobar tamaño de pantalla y ajustar sidebar
  checkScreenSize(): void {
    if (this.screenWidth < 991) {
      this.sidebarActive = false;
    } else {
      this.sidebarActive = true;
    }
  }

  // Cambiar estado del sidebar
  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  // Cambiar pestaña activa
  setActiveTab(tab: 'ambientes' | 'solicitudes'): void {
    this.activeTab = tab;
    this.searchTerm = '';
    this.filtroEstado = '';
    
    if (tab === 'ambientes') {
      this.filtrarAmbientes();
    } else {
      this.filtrarSolicitudes();
    }
  }

  // Cargar solicitudes de ambiente
  cargarSolicitudesAmbiente(): void {
    // Datos de ejemplo
    this.solicitudesAmbiente = [
      {
        id: 1,
        ambiente: 'Ambiente 1',
        fechaPrestamo: new Date('2025-05-25'),
        horaPrestamo: '11:00',
        fechaDevolucion: new Date('2025-05-25'),
        horaDevolucion: '4:00',
        solicitante: 'Juan Benicio',
        motivo: 'Clases BD',
        estado: 'Pendiente'
      },
      {
        id: 2,
        ambiente: 'Ambiente 2',
        fechaPrestamo: new Date('2025-05-26'),
        horaPrestamo: '09:00',
        fechaDevolucion: new Date('2025-05-26'),
        horaDevolucion: '17:00',
        solicitante: 'Jorge Mario',
        motivo: 'Conferencia de Tecnología',
        estado: 'Aprobado'
      },
      {
        id: 3,
        ambiente: 'Ambiente 3',
        fechaPrestamo: new Date('2025-05-27'),
        horaPrestamo: '14:00',
        fechaDevolucion: new Date('2025-05-27'),
        horaDevolucion: '18:00',
        solicitante: 'Carlos Lopez',
        motivo: 'Taller de programación',
        estado: 'Rechazado'
      }
    ];
    
    this.solicitudesAmbienteFiltradas = [...this.solicitudesAmbiente];
  }

  // Cargar solicitudes de activo
  cargarSolicitudesActivo(): void {
    // Datos de ejemplo
    this.solicitudesActivo = [
      {
        id: 1,
        codigoActivo: 'AA-001',
        ambienteOrigen: 'Ambiente 1',
        ambienteDestino: 'Ambiente 2',
        fechaMovimiento: new Date('2025-05-25'),
        motivo: 'Prestamo',
        estado: 'Pendiente'
      },
      {
        id: 2,
        codigoActivo: 'AB-002',
        ambienteOrigen: 'Ambiente 3',
        ambienteDestino: 'Ambiente 1',
        fechaMovimiento: new Date('2025-05-24'),
        motivo: 'Reubicación por mantenimiento',
        estado: 'Aprobado'
      },
      {
        id: 3,
        codigoActivo: 'AC-003',
        ambienteOrigen: 'Ambiente 2',
        ambienteDestino: 'Ambiente 4',
        fechaMovimiento: new Date('2025-05-23'),
        motivo: 'Cambio de ubicación permanente',
        estado: 'En Proceso'
      }
    ];
    
    this.solicitudesActivoFiltradas = [...this.solicitudesActivo];
  }

  // Cargar ambientes
  cargarAmbientes(): void {
    // Datos de ejemplo
    this.ambientes = [
      {
        id: 1,
        nombre: 'Ambiente 1',
        estado: 'Disponible',
        capacidad: 25,
        ubicacion: 'Bloque A, Piso 1'
      },
      {
        id: 2,
        nombre: 'Ambiente 2',
        estado: 'Ocupado',
        capacidad: 30,
        ubicacion: 'Bloque B, Piso 2'
      },
      {
        id: 3,
        nombre: 'Ambiente 3',
        estado: 'Disponible',
        capacidad: 15,
        ubicacion: 'Bloque A, Piso 3'
      },
      {
        id: 4,
        nombre: 'Ambiente 4',
        estado: 'Mantenimiento',
        capacidad: 20,
        ubicacion: 'Bloque C, Piso 1'
      }
    ];
    
    this.ambientesDisponibles = this.ambientes.filter(a => a.estado === 'Disponible');
    this.ambientesFiltrados = [...this.ambientes];
  }

  // Cargar notificaciones
  cargarNotificaciones(): void {
    // Simular notificaciones y alertas
    this.notificaciones = [
      { id: 1, mensaje: 'Nueva solicitud pendiente' },
      { id: 2, mensaje: 'Solicitud aprobada' }
    ];
    
    this.alertas = [
      { id: 1, mensaje: 'Ambiente requiere mantenimiento' }
    ];
  }

  // Filtrar solicitudes
  filtrarSolicitudes(): void {
    // Filtrar solicitudes de ambiente
    this.solicitudesAmbienteFiltradas = this.solicitudesAmbiente.filter(solicitud => {
      const searchMatch = this.searchTerm === '' || 
        solicitud.ambiente.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        solicitud.solicitante.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        solicitud.motivo.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const estadoMatch = this.filtroEstado === '' || 
        solicitud.estado === this.filtroEstado;
      
      return searchMatch && estadoMatch;
    });
    
    // Filtrar solicitudes de activo
    this.solicitudesActivoFiltradas = this.solicitudesActivo.filter(solicitud => {
      const searchMatch = this.searchTerm === '' || 
        solicitud.codigoActivo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        solicitud.ambienteOrigen.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        solicitud.ambienteDestino.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        solicitud.motivo.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const estadoMatch = this.filtroEstado === '' || 
        solicitud.estado === this.filtroEstado;
      
      return searchMatch && estadoMatch;
    });
  }

  // Filtrar ambientes
  filtrarAmbientes(): void {
    this.ambientesFiltrados = this.ambientes.filter(ambiente => {
      const searchMatch = this.searchTerm === '' || 
        ambiente.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ambiente.ubicacion.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const estadoMatch = this.filtroEstado === '' || 
        ambiente.estado === this.filtroEstado;
      
      return searchMatch && estadoMatch;
    });
  }

  // Obtener solicitudes pendientes
  getSolicitudesPendientes(tipo: 'ambiente' | 'activo'): any[] {
    if (tipo === 'ambiente') {
      return this.solicitudesAmbiente.filter(s => s.estado === 'Pendiente');
    } else {
      return this.solicitudesActivo.filter(s => s.estado === 'Pendiente');
    }
  }

  // Obtener icono para estado
  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'fa-clock';
      case 'Aprobado':
        return 'fa-check-circle';
      case 'Rechazado':
        return 'fa-times-circle';
      case 'En Proceso':
        return 'fa-sync-alt';
      default:
        return 'fa-info-circle';
    }
  }

  // Aprobar solicitud
  aprobarSolicitud(tipo: 'ambiente' | 'activo', id: number): void {
    const confirmacion = confirm('¿Está seguro de aprobar esta solicitud?');
    if (!confirmacion) return;
    
    if (tipo === 'ambiente') {
      this.solicitudesAmbiente = this.solicitudesAmbiente.map(s => 
        s.id === id ? { ...s, estado: 'Aprobado' as 'Aprobado' } : s
      );
      this.filtrarSolicitudes();
    } else {
      this.solicitudesActivo = this.solicitudesActivo.map(s => 
        s.id === id ? { ...s, estado: 'Aprobado' as 'Aprobado' } : s
      );
      this.filtrarSolicitudes();
    }
    
    alert('Solicitud aprobada correctamente');
  }

  // Rechazar solicitud
  rechazarSolicitud(tipo: 'ambiente' | 'activo', id: number): void {
    const motivo = prompt('Ingrese el motivo del rechazo (opcional):');
    if (motivo === null) return; // Usuario canceló
    
    if (tipo === 'ambiente') {
      this.solicitudesAmbiente = this.solicitudesAmbiente.map(s => 
        s.id === id ? { ...s, estado: 'Rechazado' as 'Rechazado' } : s
      );
      this.filtrarSolicitudes();
    } else {
      this.solicitudesActivo = this.solicitudesActivo.map(s => 
        s.id === id ? { ...s, estado: 'Rechazado' as 'Rechazado' } : s
      );
      this.filtrarSolicitudes();
    }
    
    alert('Solicitud rechazada');
  }

  // Abrir modal para nueva solicitud
  abrirModalSolicitudAmbiente(): void {
    this.solicitudForm.reset();
    this.showModalSolicitud = true;
  }

  // Cerrar modal
  cerrarModalSolicitud(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay') || 
        target.classList.contains('close-modal-btn') ||
        target.classList.contains('cancel-btn')) {
      this.showModalSolicitud = false;
    }
  }

  // Validar campo del formulario
  isInvalid(field: string): boolean {
    const control = this.solicitudForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Enviar solicitud de ambiente
  enviarSolicitudAmbiente(): void {
    if (this.solicitudForm.invalid) {
      Object.keys(this.solicitudForm.controls).forEach(key => {
        const control = this.solicitudForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Simular envío
    setTimeout(() => {
      const formData = this.solicitudForm.value;
      
      const nuevaSolicitud: SolicitudAmbiente = {
        id: Math.max(...this.solicitudesAmbiente.map(s => s.id), 0) + 1,
        ambiente: formData.ambiente,
        fechaPrestamo: new Date(formData.fechaPrestamo),
        horaPrestamo: formData.horaPrestamo,
        fechaDevolucion: new Date(formData.fechaDevolucion),
        horaDevolucion: formData.horaDevolucion,
        solicitante: this.usuarioActual.nombre,
        motivo: formData.motivo,
        estado: 'Pendiente'
      };
      
      this.solicitudesAmbiente.push(nuevaSolicitud);
      this.filtrarSolicitudes();
      
      this.isSubmitting = false;
      this.showModalSolicitud = false;
      
      alert('Solicitud enviada correctamente. Será revisada por un administrador.');
    }, 1500);
  }

  // Solicitar ambiente
  solicitarAmbiente(ambiente: Ambiente): void {
    if (ambiente.estado !== 'Disponible') {
      alert('Este ambiente no está disponible para solicitudes');
      return;
    }
    
    // Pre-llenar el formulario con el ambiente seleccionado
    this.solicitudForm.patchValue({
      ambiente: ambiente.nombre
    });
    
    this.showModalSolicitud = true;
  }

  // Ver detalles del ambiente
  verDetallesAmbiente(ambiente: Ambiente): void {
    alert('Detalles del ${ambiente.nombre}:\n\nCapacidad: ${ambiente.capacidad} personas\nUbicación: ${ambiente.ubicacion}\nEstado: ${ambiente.estado}');
  }

  // Cerrar sesión
  cerrarSesion(): void {
    console.log('Cerrando sesión...');
  }
}