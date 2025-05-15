import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/login-request';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


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
  logoUrl: string = 'assets/logo.png'; // URL de la imagen del logo

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.authService.login(this.loginRequest).subscribe({
      next: () => {
        console.log('Login successful');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
        console.error(err);
      }
    });
  }
}