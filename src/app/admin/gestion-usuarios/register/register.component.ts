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
    telefono: '',
    clave: 'senagalan',
    rol: ''
  };

  confirmPassword = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

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
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loading) return;

    this.loading = true;

    if (!this.registerRequest.nombre || !this.registerRequest.email) {
      this.errorMessage = 'Por favor, completa todos los campos obligatorios.';
      this.loading = false;
      this.loadingService.hide();
      return;
    }

    if (!this.registerRequest.rol) {
      this.errorMessage = 'Por favor, selecciona un rol.';
      this.loading = false;
      this.loadingService.hide();
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(this.registerRequest.email)) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido.';
      this.loading = false;
      this.loadingService.hide();
      return;
    }

    // 🔁 Mapeo del objeto para que coincida con el tipo RegisterRequest
    const payload = {
      username: this.registerRequest.nombre,
      email: this.registerRequest.email,
      phone: this.registerRequest.telefono,
      password: this.registerRequest.clave,
      rol: this.registerRequest.rol
    };

    this.authService.register(payload).subscribe({
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
