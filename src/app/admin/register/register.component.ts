import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service'; // Asegúrate de tener este servicio
import { HttpClientModule } from '@angular/common/http';
import { LoadingService } from '../../core/services/loading.service';
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
  loading: boolean = false;
  successMessage: string = '';


  constructor(private authService: AuthService, private router: Router,private loadingService: LoadingService,) {}

onSubmit() {

  this.loadingService.show();
    
    // Simula una llamada al backend (puedes reemplazar con tu lógica real)
    setTimeout(() => {
      this.loadingService.hide();
      this.router.navigate(['/login']);
    }, 2000); // Simula 2 segundos de carga nuevo
    // Resetear mensajes
    this.errorMessage = '';
    this.successMessage = '';
    if (this.loading) return; // Evita múltiples envíos

    this.loading = true;
    
    // Validación de campos requeridos
    if (!this.registerRequest.nombre || !this.registerRequest.email || !this.registerRequest.clave) {
      this.errorMessage = 'Por favor, completa todos los campos obligatorios.';
      return;
    }

   // Validación de contraseña
    if (this.registerRequest.clave !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    // Validación de rol seleccionado
    if (!this.registerRequest.rol) {
      this.errorMessage = 'Por favor, selecciona un rol.';
      return;
    }

    // Validación básica de email
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(this.registerRequest.email)) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido.';
      return;
    }

    // Activar indicador de carga
    
this.loading = true;
    // Llamada al servicio para registrar
    this.authService.register(this.registerRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = '¡Cuenta creada con éxito!';
        
        // Redirigir después de un breve retraso para que el usuario vea el mensaje de éxito
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
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
  }
  
}