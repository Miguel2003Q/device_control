import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
interface Ambiente {
  id: number;
  nombre: string;
  estado: 'Disponible' | 'Ocupado' | 'Mantenimiento';
  reservadoPor?: string;
  periodoDeUso?: string;
  capacidad?: number;
  ubicacion?: string;
  proyector?: boolean;
  computadoras?: boolean;
  wifi?: boolean;
}

@Component({
  selector: 'app-ambientes',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './gestion-ambientes.component.html',
  styleUrls: ['./gestion-ambientes.component.css']
})
export class GestionAmbientesComponent implements OnInit {
  // Propiedades del componente
  ambientes: Ambiente[] = [];
  ambientesFiltrados: Ambiente[] = [];
  searchTerm: string = '';
  filtroEstado: string = '';
  sidebarActive: boolean = true;
  screenWidth: number;
  
  // Propiedades para el modal de crear/editar ambiente
  showModal: boolean = false;
  isEditing: boolean = false;
  ambienteForm: FormGroup;
  isSubmitting: boolean = false;
  
  // Propiedades para el modal de solicitar ambiente
  showSolicitarModal: boolean = false;
  ambienteSeleccionado: Ambiente | null = null;
  solicitudForm: FormGroup;
  
  // Propiedades para el modal de detalles
  showDetallesModal: boolean = false;
  
  // Usuario actual
  usuarioActual = {
    nombre: 'Juan Benicio',
    rol: 'Administrador'
  };
  
  constructor(private fb: FormBuilder) {
    // Inicializar el ancho de pantalla
    this.screenWidth = window.innerWidth;
    
    // Inicializar formulario de ambiente
    this.ambienteForm = this.fb.group({
      id: [0],
      nombre: ['', [Validators.required]],
      estado: ['Disponible'],
      capacidad: [null, [Validators.required, Validators.min(1)]],
      ubicacion: ['', [Validators.required]],
      proyector: [false],
      computadoras: [false],
      wifi: [false]
    });
    
    // Inicializar formulario de solicitud
    this.solicitudForm = this.fb.group({
      fecha: ['', [Validators.required]],
      horaInicio: ['', [Validators.required]],
      horaFin: ['', [Validators.required]],
      proposito: ['', [Validators.required]]
    });
    
    // Ajustar sidebar según tamaño de pantalla
    this.checkScreenSize();
  }

  ngOnInit(): void {
    // Cargar datos
    this.cargarAmbientes();
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

  // Cargar lista de ambientes
  cargarAmbientes(): void {
    // Aquí normalmente harías una llamada a un servicio
    // Por ahora, usamos datos de ejemplo
    this.ambientes = [
      {
        id: 1,
        nombre: 'Ambiente 1',
        estado: 'Disponible',
        capacidad: 25,
        ubicacion: 'Bloque A, Piso 1',
        proyector: true,
        computadoras: false,
        wifi: true
      },
      {
        id: 2,
        nombre: 'Ambiente 2',
        estado: 'Ocupado',
        reservadoPor: 'Juan Benito',
        periodoDeUso: '12:00 - 3:00',
        capacidad: 30,
        ubicacion: 'Bloque B, Piso 2',
        proyector: true,
        computadoras: true,
        wifi: true
      },
      {
        id: 3,
        nombre: 'Ambiente 3',
        estado: 'Disponible',
        capacidad: 15,
        ubicacion: 'Bloque A, Piso 3',
        proyector: false,
        computadoras: false,
        wifi: true
      },
      {
        id: 4,
        nombre: 'Ambiente 4',
        estado: 'Disponible',
        capacidad: 20,
        ubicacion: 'Bloque C, Piso 1',
        proyector: true,
        computadoras: true,
        wifi: true
      }
    ];
    
    this.ambientesFiltrados = [...this.ambientes];
  }

  // Filtrar ambientes según término de búsqueda y filtro
  filtrarAmbientes(): void {
    this.ambientesFiltrados = this.ambientes.filter(ambiente => {
      // Aplicar filtro de búsqueda
      const searchMatch = this.searchTerm === '' || 
        ambiente.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Aplicar filtro de estado
      const filterMatch = this.filtroEstado === '' || 
        ambiente.estado === this.filtroEstado;
      
      return searchMatch && filterMatch;
    });
  }

  // Abrir modal para crear ambiente
  abrirModalCrearAmbiente(): void {
    this.isEditing = false;
    this.ambienteForm.reset({
      id: 0,
      estado: 'Disponible',
      proyector: false,
      computadoras: false,
      wifi: false
    });
    this.showModal = true;
  }

  // Abrir modal para editar ambiente
  editarAmbiente(ambiente: Ambiente): void {
    this.isEditing = true;
    this.ambienteForm.setValue({
      id: ambiente.id,
      nombre: ambiente.nombre,
      estado: ambiente.estado,
      capacidad: ambiente.capacidad,
      ubicacion: ambiente.ubicacion,
      proyector: ambiente.proyector || false,
      computadoras: ambiente.computadoras || false,
      wifi: ambiente.wifi || false
    });
    this.showModal = true;
    
    // Si estamos en el modal de detalles, lo cerramos
    this.showDetallesModal = false;
  }

  // Cerrar modal
  cerrarModal(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay') || 
        target.classList.contains('close-modal-btn') ||
        target.classList.contains('cancel-btn')) {
      this.showModal = false;
    }
  }

  // Validar campo del formulario de ambiente
  isInvalid(field: string): boolean {
    const control = this.ambienteForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Validar campo del formulario de solicitud
  isInvalidSolicitud(field: string): boolean {
    const control = this.solicitudForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Guardar ambiente
  guardarAmbiente(): void {
    if (this.ambienteForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.ambienteForm.controls).forEach(key => {
        const control = this.ambienteForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Simulando una llamada a API con un timeout
    setTimeout(() => {
      const ambienteData = this.ambienteForm.value;
      
      if (this.isEditing) {
        // Actualizar ambiente existente
        this.ambientes = this.ambientes.map(a => 
          a.id === ambienteData.id ? { ...ambienteData } : a
        );
      } else {
        // Crear nuevo ambiente
        const newId = Math.max(...this.ambientes.map(a => a.id), 0) + 1;
        this.ambientes.push({
          ...ambienteData,
          id: newId
        });
      }
      
      // Actualizar lista filtrada
      this.filtrarAmbientes();
      
      // Reiniciar estado y cerrar modal
      this.isSubmitting = false;
      this.showModal = false;
      
      // Actualizar el ambiente seleccionado si está en el modal de detalles
      if (this.ambienteSeleccionado) {
        this.ambienteSeleccionado = this.ambientes.find(a => a.id === this.ambienteSeleccionado?.id) || null;
      }
    }, 1000);
  }

  // Abrir modal para solicitar ambiente
  solicitarAmbiente(ambiente: Ambiente): void {
    if (ambiente.estado === 'Ocupado') return;
    
    this.ambienteSeleccionado = ambiente;
    this.solicitudForm.reset();
    
    // Establecer fecha actual como valor predeterminado
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.solicitudForm.patchValue({
      fecha: `${yyyy}-${mm}-${dd}`
    });
    
    this.showSolicitarModal = true;
    
    // Si estamos en el modal de detalles, lo cerramos
    this.showDetallesModal = false;
  }

  // Cerrar modal de solicitud
  cerrarModalSolicitar(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay') || 
        target.classList.contains('close-modal-btn') ||
        target.classList.contains('cancel-btn')) {
      this.showSolicitarModal = false;
    }
  }

  // Confirmar solicitud de ambiente
  confirmarSolicitud(): void {
    if (this.solicitudForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.solicitudForm.controls).forEach(key => {
        const control = this.solicitudForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    
    // Simulando una llamada a API con un timeout
    setTimeout(() => {
      const solicitudData = this.solicitudForm.value;
      
      // Formatear el período de uso
      const periodoDeUso = `${solicitudData.horaInicio} - ${solicitudData.horaFin}`;
      
      // Actualizar el ambiente seleccionado
      if (this.ambienteSeleccionado) {
        this.ambientes = this.ambientes.map(a => {
          if (a.id === this.ambienteSeleccionado?.id) {
            return {
              ...a,
              estado: 'Ocupado' as 'Ocupado',
              reservadoPor: this.usuarioActual.nombre,
              periodoDeUso: periodoDeUso
            };
          }
          return a;
        });
      }
      
      // Actualizar lista filtrada
      this.filtrarAmbientes();
      
      // Reiniciar estado y cerrar modal
      this.isSubmitting = false;
      this.showSolicitarModal = false;
      
      // Mostrar alerta de éxito
      alert(`Ambiente ${this.ambienteSeleccionado?.nombre} reservado con éxito para el ${solicitudData.fecha}, de ${solicitudData.horaInicio} a ${solicitudData.horaFin}`);
    }, 1000);
  }

  // Abrir modal de detalles
  verDetalles(ambiente: Ambiente): void {
    this.ambienteSeleccionado = ambiente;
    this.showDetallesModal = true;
  }

  // Cerrar modal de detalles
  cerrarModalDetalles(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay') || 
        target.classList.contains('close-modal-btn')) {
      this.showDetallesModal = false;
    }
  }

  // Cerrar sesión
  cerrarSesion(): void {
    // Aquí iría la lógica de cerrar sesión
    console.log('Cerrando sesión...');
  }
}

