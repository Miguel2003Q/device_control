import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TopBarComponent } from '../shared/top-bar/top-bar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { EspacioService } from '../../core/services/espacio.service';
import { LoadingService } from '../../core/services/loading.service';
import { Espacio } from '../../core/models/espacio.model';
import { SolicitudEspacio } from '../../core/models/solicitudEspacio.model';
import { SolicitudEspacioService } from '../../core/services/solicitudEspacio.service';
import { AuthService } from '../../core/services/auth.service';


export const fechasValidasValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => { //Valida que las fechas y horas de préstamo y devolución sean correctas
  const fechaPrestamo = group.get('fechaPrestamo')?.value;
  const horaPrestamo = group.get('horaPrestamo')?.value;
  const fechaDevolucion = group.get('fechaDevolucion')?.value;
  const horaDevolucion = group.get('horaDevolucion')?.value;

  if (!fechaPrestamo || !horaPrestamo || !fechaDevolucion || !horaDevolucion) {
    return null; // Aún no completado
  }

  const inicio = new Date(`${fechaPrestamo}T${horaPrestamo}`);
  const fin = new Date(`${fechaDevolucion}T${horaDevolucion}`);

  return fin > inicio ? null : { fechasInvalidas: true };
};

@Component({
  selector: 'app-solicitudes-ambientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TopBarComponent, SidebarComponent],
  templateUrl: './solicitar-espacio.component.html',
  styleUrls: ['./solicitar-espacio.component.css']
})
export class SolicitarEspacioComponent implements OnInit {
  // Properties
  espacios: Espacio[] = [];
  espaciosFiltrados: Espacio[] = [];
  searchTerm: string = '';
  filtroEstado: string = '';
  sidebarActive: boolean = true;
  screenWidth: number;
  showModalSolicitud: boolean = false;
  showModalDetalles: boolean = false;
  espacioSeleccionado: Espacio | null = null;
  isSubmitting: boolean = false;
  minDate: string = new Date().toISOString().split('T')[0];
  solicitudForm: FormGroup;

  // User info (mocked, replace with auth service)
  usuarioActual = {
    nombre: 'Juan Benicio',
    rol: 'Administrador'
  };

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private espacioService: EspacioService,
    private solicitudService: SolicitudEspacioService,
    private loading: LoadingService,
    private toastr: ToastrService
  ) {
    // Initialize screen width
    this.screenWidth = window.innerWidth;

    // Initialize form
    this.solicitudForm = this.fb.group({
      ambiente: [null, Validators.required],
      fechaPrestamo: ['', Validators.required],
      horaPrestamo: ['', Validators.required],
      fechaDevolucion: ['', Validators.required],
      horaDevolucion: ['', Validators.required],
      motivo: ['', Validators.required]
    }, { validators: fechasValidasValidator });

    // Check screen size for sidebar
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.cargarEspacios();
    this.espaciosFiltrados = [...this.espacios];
  }

  // Handle window resize
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    this.checkScreenSize();
  }

  // Check screen size for sidebar visibility
  checkScreenSize(): void {
    this.sidebarActive = this.screenWidth >= 991;
  }

  // Toggle sidebar
  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  // Load environments
  cargarEspacios(): void {
    this.loading.show();
    this.espacioService.obtenerTodosLosEspacios().subscribe({
      next: (espacios: Espacio[]) => {
        this.espacios = espacios;
        this.espaciosFiltrados = [...this.espacios];
        this.loading.hide();
      },
      error: (error: { message: string }) => {
        console.error('Error al cargar espacios:', error.message);
        this.toastr.error('Error al cargar los espacios', 'Error');
        this.loading.hide();
      }
    });
  }

  // Filter environments
  filtrarAmbientes(): void {
    const termino = this.searchTerm.toLowerCase().trim();
    this.espaciosFiltrados = this.espacios.filter(espacio => {
      return (
        (termino === '' ||
          espacio.nombre.toLowerCase().includes(termino) ||
          espacio.descripcion.toLowerCase().includes(termino)) &&
        (this.filtroEstado === '' || espacio.estado === this.filtroEstado)
      );
    });
  }

  // Open request modal
  abrirModalSolicitudAmbiente(espacioPreseleccionado?: Espacio): void {
    this.solicitudForm.reset({
      fechaPrestamo: '',
      horaPrestamo: '',
      fechaDevolucion: '',
      horaDevolucion: '',
      motivo: '',
      ambiente: espacioPreseleccionado ?? ''
    });
    this.showModalSolicitud = true;
  }


  // Close request modal
  cerrarModalSolicitud(event?: Event): void {
    if (
      !event ||
      (event.target as HTMLElement).classList.contains('modal-overlay') ||
      (event.target as HTMLElement).closest('.close-modal-btn, .cancel-btn')
    ) {
      this.showModalSolicitud = false;
      this.solicitudForm.reset();
    }
  }

  // Submit request
  enviarSolicitudAmbiente(): void {
    if (this.solicitudForm.invalid) {
      Object.keys(this.solicitudForm.controls).forEach(key => {
        const control = this.solicitudForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formData = this.solicitudForm.value;

    const solicitante = this.authService.getCurrentUser(); //Si no se esta logueado?
    if (!solicitante) {
      this.toastr.error('No se pudo obtener el usuario actual', 'Error');
      this.isSubmitting = false;
      return;
    }

    const nuevaSolicitud: SolicitudEspacio = {
      espacio: formData.ambiente,
      fechaSolicitud: this.getFechaLocalISO(), // "YYYY-MM-DDTHH:mm"
      fechaPres: `${formData.fechaPrestamo}T${formData.horaPrestamo}`,
      fechaDevol: `${formData.fechaDevolucion}T${formData.horaDevolucion}`,
      motivo: formData.motivo,
      estado: 'Pendiente', // Default state
      usuario: solicitante,
    };

    this.solicitudService.crearSolicitud(nuevaSolicitud).subscribe({
      next: (solicitudCreada) => {
        this.toastr.success(`Solicitud para "${formData.ambiente.nombre}" creada`, 'Éxito');
        this.isSubmitting = false;
        this.showModalSolicitud = false;
        this.solicitudForm.reset();
      },
      error: (error: any) => {
        console.error('Error al enviar solicitud:', error);
        const mensaje = typeof error.error === 'string' ? error.error : 'Error al enviar la solicitud';
        this.toastr.error(mensaje, 'Error');
        this.isSubmitting = false;
      }
    });
  }

  // Pre-fill form and open modal
  solicitarEspacio(espacio: Espacio): void {
    this.solicitudForm.get('ambiente')?.setValue(espacio);
    this.abrirModalSolicitudAmbiente(espacio);
  }

  // Validate form fields
  isValid(controlName: string): boolean {
    const control = this.solicitudForm.get(controlName);
    return control?.invalid && (control?.dirty || control?.touched) || false;
  }

  // Open details modal
  verDetallesAmbiente(espacio: Espacio): void {
    this.espacioSeleccionado = espacio;
    this.showModalDetalles = true;
  }

  // Close details modal
  cerrarModalDetalles(event?: Event): void {
    if (
      !event || event?.target === event?.currentTarget ||
      (event?.target as HTMLElement)?.closest('.close-modal-btn, .cancel-btn')
    ) {
      this.showModalDetalles = false;
      this.espacioSeleccionado = null;
    }
  }

  getFechaLocalISO(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

}