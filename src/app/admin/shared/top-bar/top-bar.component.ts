import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-top-bar',
  standalone: true, // 👈 importante si no se usa dentro de un módulo
  imports: [],       // agrega aquí otros componentes/modulos si los necesitas
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {

  constructor(private authService: AuthService) {
    this.usuario = this.authService.getCurrentUser();
  }

  usuario: any = {
    nombre: 'No auth',
    rol: 0 // ejemplo numérico
  };

  // Diccionario para mapear el número a un texto
  rolesMap: Record<number, string> = {
    1: 'Vigilante',
    2: 'Instructor',
    3: 'Almacén'
  };

  // Función opcional para obtener el nombre del rol
  getNombreRol(): string {
    return this.rolesMap[this.usuario.rol] || 'Desconocido';
  }
}
