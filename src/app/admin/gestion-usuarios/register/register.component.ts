import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Update the path below to the correct location of auth.service.ts
import { AuthService } from '../../../core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';
// Update the path below to the correct location of loading.service.ts
import { LoadingService } from '../../../core/services/loading.service';

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
    telefono: '',
    clave: '',
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
    private router: Router,
    private loadingService: LoadingService
  ) {}

  // Método para alternar visibilidad de la contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Método para alternar visibilidad de la confirmación de contraseña
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Método para evaluar la fuerza de la contraseña
  checkPasswordStrength() {
    const password = this.registerRequest.clave;
    let score = 0;

    // Criterios de evaluación
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    this.passwordStrengthScore = score;

    // Actualizar texto y clase según el puntaje
    switch (score) {
      case 0:
      case 1:
        this.passwordStrengthText = 'Débil';
        this.passwordStrengthClass = 'weak';
        break;
      case 2:
        this.passwordStrengthText = 'Media';
        this.passwordStrengthClass = 'medium';
        break;
      case 3:
      case 4:
        this.passwordStrengthText = 'Fuerte';
        this.passwordStrengthClass = 'strong';
        break;
    }
  }

  onSubmit() {
    this.loadingService.show();
    
    // Resetear mensajes
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loading) return; // Evita múltiples envíos

    this.loading = true;

    // Validación de campos requeridos
    if (!this.registerRequest.nombre || !this.registerRequest.email || !this.registerRequest.clave) {
      this.errorMessage = 'Por favor, completa todos los campos obligatorios.';
      this.loading = false;
      this.loadingService.hide();
      return;
    }

    // Validación de contraseña
    if (this.registerRequest.clave !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      this.loading = false;
      this.loadingService.hide();
      return;
    }

    // Validación de fuerza de contraseña (mínimo Media)
    if (this.passwordStrengthScore < 2) {
      this.errorMessage = 'La contraseña es demasiado débil. Usa al menos 8 caracteres, incluyendo mayúsculas, números y caracteres especiales.';
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
      next: (response: any) => {
        this.loading = false;
        this.loadingService.hide();
        this.successMessage = '¡Cuenta creada con éxito!';
        
        // Redirigir después de un breve retraso
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err: { status: number; error: { message: string; }; }) => {
        this.loading = false;
        this.loadingService.hide();
        if (err.status === 409) {
          this.errorMessage = 'El nombre de usuario o correo electrónico ya está en uso.';
        } else {
          this.errorMessage = err.error?.message || 'Error al crear la cuenta. Por favor, intenta nuevamente.';
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