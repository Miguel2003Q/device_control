import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificacionesComponent } from "../../../auxiliar/notificaciones/notificaciones.component";
import { NotificationSettingsComponent } from "../../../auxiliar/notificaciones/notification-settings.component";

@Component({
  selector: 'app-top-bar',
  imports: [CommonModule, NotificacionesComponent, NotificationSettingsComponent],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  sidebarActive = false;
  openedDropdownId: number | null = null;

  usuario: any = null;

  constructor(private authService: AuthService) {
    this.usuario = this.authService.getCurrentUser();
  }

  toggleDropdown(id: number | null) {
    this.openedDropdownId = this.openedDropdownId === id ? null : id;
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