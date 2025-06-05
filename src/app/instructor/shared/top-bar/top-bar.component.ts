import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-top-bar',
  imports: [],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  sidebarActive = false;

  usuario: any = null;

  constructor(private authService: AuthService) {
    this.usuario = this.authService.getCurrentUser();
  }

  toggleSidebarEmit() {
    this.sidebarActive = !this.sidebarActive;
    this.toggleSidebar.emit();
  }

  rolesMap: Record<number, string> = {
    1: 'Vigilante',
    2: 'Instructor',
    3: 'Almacén',
    4: 'Administrador'
  };

  getNombreRol(): string {
    return this.usuario?.rol ? this.rolesMap[this.usuario.rol] ?? 'Desconocido' : 'Desconocido';
  }
}