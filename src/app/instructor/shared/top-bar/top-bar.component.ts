import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationSettingsComponent } from "../../../auxiliar/notificaciones/notification-settings.component";
import { NotificacionesComponent } from "../../../auxiliar/notificaciones/notificaciones.component";

@Component({
  selector: 'app-top-bar',
  imports: [CommonModule, NotificationSettingsComponent, NotificacionesComponent],
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

  toggleDropdown(id: number | null) {
    this.openedDropdownId = this.openedDropdownId === id ? null : id;
  }
}