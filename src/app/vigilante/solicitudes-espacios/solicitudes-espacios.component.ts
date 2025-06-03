import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";

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

interface Ambiente {
  nombre: string;
  ubicacion: string;
  capacidad: number;
  estado: string;
}

@Component({
  selector: 'app-solicitudes-ambientes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TopBarComponent, SidebarComponent],
  templateUrl: './solicitudes-espacios.component.html',
  styleUrls: ['./solicitudes-espacios.component.css'],
  providers: [DatePipe]
})
export class SolicitudesEspaciosComponent implements OnInit {
  // Filtering
  searchTerm: string = '';
  filtroEstado: string = '';

  // Data and state
  solicitudes: SolicitudAmbiente[] = [];
  solicitudesFiltradas: SolicitudAmbiente[] = [];
  solicitudesPendientes: SolicitudAmbiente[] = [];
  ambientesDisponibles: Ambiente[] = [];
  loading: boolean = false;

  // Modal and form
  showModalSolicitud: boolean = false;
  solicitudForm: FormGroup;
  isSubmitting: boolean = false;
  minDate: string;

  sidebarActive = false;

  constructor(private fb: FormBuilder, private datePipe: DatePipe) {
    const today = new Date();
    this.minDate = this.datePipe.transform(today, 'yyyy-MM-dd')!;
    this.solicitudForm = this.fb.group({
      ambiente: ['', Validators.required],
      fechaPrestamo: ['', Validators.required],
      horaPrestamo: ['', Validators.required],
      fechaDevolucion: ['', Validators.required],
      horaDevolucion: ['', Validators.required],
      motivo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    // Mock data (replace with service call)
    this.solicitudes = [
      {
        id: 1,
        ambiente: 'Aula 101',
        fechaPrestamo: new Date('2025-06-03'),
        horaPrestamo: '09:00',
        fechaDevolucion: new Date('2025-06-03'),
        horaDevolucion: '12:00',
        solicitante: 'Juan Pérez',
        motivo: 'Clase de Matemáticas',
        estado: 'Pendiente'
      },
      {
        id: 2,
        ambiente: 'Laboratorio 1',
        fechaPrestamo: new Date('2025-06-04'),
        horaPrestamo: '14:00',
        fechaDevolucion: new Date('2025-06-04'),
        horaDevolucion: '16:00',
        solicitante: 'María Gómez',
        motivo: 'Práctica de Química',
        estado: 'Aprobado'
      }
    ];

    this.ambientesDisponibles = [
      { nombre: 'Aula 101', ubicacion: 'Edificio A', capacidad: 40, estado: 'Disponible' },
      { nombre: 'Laboratorio 1', ubicacion: 'Edificio B', capacidad: 20, estado: 'Disponible' }
    ];

    setTimeout(() => {
      this.filtrarSolicitudes();
      this.solicitudesPendientes = this.solicitudes.filter(s => s.estado === 'Pendiente');
      this.loading = false;
    }, 1000);
  }

  filtrarSolicitudes(): void {
    let filtered = [...this.solicitudes];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.ambiente.toLowerCase().includes(term) ||
        s.solicitante.toLowerCase().includes(term) ||
        s.motivo.toLowerCase().includes(term)
      );
    }

    if (this.filtroEstado) {
      filtered = filtered.filter(s => s.estado === this.filtroEstado);
    }

    this.solicitudesFiltradas = filtered;
  }

  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'fa-clock';
      case 'Aprobado': return 'fa-check-circle';
      case 'Rechazado': return 'fa-times-circle';
      case 'En Proceso': return 'fa-hourglass-half';
      default: return 'fa-info-circle';
    }
  }

  aprobarSolicitud(id: number): void {
    const solicitud = this.solicitudes.find(s => s.id === id);
    if (solicitud) {
      solicitud.estado = 'Aprobado';
      this.filtrarSolicitudes();
      this.solicitudesPendientes = this.solicitudes.filter(s => s.estado === 'Pendiente');
    }
  }

  rechazarSolicitud(id: number): void {
    if (confirm('¿Estás seguro de rechazar esta solicitud?')) {
      const solicitud = this.solicitudes.find(s => s.id === id);
      if (solicitud) {
        solicitud.estado = 'Rechazado';
        this.filtrarSolicitudes();
        this.solicitudesPendientes = this.solicitudes.filter(s => s.estado === 'Pendiente');
      }
    }
  }

  abrirModalSolicitudAmbiente(): void {
    this.solicitudForm.reset();
    this.showModalSolicitud = true;
  }

  cerrarModalSolicitud(event: Event): void {
    if (event.target === event.currentTarget || (event.target as HTMLElement).closest('.close-modal-btn, .cancel-btn')) {
      this.showModalSolicitud = false;
      this.solicitudForm.reset();
      this.isSubmitting = false;
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.solicitudForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  enviarSolicitudAmbiente(): void {
    if (this.solicitudForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      // Simulate API call
      setTimeout(() => {
        const nuevaSolicitud: SolicitudAmbiente = {
          id: this.solicitudes.length + 1,
          ambiente: this.solicitudForm.value.ambiente,
          fechaPrestamo: new Date(this.solicitudForm.value.fechaPrestamo),
          horaPrestamo: this.solicitudForm.value.horaPrestamo,
          fechaDevolucion: new Date(this.solicitudForm.value.fechaDevolucion),
          horaDevolucion: this.solicitudForm.value.horaDevolucion,
          solicitante: 'Usuario Actual', // Replace with actual user
          motivo: this.solicitudForm.value.motivo,
          estado: 'Pendiente'
        };
        this.solicitudes.push(nuevaSolicitud);
        this.filtrarSolicitudes();
        this.solicitudesPendientes = this.solicitudes.filter(s => s.estado === 'Pendiente');
        this.cerrarModalSolicitud(new Event('click'));
        this.isSubmitting = false;
      }, 1000);
    }
  }

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}