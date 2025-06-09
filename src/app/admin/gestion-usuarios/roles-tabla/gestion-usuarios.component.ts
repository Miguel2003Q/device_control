import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from "../../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, TopBarComponent, SidebarComponent, RouterModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css']
})
export class RolesTablaComponent implements OnInit {

  sidebarActive: boolean = false;
  conteoPorRol: Record<number, number> = {};

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.usuarioService.obtenerTodosLosUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.conteoPorRol = this.contarUsuariosPorRol(usuarios);
      },
      error: (err) => {
        console.error('Error al obtener usuarios', err);
      }
    });
  }

  private contarUsuariosPorRol(usuarios: Usuario[]): Record<number, number> {
    const conteo: Record<number, number> = {};
    usuarios.forEach(usuario => {
      const rol = usuario.rol;
      conteo[rol] = (conteo[rol] || 0) + 1;
    });
    return conteo;
  }

  rolIds: Record<string, number> = {
    'Administrador': 4,
    'Almacén': 3,
    'Instructor': 2,
    'Vigilante': 1
  };

  getCantidadPorRol(nombre: string): number {
    const rolId = this.rolIds[nombre];
    return this.conteoPorRol[rolId] || 0;
  }

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}
