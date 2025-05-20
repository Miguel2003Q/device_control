import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, ReactiveFormsModule],
  templateUrl: './register.component.html', //Falta el css
  styleUrls: ['./register.component.css']
})
export class RegistroUsuarioComponent implements OnInit {
  registroForm: FormGroup;
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  passwordStrength: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombreCompleto: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      rol: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Suscribirse a cambios en la contraseña para calcular la fortaleza
    this.registroForm.get('contrasena')?.valueChanges.subscribe((password) => {
      this.calculatePasswordStrength(password);
    });
  }

  // Verificar si el campo es invalido
  isFieldInvalid(field: string): boolean {
    const formControl = this.registroForm.get(field);
    return formControl !== null && formControl !== undefined && 
           formControl.invalid && 
           (formControl.dirty || formControl.touched);
  }

  // Alternar visibilidad de contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Calcular fortaleza de contraseña
  calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;
    
    // Longitud
    if (password.length >= 8) {
      strength += 25;
    } else if (password.length >= 6) {
      strength += 15;
    }
    
    // Mayúsculas y minúsculas
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      strength += 25;
    } else if (/[a-z]/.test(password) || /[A-Z]/.test(password)) {
      strength += 15;
    }
    
    // Números
    if (/[0-9]/.test(password)) {
      strength += 25;
    }
    
    // Caracteres especiales
    if (/[^a-zA-Z0-9]/.test(password)) {
      strength += 25;
    }
    
    this.passwordStrength = strength;
  }

  // Obtener color basado en la fortaleza de la contraseña
  getPasswordStrengthColor(): string {
    if (this.passwordStrength < 30) {
      return '#F44336'; // Rojo - débil
    } else if (this.passwordStrength < 60) {
      return '#FFA726'; // Naranja - media
    } else if (this.passwordStrength < 80) {
      return '#66BB6A'; // Verde claro - buena
    } else {
      return '#43A047'; // Verde oscuro - fuerte
    }
  }

  // Obtener texto basado en la fortaleza de la contraseña
  getPasswordStrengthText(): string {
    if (this.passwordStrength < 30) {
      return 'Débil';
    } else if (this.passwordStrength < 60) {
      return 'Media';
    } else if (this.passwordStrength < 80) {
      return 'Buena';
    } else {
      return 'Fuerte';
    }
  }

  // Manejar envío del formulario
  onSubmit(): void {
    if (this.registroForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.registroForm.controls).forEach(key => {
        const control = this.registroForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Aquí iría la lógica para enviar los datos al backend
    // Simulando una llamada a API con un timeout
    setTimeout(() => {
      console.log('Formulario enviado:', this.registroForm.value);
      
      // Después de registrar, navegar al login o dashboard
      this.isSubmitting = false;
      this.router.navigate(['/login']);
      
      // Aquí podrías mostrar un mensaje de éxito usando un servicio de notificaciones
    }, 1500);
  }
}