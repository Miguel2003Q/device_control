import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import  {ToastrService} from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { ActivoService } from '../../core/services/activo.service';
import { Activo } from '../../core/models/activo.model';
import { LoadingService } from '../../core/services/loading.service';
import { TipoActivo } from '../../core/models/TipoActivo';
import { Espacio } from '../../core/models/Espacio';
import { EspacioService } from '../../core/services/espacio.service';
import { TipoActivoService } from '../../core/services/tipoactivo.service';

@Component({
  selector: 'app-activos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TopBarComponent, SidebarComponent],
  templateUrl: './gestion-activos.component.html',
  styleUrls: ['./gestion-activos.component.css']
})
export class ActivosComponent implements OnInit {
  // Propiedades del componente
  activeTab: 'activos' | 'tipoActivos' = 'activos';
  activos: Activo[] = [];
  activosFiltrados: Activo[] = [];
  espacios: Espacio[] = [];
  tiposActivo: TipoActivo[] = [];
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

  constructor(
    private fb: FormBuilder,
    private activoService: ActivoService,
    private espacioService: EspacioService,
    private tipoActivoService: TipoActivoService,
    private loading: LoadingService,
    private toastr: ToastrService) {
    // Inicializar el ancho de pantalla
    this.screenWidth = window.innerWidth;

    // Inicializar formulario de creación
    this.activoForm = this.fb.group({
      nombre: ['', Validators.required],
      url: ['', Validators.required],
      serial: ['', Validators.required],
      estado: ['', Validators.required],
      observaciones: [''],
      espacio: [null, Validators.required],        // objeto Espacio
      tipoActivo: [null, Validators.required],     // objeto TipoActivo
    });

    // Inicializar formulario de detalles
    this.detallesForm = this.fb.group({
      idactivo: [0],
      nombre: ['', Validators.required],
      url: ['', Validators.required],
      serial: ['', Validators.required],
      estado: ['Disponible'],
      observaciones: [''],
      espacio: [null, Validators.required],
      tipoActivo: [null, Validators.required]
    });


    // Ajustar sidebar según tamaño de pantalla
    this.checkScreenSize();
  }

  ngOnInit(): void {
    // Cargar datos
    this.cargarActivos();
    this.cargarEspaciosYTipoActivos();
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
    this.loading.show();
    this.activoService.obtenerTodosLosActivos().subscribe({
      next: (activos: Activo[]) => {
        this.activos = activos;
        this.activosFiltrados = [...this.activos];
        this.loading.hide();
      },
      error: (error: { message: string }) => {
        console.error('Error al cargar activos: ' + error.message);
        this.loading.hide();
      }
    });
  }

  // Cargar espacios y tipos de activos disponibles en los combobox
  cargarEspaciosYTipoActivos(): void {

    this.espacioService.obtenerTodosLosEspacios().subscribe({  //Estoy cargando objetos, por eso al guardar activo, se selecciona el objeto completo
      next: (data) => {
        this.espacios = data;
      },
      error: (err) => {
        console.error('Error al cargar los espacios:', err);
      }
    });
    this.tipoActivoService.obtenerTodosLosTiposActivos().subscribe({
      next: (data) => {
        this.tiposActivo = data;
      },
      error: (err) => {
        console.error('Error al cargar los tipo activos:', err);
      }
    });
  }

  // Filtrar activos según término de búsqueda
  filtrarActivos(): void {
    const termino = this.searchTerm.toLowerCase().trim();

    this.activosFiltrados = this.activos.filter(activo => {
      return this.searchTerm === '' ||
        activo.nombre.toLowerCase().includes(termino) ||
        activo.serial.toLowerCase().includes(termino) ||
        activo.estado.toLowerCase().includes(termino) ||
        (activo.observaciones && activo.observaciones.toLowerCase().includes(termino)) ||
        (activo.espacio && activo.espacio.nombre.toLowerCase().includes(termino)) ||
        (activo.tipoActivo && activo.tipoActivo.nombre.toLowerCase().includes(termino));
    });
  }

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

    const formData = this.activoForm.value;

    const nuevoActivo: Activo = {
      // No se pone idactivo porque lo generará el backend
      nombre: formData.nombre,
      url: formData.url,
      serial: formData.serial,
      estado: this.estadoReverseMap[formData.estado],
      observaciones: formData.observaciones || '',
      espacio: formData.espacio,          // Debe ser un objeto Espacio válido
      tipoActivo: formData.tipoActivo      // Debe ser un objeto TipoActivo válido
    };

    // Llamar al servicio para guardar el activo
    this.activoService.guardarActivo(nuevoActivo).subscribe({
      next: (activoCreado) => {
        this.toastr.success(`Activo "${activoCreado.nombre}" creado`, 'Creación exitosa');
        this.activos.push(activoCreado);
        this.filtrarActivos();
        this.isSubmitting = false;
        this.showModalCrear = false;
        // alert(`Activo "${activoCreado.nombre}" creado con éxito`);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error al guardar activo:', error);
        alert('Ocurrió un error al guardar el activo');
      }
    });
  }

  // Abrir modal de detalles
  verDetalles(activo: Activo): void {
    const espacioAsignado = this.espacios.find(e => e.idespacio === activo.espacio?.idespacio);
    const tipoActivoAsignado = this.tiposActivo.find(t => t.idtipoact === activo.tipoActivo?.idtipoact);
    const estadoLegible = this.estadoMap[activo.estado] || 'Disponible';

    this.activoSeleccionado = activo;

    this.detallesForm.setValue({
      idactivo: activo.idactivo,
      nombre: activo.nombre,
      url: activo.url,
      serial: activo.serial,
      estado: estadoLegible,
      observaciones: activo.observaciones || '',
      espacio: espacioAsignado || null,
      tipoActivo: tipoActivoAsignado || null
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

    const formData = this.detallesForm.value;

    // Llamar al servicio para actualizar el activo en el backend
    const activoActualizado: Activo = {
      idactivo: formData.idactivo,
      nombre: formData.nombre,
      url: formData.url,
      serial: formData.serial,
      estado: this.estadoReverseMap[formData.estado],
      observaciones: formData.observaciones || '',
      espacio: formData.espacio,
      tipoActivo: formData.tipoActivo
    };

    this.activoService.actualizarActivo(activoActualizado.idactivo!, activoActualizado).subscribe({
      next: (actualizado) => {
        this.toastr.info('Activo actualizado correctamente', 'Actualización');
        // Reemplazar el activo en el array local
        this.activos = this.activos.map(activo =>
          activo.idactivo === actualizado.idactivo ? actualizado : activo
        );

        this.filtrarActivos();  // Actualiza la lista filtrada

        this.isSubmitting = false;
        this.showModalDetalles = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error al actualizar activo:', error);
        alert('Ocurrió un error al actualizar el activo');
      }
    });
  }


  // Eliminar activo
  eliminarActivo(): void {
    if (!this.activoSeleccionado) return;

    // Usar 'nombre' o 'serial' para mostrar en el mensaje de confirmación
    const confirmacion = confirm(`¿Está seguro de eliminar el activo "${this.activoSeleccionado.nombre}"?`);
    if (!confirmacion) return;

    this.isSubmitting = true;

    // Llamada al servicio para eliminar el activo (ejemplo con delete)
    this.activoService.eliminarActivo(this.activoSeleccionado.idactivo!).subscribe({
      next: () => {
        this.toastr.warning('Activo eliminado', 'Eliminación');
        // Eliminar activo del array local
        this.activos = this.activos.filter(activo => activo.idactivo !== this.activoSeleccionado?.idactivo);

        // Actualizar lista filtrada
        this.filtrarActivos();

        // Reiniciar estado y cerrar modal
        this.isSubmitting = false;
        this.showModalDetalles = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error al eliminar activo:', error);
        alert('Ocurrió un error al eliminar el activo');
      }
    });
  }

  // Cambiar pestaña activa
  setActiveTab(tab: 'activos' | 'tipoActivos'): void {
    this.activeTab = tab;
    this.searchTerm = '';
    // this.filtroEstado = '';
    
    if (tab === 'activos') {
      this.filtrarActivos();
    } else {
      // this.filtrarSolicitudes();
    }
  }
}