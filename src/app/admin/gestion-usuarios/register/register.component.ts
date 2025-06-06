import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerRequest = {
    nombre: '',
    email: '',
    telefono: '', //Devería ser senagalan por defecto
    clave: 'senagalan', //Devería ser vacío por defecto
    rol: ''
  };

  confirmPassword = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  // Propiedades para la visibilidad de contraseñas
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Propiedades para la fuerza de la contraseña
  passwordStrengthScore: number = 0;
  passwordStrengthText: string = 'Débil';
  passwordStrengthClass: string = 'weak';

  constructor(
    private authService: AuthService,
    private loadingService: LoadingService,
    private toast: ToastrService
  ) {}

  onSubmit() {
    this.loadingService.show();
    
    // Resetear mensajes
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loading) return; // Evita múltiples envíos

    this.loading = true;

    // Validación de campos requeridos
    if (!this.registerRequest.nombre || !this.registerRequest.email) {
      this.errorMessage = 'Por favor, completa todos los campos obligatorios.';
      this.loading = false;
      this.loadingService.hide();
      return;
    }

    // Validación de rol seleccionado
    if (!this.registerRequest.rol) {
      this.errorMessage = 'Por favor, selecciona un rol.';
      this.loading = false;
      this.loadingService.hide();
      return;
    }

    // Validación básica de email
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(this.registerRequest.email)) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido.';
      this.loading = false;
      this.loadingService.hide();
      return;
    }

    // Llamada al servicio para registrar
    this.authService.register(this.registerRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.loadingService.hide();
        this.successMessage = '¡Cuenta creada con éxito!';
        this.toast.success(this.successMessage, 'Éxito', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      
      },
      error: (err) => {
        this.loading = false;
        this.loadingService.hide();
        if (err.status === 409) {
          this.errorMessage = 'El nombre de usuario o correo electrónico ya está en uso.';
        } else {
          this.errorMessage = err.error || 'Error al crear la cuenta. Por favor, intenta nuevamente.';
        }
        console.error('Error en registro:', err);
      }
    });
  }

  // Método auxiliar para limpiar el formulario
  resetForm() {
    this.registerRequest = {
      nombre: '',
      email: '',
      telefono: '',
      clave: '',
      rol: ''
    };
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.passwordStrengthScore = 0;
    this.passwordStrengthText = 'Débil';
    this.passwordStrengthClass = 'weak';
  }
}