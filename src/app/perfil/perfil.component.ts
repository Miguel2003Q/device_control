// perfil.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from "../admin/shared/top-bar/top-bar.component";
import { SidebarComponent } from "../admin/shared/sidebar/sidebar.component";
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
interface Profile {
  nombre: string;
  correo: string;
  telefono: string;
  rol: string;
}

interface Passwords {
  new: string;
  confirm: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, TopBarComponent, SidebarComponent,FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  // Profile data
  profile: Profile = {
    nombre: 'No auth',
    correo: 'No auth',
    telefono: 'No auth',
    rol: 'No auth'
  };
  
  // Modal states
  showEditModal = false;
  showPhotoModal = false;
  showPasswordModal = false;
  
  // Password fields
  passwords: Passwords = {
    new: '',
    confirm: ''
  };
  
  // Selected file
  selectedFile: File | null = null;
  
  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    console.log(this.authService.getCurrentUser());

    this.cargarPerfil();
  }

  cargarPerfil(): void {
    // Aquí puedes cargar el perfil del usuario desde un servicio
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profile = {
        nombre: user.nombre ?? '',
        correo: user.email ?? '',
        telefono: user.telefono?.toString() ?? '',
        rol: user.rol ?? ''
      };
    }
  }
  
  // Handle profile data changes
  handleProfileChange(event: any): void {
    const { name, value } = event.target;
    this.profile = {
      ...this.profile,
      [name]: value
    };
  }
  
  // Handle password changes
  handlePasswordChange(event: any): void {
    const { name, value } = event.target;
    this.passwords = {
      ...this.passwords,
      [name]: value
    };
  }
  
  // Handle file selection
  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
  
  // Handle form submissions
  saveProfile(): void {
    // Here you would typically send the data to an API
    console.log('Profile saved:', this.profile);
    this.showEditModal = false;
  }
  
  savePassword(): void {
    // Check if passwords match
    if (this.passwords.new !== this.passwords.confirm) {
      alert('Las contraseñas no coinciden');
      return;
    }
    // Here you would typically send the password to an API
    console.log('Password changed:', this.passwords);
    this.showPasswordModal = false;
    // Reset password fields
    this.passwords = { new: '', confirm: '' };
  }
  
  savePhoto(): void {
    // Here you would typically handle photo upload logic
    console.log('Photo saved', this.selectedFile);
    this.showPhotoModal = false;
    this.selectedFile = null;
  }
  
  // Toggle modals
  openEditModal(): void {
    this.showEditModal = true;
  }
  
  openPhotoModal(): void {
    this.showPhotoModal = true;
    this.showEditModal = false;
  }
  
  openPasswordModal(): void {
    this.showPasswordModal = true;
  }
  
  closeAllModals(): void {
    this.showEditModal = false;
    this.showPhotoModal = false;
    this.showPasswordModal = false;
  }
}