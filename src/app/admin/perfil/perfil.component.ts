import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../shared/top-bar/top-bar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { LoadingService } from '../../core/services/loading.service';

interface User {
  id?: number;
  nombre: string;
  correo: string;
  telefono: string;
  rol: number;

}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TopBarComponent, SidebarComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  @Input() sidebarActive: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  user: User = {
    nombre: '',
    correo: '',
    telefono: '',
    rol: 0,

  };

  showEditModal: boolean = false;
  showPhotoModal: boolean = false;
  showPasswordModal: boolean = false;
  editForm: FormGroup;
  passwordForm: FormGroup;
  isSubmitting: boolean = false;
  isSubmittingPassword: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | null = null;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private usuarioService: UsuarioService, private loadingService: LoadingService) {
    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.loadingService.show();
    const userLocal = this.authService.getCurrentUser();
    const userId = userLocal?.idusuario || 0;

    if (userId === 0) {
      console.error('ID de usuario inválido.');
      return;
    }

    this.usuarioService.obtenerUsuarioPorId(userId).subscribe({
      next: (userData) => {
        this.user = {
          id: userData.idusuario,
          nombre: userData.nombre ?? '',
          correo: userData.email ?? '',
          telefono: userData.telefono?.toString() ?? '',
          rol: userData.rol ?? '',
        };

        this.editForm.patchValue({
          nombre: this.user.nombre,
          telefono: this.user.telefono
        });

        this.loadingService.hide();
        console.log('User data loaded:', this.user);
      },
      error: (err) => {
        console.error('No se pudo cargar el usuario:', err);
        this.loadingService.hide();
      }
    });
  }


  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword === confirmPassword
      ? null
      : { mismatch: true };
  }

  isInvalid(controlName: string, form: FormGroup): boolean {
    const control = form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  openEditModal(): void {
    this.editForm.patchValue({
      nombre: this.user.nombre,
      telefono: this.user.telefono
    });
    this.showEditModal = true;
  }

  closeEditModal(event: Event): void {
    if (event.target === event.currentTarget || (event.target as HTMLElement).closest('.close-modal-btn, .cancel-btn')) {
      this.showEditModal = false;
      this.editForm.reset();
      this.isSubmitting = false;
    }
  }

  saveProfile(): void {
    if (this.editForm.valid && !this.isSubmitting && this.user.id) {
      this.isSubmitting = true;

      const updateData = {
        nombre: this.editForm.value.nombre.trim(),
        telefono: this.editForm.value.telefono.trim()
      };

      this.authService.updateUserProfile(this.user.id, updateData).subscribe({
        next: (updatedUser) => {
          // Actualizar los datos locales del usuario
          this.user = {
            ...this.user,
            nombre: updatedUser.nombre,
            telefono: updatedUser.telefono?.toString() ?? ''
          };

          // Actualizar también el usuario en el servicio de autenticación si es necesario
          // this.authService.updateCurrentUserData(updatedUser);

          this.showNotification('Perfil actualizado exitosamente', 'success');
          this.closeEditModal(new Event('click'));
        },
        error: (error) => {
          console.error('Error al actualizar el perfil:', error);
          const errorMessage = error.error?.message || error.error || 'Error al actualizar el perfil';
          this.showNotification(errorMessage, 'error');
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      if (!this.user.id) {
        this.showNotification('Error: ID de usuario no encontrado', 'error');
      }
    }
  }

  openPhotoModal(): void {
    this.showPhotoModal = true;
    this.showEditModal = false;
  }

  closePhotoModal(event: Event): void {
    if (event.target === event.currentTarget || (event.target as HTMLElement).closest('.close-modal-btn, .cancel-btn')) {
      this.showPhotoModal = false;
      this.selectedFile = null;
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  openPasswordModal(): void {
    this.passwordForm.reset();
    this.showPasswordModal = true;
  }

  closePasswordModal(event: Event): void {
    if (event.target === event.currentTarget || (event.target as HTMLElement).closest('.close-modal-btn, .cancel-btn')) {
      this.showPasswordModal = false;
      this.passwordForm.reset();
      this.isSubmittingPassword = false;
    }
  }


  showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => {
      this.notificationMessage = '';
      this.notificationType = null;
    }, 3000);
  }

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}