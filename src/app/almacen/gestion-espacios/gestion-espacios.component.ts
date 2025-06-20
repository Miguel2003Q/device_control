import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { TopBarComponent } from '../shared/top-bar/top-bar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { EspacioService } from '../../core/services/espacio.service';
import { ActivoService } from '../../core/services/activo.service';
import { Espacio } from '../../core/models/espacio.model';
import { Activo } from '../../core/models/activo.model';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-gestion-espacios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TopBarComponent, SidebarComponent],
  templateUrl: './gestion-espacios.component.html',
  styleUrls: ['./gestion-espacios.component.css']
})
export class GestionEspaciosComponent implements OnInit {
  // Propiedades del componente
  espacios: Espacio[] = [];
  espaciosFiltrados: Espacio[] = [];
  activosDelEspacio: Activo[] = [];
  searchTerm: string = '';
  sidebarActive: boolean = true;
  screenWidth: number;
  modalTab: 'info' | 'activos' = 'info';

  // Propiedades para modales
  showModalCrear: boolean = false;
  showModalDetalles: boolean = false;
  espacioSeleccionado: Espacio | null = null;
  isSubmitting: boolean = false;

  // Formularios
  espacioForm: FormGroup;
  detallesForm: FormGroup;

  // Mapeo de estados para badges
  estadoMap: { [key: string]: string } = {
    'D': 'Disponible',
    'O': 'Ocupado',
    'M': 'Mantenimiento'
  };

  estadoReverseMap: { [key: string]: string } = {
    'Disponible': 'D',
    'Ocupado': 'O',
    'Mantenimiento': 'M'
  };

  // Mapeo de estados para activos
  estadoActivoMap: { [key: string]: string } = {
    'D': 'Disponible',
    'O': 'Ocupado',
    'M': 'Mantenimiento'
  };

  constructor(
    private fb: FormBuilder,
    private espacioService: EspacioService,
    private activoService: ActivoService,
    private loading: LoadingService,
    private toastr: ToastrService
  ) {
    // Inicializar el ancho de pantalla
    this.screenWidth = window.innerWidth;

    // Inicializar formulario de creación
    this.espacioForm = this.fb.group({
      nombre: ['', Validators.required],
      capacidad: ['', [Validators.required, Validators.min(1)]],
      estado: ['Disponible', Validators.required],
      ubicacion: [''],
      descripcion: ['', Validators.required]
    });

    // Inicializar formulario de detalles
    this.detallesForm = this.fb.group({
      idespacio: [0],
      nombre: ['', Validators.required],
      capacidad: ['', [Validators.required, Validators.min(1)]],
      estado: ['Disponible', Validators.required],
      ubicacion: [''],
      descripcion: ['', Validators.required],
      eliminado: [0]
    });

    // Ajustar sidebar según tamaño de pantalla
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.cargarEspacios();
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
  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  // Cargar lista de espacios
  cargarEspacios(): void {
    this.loading.show();
    this.espacioService.obtenerTodosLosEspacios().subscribe({
      next: (espacios: Espacio[]) => {
        // Filtrar espacios no eliminados
        this.espacios = espacios.filter(e => e.eliminado === 0);
        this.espaciosFiltrados = [...this.espacios];
        this.loading.hide();
      },
      error: (error: any) => {
        console.error('Error al cargar espacios:', error);
        this.toastr.error('Error al cargar espacios');
        this.loading.hide();
      }
    });
  }

  // Filtrar espacios según término de búsqueda
  filtrarEspacios(): void {
    const termino = this.searchTerm.toLowerCase().trim();

    this.espaciosFiltrados = this.espacios.filter(espacio => {
      return this.searchTerm === '' ||
        espacio.nombre.toLowerCase().includes(termino) ||
        espacio.descripcion.toLowerCase().includes(termino) ||
        (espacio.ubicacion && espacio.ubicacion.toLowerCase().includes(termino)) ||
        espacio.capacidad.toString().includes(termino);
    });
  }

  // Abrir modal para crear espacio
  abrirModalCrearEspacio(): void {
    this.espacioForm.reset({
      estado: 'Disponible'
    });
    this.showModalCrear = true;
  }

  // Cerrar modal de creación
  cerrarModalCrear(event: MouseEvent): void {
    this.showModalCrear = false;
    this.espacioForm.reset();
  }

  // Validar campo del formulario
  isInvalid(field: string): boolean {
    const control = this.espacioForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Guardar nuevo espacio
  guardarEspacio(): void {
    if (this.espacioForm.invalid) {
      Object.keys(this.espacioForm.controls).forEach(key => {
        const control = this.espacioForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formData = this.espacioForm.value;

    const nuevoEspacio: Espacio = {
      nombre: formData.nombre,
      capacidad: formData.capacidad,
      estado: this.estadoReverseMap[formData.estado],
      ubicacion: formData.ubicacion || '',
      descripcion: formData.descripcion,
      eliminado: 0
    };

    this.espacioService.crearEspacio(nuevoEspacio).subscribe({
      next: (espacioCreado) => {
        this.toastr.success(`Espacio "${espacioCreado.nombre}" creado exitosamente`, 'Éxito');
        this.cargarEspacios();
        this.isSubmitting = false;
        this.showModalCrear = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error al guardar espacio:', error);
        this.toastr.error('Error al crear el espacio');
      }
    });
  }

  // Ver detalles del espacio
  verDetalles(espacio: Espacio): void {
    this.espacioSeleccionado = espacio;
    this.modalTab = 'info';
    
    // Cargar información del espacio en el formulario
    const estadoLegible = this.estadoMap[espacio.estado] || 'Disponible';
    
    this.detallesForm.patchValue({
      idespacio: espacio.idespacio,
      nombre: espacio.nombre,
      capacidad: espacio.capacidad,
      estado: estadoLegible,
      ubicacion: espacio.ubicacion || '',
      descripcion: espacio.descripcion,
      eliminado: espacio.eliminado
    });

    // Cargar activos asignados a este espacio
    this.cargarActivosDelEspacio(espacio.idespacio!);
    
    this.showModalDetalles = true;
  }

  // Cargar activos asignados al espacio
  cargarActivosDelEspacio(idEspacio: number): void {
    this.activoService.obtenerTodosLosActivos().subscribe({
      next: (activos: Activo[]) => {
        // Filtrar activos que pertenecen a este espacio
        this.activosDelEspacio = activos.filter(activo => 
          activo.espacio && activo.espacio.idespacio === idEspacio
        );
      },
      error: (error) => {
        console.error('Error al cargar activos del espacio:', error);
        this.activosDelEspacio = [];
      }
    });
  }

  // Cerrar modal de detalles
  cerrarModalDetalles(event: MouseEvent): void {
    this.showModalDetalles = false;
    this.espacioSeleccionado = null;
    this.activosDelEspacio = [];
  }

  // Actualizar espacio existente
  actualizarEspacio(): void {
    if (this.detallesForm.invalid) {
      Object.keys(this.detallesForm.controls).forEach(key => {
        const control = this.detallesForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formData = this.detallesForm.value;

    const espacioActualizado: Espacio = {
      idespacio: formData.idespacio,
      nombre: formData.nombre,
      capacidad: formData.capacidad,
      estado: this.estadoReverseMap[formData.estado],
      ubicacion: formData.ubicacion || '',
      descripcion: formData.descripcion,
      eliminado: formData.eliminado
    };

    this.espacioService.actualizarEspacio( espacioActualizado).subscribe({
      next: (actualizado) => {
        this.toastr.info('Espacio actualizado correctamente', 'Actualización');
        this.cargarEspacios();
        this.isSubmitting = false;
        this.showModalDetalles = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error al actualizar espacio:', error);
        this.toastr.error('Error al actualizar el espacio');
      }
    });
  }

  // Eliminar espacio (soft delete)
  eliminarEspacio(): void {
    if (!this.espacioSeleccionado) return;

    // Verificar si hay activos asignados
    if (this.activosDelEspacio.length > 0) {
      this.toastr.warning('No se puede eliminar un espacio con activos asignados', 'Advertencia');
      return;
    }

    const confirmacion = confirm(`¿Está seguro de eliminar el espacio "${this.espacioSeleccionado.nombre}"?`);
    if (!confirmacion) return;

    this.isSubmitting = true;

    // Realizar soft delete
    const espacioEliminado = { ...this.espacioSeleccionado, eliminado: 1 };

    this.espacioService.actualizarEspacio(espacioEliminado).subscribe({
      next: () => {
        this.toastr.warning('Espacio eliminado', 'Eliminación');
        this.cargarEspacios();
        this.isSubmitting = false;
        this.showModalDetalles = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error al eliminar espacio:', error);
        this.toastr.error('Error al eliminar el espacio');
      }
    });
  }
}