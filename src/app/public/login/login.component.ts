import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/login-request';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';
import { trigger, style, animate, transition, state } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(50px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('shake', [
      transition(':enter', [
        animate('500ms', style({ transform: 'translateX(0)' }))
      ])
    ])
  ]
})

export class LoginComponent {
  loginRequest: LoginRequest = { email: '', clave: '' };
  errorMessage: string = '';
  successMessage: string = '';
  logoUrl: string = 'assets/logo.png'; // URL de la imagen del logo

  // Nuevas propiedades, para estilos
  usernameFocused = false;
  passwordFocused = false;
  showPassword = false;
  loading = false;
  showRegisterModal = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

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
        this.errorMessage = err.error || 'Usuario o contraseña incorrectos';
        console.error('Error en login:', err);
      }
    );
  }

  // Método para alternar visibilidad de contraseña
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Método para abrir modal de registro
  openRegisterModal(): void {
    this.showRegisterModal = true;
  }

  // Método para cerrar modal de registro
  closeRegisterModal(event: Event): void {
    event.preventDefault();
    this.showRegisterModal = false;
  }

}