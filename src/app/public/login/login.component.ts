import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/login-request';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginRequest: LoginRequest = { email: '', clave: '' };
  errorMessage: string = '';
  successMessage: string = '';
  logoUrl: string = 'assets/logo.png'; // URL de la imagen del logo
  loading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  // Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.loadingService.show();
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    // Validate required fields
    if (!this.loginRequest.email || !this.loginRequest.clave) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      this.loading = false;
      this.loadingService.hide();
      return;
    }

    // Basic email validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(this.loginRequest.email)) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido.';
      this.loading = false;
      this.loadingService.hide();
      return;
    }

    // Call the login service
    this.authService.login(this.loginRequest).subscribe(
      (user: any) => {
        this.loading = false;
        this.loadingService.hide();
        this.successMessage = '¡Inicio de sesión exitoso!';
        // Store the token (assuming user.token exists)
        localStorage.setItem('token', user.token);
        // Redirect to home page after a short delay
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      (err) => {
        this.loading = false;
        this.loadingService.hide();
        this.errorMessage = err.error || 'Credenciales incorrectas. Por favor, intenta nuevamente.';
        console.error('Error en login:', err);
      }
    );
  }

  // Navigate to register page
  goToRegister() {
    this.router.navigate(['/register']);
  }
}