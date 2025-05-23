import { Component, ViewEncapsulation, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { Injectable } from '@angular/core';
import { EspacioService } from '../../core/services/espacio.service';
import { AuthService } from '../../core/services/auth.service';
import { Ambiente } from '../../core/models/ambiente.model';
import { Espacio } from '../../core/models/Espacio';

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
  sidebarActive: boolean = true;
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

    this.ambienteForm = this.fb.group({
      id: [0],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      estado: ['Disponible', Validators.required],
      capacidad: [null, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]],
      ubicacion: ['', [Validators.required, Validators.minLength(3)]],
      proyector: [false],
      computadoras: [false],
      wifi: [false]
    });

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
      alert('Por favor, inicia sesi\u00f3n para acceder a esta funcionalidad.');
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
      error: (error: { message: string }) => {
        alert('Error al cargar los ambientes: ' + error.message);
      }
    });
  }

  filtrarAmbientes(): void {
    this.ambientesFiltrados = this.ambientes.filter(ambiente => {
      const searchMatch = this.searchTerm === '' ||
        ambiente.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const filterMatch = this.filtroEstado === '';
      return searchMatch && filterMatch;
    });
  }

  abrirModalCrearAmbiente(): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesi\u00f3n para crear un ambiente.');
      return;
    }
    this.isEditing = false;
    this.ambienteForm.reset({
      id: 0,
      nombre: '',
      estado: 'Disponible',
      capacidad: null,
      ubicacion: '',
      proyector: false,
      computadoras: false,
      wifi: false
    });
    this.showModal = true;
  }

  editarAmbiente(ambiente: Espacio): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesi\u00f3n para editar un ambiente.');
      return;
    }
    this.isEditing = true;
    this.ambienteForm.setValue({
      id: ambiente.idespacio || 0,
      nombre: ambiente.nombre,
      // estado: ambiente.estado,
      // capacidad: ambiente.capacidad,
      // ubicacion: ambiente.ubicacion,
      // proyector: ambiente.proyector || false,
      // computadoras: ambiente.computadoras || false,
      // wifi: ambiente.wifi || false
    });
    this.showModal = true;
    this.showDetallesModal = false;
  }

  eliminarAmbiente(id: number): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesi\u00f3n para eliminar un ambiente.');
      return;
    }
    if (confirm('\u00bfEst\u00e1s seguro de que deseas eliminar este ambiente?')) {
      this.espacioService.eliminarEspacio(id).subscribe({
        next: () => {
          this.ambientes = this.ambientes.filter(a => a.idespacio !== id);
          this.filtrarAmbientes();
          alert('Ambiente eliminado con \u00e9xito.');
        },
        error: (error: { message: string }) => {
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
      alert('Debes iniciar sesi\u00f3n para guardar un ambiente.');
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

    this.espacioService.guardarEspacio(ambienteData).subscribe({
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
        alert(`Ambiente ${this.isEditing ? 'actualizado' : 'creado'} con \u00e9xito.`);
        if (this.ambienteSeleccionado) {
          this.ambienteSeleccionado = this.ambientes.find(a => a.idespacio === this.ambienteSeleccionado?.idespacio) || null;
        }
      },
      error: (error: { message: string }) => {
        this.isSubmitting = false;
        alert('Error al guardar el ambiente: ' + error.message);
      }
    });
  }

  solicitarAmbiente(ambiente: Espacio): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesi\u00f3n para solicitar un ambiente.');
      return;
    }
    // if (ambiente.estado !== 'Disponible') return;

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
      alert('Debes iniciar sesi\u00f3n para confirmar una solicitud.');
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

    const periodoDeUso = `${solicitudData.horaInicio} - ${solicitudData.horaFin}`;

    if (this.ambienteSeleccionado) {
      const updatedAmbiente: Espacio = {
        ...this.ambienteSeleccionado,
        // estado: 'Ocupado',
        // reservadoPor: this.usuarioActual.nombre,
        // periodoDeUso: periodoDeUso
      };

      this.espacioService.guardarEspacio(updatedAmbiente).subscribe({
        next: (nuevoAmbiente: Espacio) => {
          this.ambientes = this.ambientes.map(a =>
            a.idespacio === nuevoAmbiente.idespacio ? nuevoAmbiente : a
          );
          this.filtrarAmbientes();
          this.isSubmitting = false;
          this.showSolicitarModal = false;
          alert(`Ambiente ${this.ambienteSeleccionado?.nombre} reservado con \u00e9xito para el ${solicitudData.fecha}, de ${solicitudData.horaInicio} a ${solicitudData.horaFin}`);
        },
        error: (error: { message: string }) => {
          this.isSubmitting = false;
          alert('Error al reservar el ambiente: ' + error.message);
        }
      });
    }
  }

  verDetalles(ambiente: Espacio): void {
    if (!this.isLoggedIn()) {
      alert('Debes iniciar sesi\u00f3n para ver los detalles de un ambiente.');
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
    alert('Sesi\u00f3n cerrada con \u00e9xito.');
  }
}