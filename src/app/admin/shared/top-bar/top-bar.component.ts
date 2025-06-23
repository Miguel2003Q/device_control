import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  standalone: true, // 👈 importante si no se usa dentro de un módulo
  imports: [CommonModule, FormsModule],       // agrega aquí otros componentes/modulos si los necesitas
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {

  @Output() toggleSidebar = new EventEmitter<void>();
  searchText: string = '';
  sidebarActive = false;

  constructor(private authService: AuthService, private router: Router) {
    this.usuario = this.authService.getCurrentUser();
  }

  performSearch(): void {
    if (this.searchText.trim()) {
      // Navegar al componente de búsqueda con el texto como parámetro
      this.router.navigate(['/natural-lenguage-search'], {
        queryParams: { q: this.searchText.trim() }
      });
      
      // Limpiar el campo de búsqueda después de navegar
      this.searchText = '';
    }
  }

  toggleSidebarEmit() {
    this.sidebarActive = !this.sidebarActive;
    this.toggleSidebar.emit();
  }

  usuario: any = {
    nombre: 'No auth',
    rol: 0 // ejemplo numérico
  };

  // Diccionario para mapear el número a un texto
  rolesMap: Record<number, string> = {
    1: 'Vigilante',
    2: 'Instructor',
    3: 'Almacén',
    4: 'Administrador'
  };

  // Función opcional para obtener el nombre del rol
  getNombreRol(): string {
    return this.usuario?.rol ? this.rolesMap[this.usuario.rol] ?? 'Desconocido' : 'Desconocido';
  }
}
