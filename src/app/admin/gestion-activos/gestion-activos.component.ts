import de from '@angular/common/locales/de';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

interface Activo {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  subtipo: string;
  estado: 'Disponible' | 'Ocupado' | 'Mantenimiento';
  ambienteAsignado?: string;
  marca?: string;
  modelo?: string;
  codigoInterno?: string;
  serial?: string;
  observaciones?: string;
}

interface Ambiente {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-activos',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-activos.component.html',
  styleUrls: ['./gestion-activos.component.css']
})
export class ActivosComponent implements OnInit {
  // Propiedades del componente
  activos: Activo[] = [];
  activosFiltrados: Activo[] = [];
  ambientes: Ambiente[] = [];
  searchTerm: string = '';
  sidebarActive: boolean = true;
  screenWidth: number;
  
  // Propiedades para modales
  showModalCrear: boolean = false;
  showModalDetalles: boolean = false;
  activoSeleccionado: Activo | null = null;
  isSubmitting: boolean = false;
  
  // Formularios
  activoForm: FormGroup;
  detallesForm: FormGroup;
  
  // Usuario actual
  usuarioActual = {
    nombre: 'Juan Benicio',
    rol: 'Administrador'
  };
  
  constructor(private fb: FormBuilder) {
    // Inicializar el ancho de pantalla
    this.screenWidth = window.innerWidth;
    
    // Inicializar formulario de creación
    this.activoForm = this.fb.group({
      codigo: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      subtipo: ['', [Validators.required]],
      marca: [''],
      modelo: [''],
      codigoInterno: [''],
      serial: [''],
      estado: ['Disponible'],
      ambienteAsignado: [''],
      observaciones: ['']
    });
    
    // Inicializar formulario de detalles
    this.detallesForm = this.fb.group({
      id: [0],
      codigo: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      subtipo: ['', [Validators.required]],
      marca: [''],
      modelo: [''],
      codigoInterno: [''],
      serial: [''],
      estado: ['Disponible'],
      ambienteAsignado: [''],
      observaciones: ['']
    });
    
    // Ajustar sidebar según tamaño de pantalla
    this.checkScreenSize();
  }

  ngOnInit(): void {
    // Cargar datos
    this.cargarActivos();
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

  // Cargar lista de activos
  cargarActivos(): void {
    // Aquí normalmente harías una llamada a un servicio
    // Por ahora, usamos datos de ejemplo
    this.activos = [
      {
        id: 1,
        codigo: 'AA-001',
        nombre: 'Mesa',
        tipo: 'Mobiliario',
        subtipo: 'Mesa',
        estado: 'Disponible',
        marca: 'Genérica',
        modelo: 'Estándar',
        codigoInterno: 'AA-001',
        serial: 'N/A',
        observaciones: 'Mesa de trabajo para el ambiente de estudio'
      },
      {
        id: 2,
        codigo: 'AB-002',
        nombre: 'Teclado Dell',
        tipo: 'Tecnologico',
        subtipo: 'Teclado',
        estado: 'Disponible',
        marca: 'Dell',
        modelo: 'KB216',
        codigoInterno: 'AB-002',
        serial: 'CNO123456',
        observaciones: 'Teclado USB negro'
      },
      {
        id: 3,
        codigo: 'AC-003',
        nombre: 'Mouse Dell',
        tipo: 'Tecnologico',
        subtipo: 'Mouse',
        estado: 'Mantenimiento',
        ambienteAsignado: 'Ambiente 3',
        marca: 'Dell',
        modelo: 'MS116',
        codigoInterno: 'AC-003',
        serial: 'CNO789012',
        observaciones: 'Mouse óptico USB negro'
      },
      {
        id: 4,
        codigo: 'AD-004',
        nombre: 'Silla',
        tipo: 'Mobiliario',
        subtipo: 'Silla',
        estado: 'Ocupado',
        ambienteAsignado: 'Ambiente 4',
        marca: 'Genérica',
        modelo: 'Ergonómica',
        codigoInterno: 'AD-004',
        serial: 'N/A',
        observaciones: 'Silla ergonómica con ruedas'
      }
    ];
    
    this.activosFiltrados = [...this.activos];
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

  // Filtrar activos según término de búsqueda
  filtrarActivos(): void {
    this.activosFiltrados = this.activos.filter(activo => {
      return this.searchTerm === '' || 
        activo.codigo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        activo.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        activo.tipo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        activo.subtipo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (activo.ambienteAsignado && activo.ambienteAsignado.toLowerCase().includes(this.searchTerm.toLowerCase()));
    });
  }

  // Abrir modal para crear activo
  abrirModalCrearActivo(): void {
    this.activoForm.reset({
      estado: 'Disponible',
      ambienteAsignado: ''
    });
    this.showModalCrear = true;
  }

  // Cerrar modal de creación
  cerrarModalCrear(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay') || 
        target.classList.contains('close-modal-btn')) {
      this.showModalCrear = false;
    }
  }

  // Validar campo del formulario de creación
  isInvalid(field: string): boolean {
    const control = this.activoForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Validar campo del formulario de detalles
  isInvalidDetalle(field: string): boolean {
    const control = this.detallesForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Al cambiar el tipo, actualizar opciones de subtipo
  onTipoChange(): void {
    // Resetear el valor de subtipo
    this.activoForm.get('subtipo')?.setValue('');
  }

  // Al cambiar el tipo en detalles, actualizar opciones de subtipo
  onTipoChangeDetalle(): void {
    // Resetear el valor de subtipo
    this.detallesForm.get('subtipo')?.setValue('');
  }

  // Guardar nuevo activo
  guardarActivo(): void {
    if (this.activoForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.activoForm.controls).forEach(key => {
        const control = this.activoForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Simulando una llamada a API con un timeout
    setTimeout(() => {
      const formData = this.activoForm.value;
      
      // Crear nuevo activo
      const newId = Math.max(...this.activos.map(a => a.id), 0) + 1;
      const nuevoActivo: Activo = {
        id: newId,
        codigo: formData.codigo,
        nombre: formData.subtipo, // Usar el subtipo como nombre
        tipo: formData.tipo,
        subtipo: formData.subtipo,
        estado: formData.estado,
        ambienteAsignado: formData.ambienteAsignado || undefined,
        marca: formData.marca || undefined,
        modelo: formData.modelo || undefined,
        codigoInterno: formData.codigoInterno || undefined,
        serial: formData.serial || undefined,
        observaciones: formData.observaciones || undefined
      };
      
      // Añadir al array de activos
      this.activos.push(nuevoActivo);
      
      // Actualizar lista filtrada
      this.filtrarActivos();
      
      // Reiniciar estado y cerrar modal
      this.isSubmitting = false;
      this.showModalCrear = false;
      
      // Mostrar mensaje de éxito
      alert(`Activo ${nuevoActivo.codigo} creado con éxito`);
    }, 1000);
  }

  // Abrir modal de detalles
  verDetalles(activo: Activo): void {
    this.activoSeleccionado = activo;
    
    // Llenar formulario con datos del activo
    this.detallesForm.setValue({
      id: activo.id,
      codigo: activo.codigo,
      tipo: activo.tipo,
      subtipo: activo.subtipo,
      marca: activo.marca || '',
      modelo: activo.modelo || '',
      codigoInterno: activo.codigoInterno || '',
      serial: activo.serial || '',
      estado: activo.estado,
      ambienteAsignado: activo.ambienteAsignado || '',
      observaciones: activo.observaciones || ''
    });
    
    this.showModalDetalles = true;
  }

  // Cerrar modal de detalles
  cerrarModalDetalles(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay') || 
        target.classList.contains('close-modal-btn')) {
      this.showModalDetalles = false;
    }
  }

  // Actualizar activo existente
  actualizarActivo(): void {
    if (this.detallesForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.detallesForm.controls).forEach(key => {
        const control = this.detallesForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Simulando una llamada a API con un timeout
    setTimeout(() => {
      const formData = this.detallesForm.value;
      
      // Actualizar activo en el array
      this.activos = this.activos.map(activo => {
        if (activo.id === formData.id) {
          return {
            ...activo,
            codigo: formData.codigo,
            nombre: formData.subtipo, // Usar el subtipo como nombre
            tipo: formData.tipo,
            subtipo: formData.subtipo,
            estado: formData.estado,
            ambienteAsignado: formData.ambienteAsignado || undefined,
            marca: formData.marca || undefined,
            modelo: formData.modelo || undefined,
            codigoInterno: formData.codigoInterno || undefined,
            serial: formData.serial || undefined,
            observaciones: formData.observaciones || undefined
          };
        }
        return activo;
      });
      
      // Actualizar lista filtrada
      this.filtrarActivos();
      
      // Reiniciar estado y cerrar modal
      this.isSubmitting = false;
      this.showModalDetalles = false;
      
      // Mostrar mensaje de éxito
      alert(`Activo ${formData.codigo} actualizado con éxito`);
    }, 1000);
  }

  // Eliminar activo
  eliminarActivo(): void {
    if (!this.activoSeleccionado) return;

    const confirmacion = confirm(`¿Está seguro de eliminar el activo ${this.activoSeleccionado.codigo}?`);
    if (!confirmacion) return;

    this.isSubmitting = true;

    // Simulando una llamada a API con un timeout
    setTimeout(() => {
      // Eliminar activo del array
      this.activos = this.activos.filter(activo => activo.id !== this.activoSeleccionado?.id);
      
      // Actualizar lista filtrada
      this.filtrarActivos();
      
      // Reiniciar estado y cerrar modal
      this.isSubmitting = false;
      this.showModalDetalles = false;
      
      // Mostrar mensaje de éxito
      alert(`Activo ${this.activoSeleccionado?.codigo} eliminado con éxito`);
    }, 1000);
  }

  // Cerrar sesión
  cerrarSesion(): void {
    // Aquí iría la lógica de cerrar sesión
    console.log('Cerrando sesión...');
  }
}