import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { CommonModule } from '@angular/common';

interface User {
  nombre: string;
  correo: string;
  telefono: string;
  rol: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
  imports: [CommonModule, ReactiveFormsModule, TopBarComponent, SidebarComponent]
})
export class PerfilVigilanteComponent implements OnInit {
  @Input() sidebarActive: boolean = false;

  user: User = {
    nombre: 'Juan Pérez',
    correo: 'juan.perez@example.com',
    telefono: '+1234567890',
    rol: 'Administrador'
  };

  showEditModal: boolean = false;
  showPasswordModal: boolean = false;
  editForm: FormGroup;
  passwordForm: FormGroup;
  isSubmitting: boolean = false;
  isSubmittingPassword: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | null = null;

  constructor(private fb: FormBuilder) {
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
    // Mock data (replace with service call)
    this.editForm.patchValue({
      nombre: this.user.nombre,
      telefono: this.user.telefono
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
    if (this.editForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      // Simulate API call
      setTimeout(() => {
        this.user = {
          ...this.user,
          nombre: this.editForm.value.nombre,
          telefono: this.editForm.value.telefono
        };
        this.showNotification('Perfil actualizado exitosamente', 'success');
        this.closeEditModal(new Event('click'));
        this.isSubmitting = false;
      }, 1000);
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
      // Simulate API call
      setTimeout(() => {
        // Add actual password change logic here
        this.showNotification('Contraseña cambiada exitosamente', 'success');
        this.closePasswordModal(new Event('click'));
        this.isSubmittingPassword = false;
      }, 1000);
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