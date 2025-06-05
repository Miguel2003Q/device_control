import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../shared/top-bar/top-bar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

interface User {
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  photoUrl?: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TopBarComponent, SidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @Input() sidebarActive: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  user: User = {
    nombre: '',
    email: '',
    telefono: '',
    rol: '',
    photoUrl: ''
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

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required]
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
    const user = this.authService.getCurrentUser();
    if (user) {
      this.user = {
        nombre: user.nombre ?? '',
        email: user.email ?? '',
        telefono: user.telefono?.toString() ?? '',
        rol: user.rol ?? '',
        photoUrl: user.photoUrl ?? ''
      };
      this.editForm.patchValue({
        nombre: this.user.nombre, // Corrección aplicada
        telefono: this.user.telefono
      });
    }
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
  if (this.editForm.valid && !this.isSubmitting) {
    this.isSubmitting = true;
    this.authService.updateUserProfile({
      nombre: this.editForm.value.nombre,
      telefono: this.editForm.value.telefono,
      email: this.user.email,   // Usa email aquí
      rol: this.user.rol,
      photoUrl: this.user.photoUrl
    }).subscribe({
      next: () => {
        this.user = {
          ...this.user,
          nombre: this.editForm.value.nombre,
          telefono: this.editForm.value.telefono
        };
        this.showNotification('Perfil actualizado exitosamente', 'success');
        this.closeEditModal(new Event('click'));
      },
      error: () => {
        this.showNotification('Error al actualizar el perfil', 'error');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
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

  savePhoto(): void {
    if (this.selectedFile) {
      this.isSubmitting = true;
      this.authService.uploadProfilePhoto(this.selectedFile).subscribe({
        next: (photoUrl: string) => {
          this.user.photoUrl = photoUrl;
          this.showNotification('Foto de perfil actualizada', 'success');
          this.closePhotoModal(new Event('click'));
        },
        error: () => {
          this.showNotification('Error al subir la foto', 'error');
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
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

  changePassword(): void {
    if (this.passwordForm.valid && !this.isSubmittingPassword) {
      this.isSubmittingPassword = true;
      this.authService.changePassword(
        this.passwordForm.value.currentPassword,
        this.passwordForm.value.newPassword
      ).subscribe({
        next: () => {
          this.showNotification('Contraseña cambiada exitosamente', 'success');
          this.closePasswordModal(new Event('click'));
        },
        error: () => {
          this.showNotification('Error al cambiar la contraseña', 'error');
        },
        complete: () => {
          this.isSubmittingPassword = false;
        }
      });
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