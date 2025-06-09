import { Component, ViewEncapsulation, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { EspacioService } from '../../core/services/espacio.service';
import { AuthService } from '../../core/services/auth.service';
import { Espacio } from '../../core/models/espacio.model';

@Component({
  selector: 'app-gestion-ambientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TopBarComponent,
    SidebarComponent
  ],
  templateUrl: './gestion-ambientes.component.html',
  styleUrls: ['./gestion-ambientes.component.css']
})
export class GestionAmbientesComponent implements OnInit {
  ambientes: Espacio[] = [];
  ambientesFiltrados: Espacio[] = [];
  searchTerm: string = '';
  filtroEstado: string = '';
  sidebarActive: boolean = false;
  screenWidth: number;

  showModal: boolean = false;
  isEditing: boolean = false;
  ambienteForm: FormGroup;
  isSubmitting: boolean = false;

  showSolicitarModal: boolean = false;
  ambienteSeleccionado: Espacio | null = null;
  solicitudForm: FormGroup;

  showDetallesModal: boolean = false;

  usuarioActual = {
    nombre: 'Juan Benicio',
    rol: 'Administrador'
  };

  constructor(
    private fb: FormBuilder,
    private espacioService: EspacioService,
    private authService: AuthService
  ) {
    this.screenWidth = window.innerWidth;

    // Definir el formulario para crear/editar ambientes
    this.ambienteForm = this.fb.group({
      idespacio: [null],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      estado: ['Disponible', Validators.required],
      capacidad: [null, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]],
      descripcion: ['', [Validators.minLength(5)]], // Validación para mínimo 5 caracteres, no obligatoria
      eliminado: [0]
    });

    // Definir el formulario para solicitudes
    this.solicitudForm = this.fb.group({
      fecha: ['', [Validators.required]],
      horaInicio: ['', [Validators.required]],
      horaFin: ['', [Validators.required]],
      proposito: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.checkScreenSize();
  }

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      this.cargarAmbientes();
    } else {
      alert('Por favor, inicia sesión para acceder a esta funcionalidad.');
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.sidebarActive = this.screenWidth >= 991;
  }

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  cargarAmbientes(): void {
    this.espacioService.obtenerTodosLosEspacios().subscribe({
      next: (ambientes: Espacio[]) => {
        this.ambientes = ambientes;
        this.filtrarAmbientes();
      },
      error: (error: Error) => {
        alert('Error al cargar los ambientes: ' + error.message);
      }
    });
  }

  filtrarAmbientes(): void {
    this.ambientesFiltrados = this.ambientes.filter(ambiente => {
      const searchMatch = this.searchTerm === '' ||
        ambiente.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const filterMatch = this.filtroEstado === '' || ambiente.estado === this.filtroEstado;
      return searchMatch && filterMatch;
    });
  }

  abrirModalCrearAmbiente(): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesión para crear un ambiente.');
      return;
    }
    this.isEditing = false;
    this.ambienteForm.reset({
      idespacio: null,
      nombre: '',
      estado: 'Disponible',
      capacidad: null,
      descripcion: '',
      eliminado: 0
    });
    this.showModal = true;
  }

  editarAmbiente(ambiente: Espacio): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesión para editar un ambiente.');
      return;
    }
    this.isEditing = true;
    this.ambienteForm.setValue({
      idespacio: ambiente.idespacio || null,
      nombre: ambiente.nombre || '',
      estado: ambiente.estado || 'Disponible',
      capacidad: ambiente.capacidad || null,
      descripcion: ambiente.descripcion || '',
      eliminado: ambiente.eliminado || 0
    });
    this.showModal = true;
    this.showDetallesModal = false;
  }

  eliminarAmbiente(id: number): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesión para eliminar un ambiente.');
      return;
    }
    if (confirm('¿Estás seguro de que deseas eliminar este ambiente?')) {
      this.espacioService.eliminarEspacio(id).subscribe({
        next: () => {
          this.ambientes = this.ambientes.filter(a => a.idespacio !== id);
          this.filtrarAmbientes();
          alert('Ambiente eliminado con éxito.');
        },
        error: (error: Error) => {
          alert('Error al eliminar el ambiente: ' + error.message);
        }
      });
    }
  }

  cerrarModal(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay') ||
        target.classList.contains('close-modal-btn') ||
        target.classList.contains('cancel-btn')) {
      this.showModal = false;
    }
  }

  isInvalid(field: string): boolean {
    const control = this.ambienteForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  isInvalidSolicitud(field: string): boolean {
    const control = this.solicitudForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  guardarAmbiente(): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesión para guardar un ambiente.');
      return;
    }
    if (this.ambienteForm.invalid) {
      Object.keys(this.ambienteForm.controls).forEach(key => {
        const control = this.ambienteForm.get(key);
        control?.markAsTouched();
      });
      alert('Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    this.isSubmitting = true;
    const ambienteData: Espacio = this.ambienteForm.value;

    const observable = this.isEditing
      ? this.espacioService.actualizarEspacio(ambienteData)
      : this.espacioService.crearEspacio(ambienteData);

    observable.subscribe({
      next: (nuevoAmbiente: Espacio) => {
        if (this.isEditing) {
          this.ambientes = this.ambientes.map(a =>
            a.idespacio === nuevoAmbiente.idespacio ? nuevoAmbiente : a
          );
        } else {
          this.ambientes.push(nuevoAmbiente);
        }
        this.filtrarAmbientes();
        this.isSubmitting = false;
        this.showModal = false;
        alert(`Ambiente ${this.isEditing ? 'actualizado' : 'creado'} con éxito.`);
        if (this.ambienteSeleccionado) {
          this.ambienteSeleccionado = this.ambientes.find(a => a.idespacio === this.ambienteSeleccionado?.idespacio) || null;
        }
      },
      error: (error: Error) => {
        this.isSubmitting = false;
        alert('Error al guardar el ambiente: ' + error.message);
      }
    });
  }

  solicitarAmbiente(ambiente: Espacio): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesión para solicitar un ambiente.');
      return;
    }
    if (ambiente.estado !== 'Disponible') {
      alert('Este ambiente no está disponible para solicitud.');
      return;
    }

    this.ambienteSeleccionado = ambiente;
    this.solicitudForm.reset();

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.solicitudForm.patchValue({
      fecha: `${yyyy}-${mm}-${dd}`
    });

    this.showSolicitarModal = true;
    this.showDetallesModal = false;
  }

  cerrarModalSolicitar(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay') ||
        target.classList.contains('close-modal-btn') ||
        target.classList.contains('cancel-btn')) {
      this.showSolicitarModal = false;
    }
  }

  confirmarSolicitud(): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesión para confirmar una solicitud.');
      return;
    }
    if (this.solicitudForm.invalid) {
      Object.keys(this.solicitudForm.controls).forEach(key => {
        const control = this.solicitudForm.get(key);
        control?.markAsTouched();
      });
      alert('Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    this.isSubmitting = true;
    const solicitudData = this.solicitudForm.value;

    if (this.ambienteSeleccionado) {
      const updatedAmbiente: Espacio = {
        ...this.ambienteSeleccionado,
        estado: 'Ocupado'
      };

      this.espacioService.actualizarEspacio(updatedAmbiente).subscribe({
        next: (nuevoAmbiente: Espacio) => {
          this.ambientes = this.ambientes.map(a =>
            a.idespacio === nuevoAmbiente.idespacio ? nuevoAmbiente : a
          );
          this.filtrarAmbientes();
          this.isSubmitting = false;
          this.showSolicitarModal = false;
          this.ambienteSeleccionado = nuevoAmbiente;
          alert(`Ambiente ${this.ambienteSeleccionado?.nombre} reservado con éxito para el ${solicitudData.fecha}, de ${solicitudData.horaInicio} a ${solicitudData.horaFin}`);
        },
        error: (error: Error) => {
          this.isSubmitting = false;
          alert('Error al reservar el ambiente: ' + error.message);
        }
      });
    }
  }

  verDetalles(ambiente: Espacio): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesión para ver los detalles de un ambiente.');
      return;
    }
    this.ambienteSeleccionado = ambiente;
    this.showDetallesModal = true;
  }

  cerrarModalDetalles(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay') ||
        target.classList.contains('close-modal-btn') ||
        target.classList.contains('cancel-btn')) {
      this.showDetallesModal = false;
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
    alert('Sesión cerrada con éxito.');
  }

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}