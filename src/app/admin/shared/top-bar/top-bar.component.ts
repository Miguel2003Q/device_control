import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  standalone: true, // 👈 importante si no se usa dentro de un módulo
  imports: [],       // agrega aquí otros componentes/modulos si los necesitas
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {
  @Input() usuario: any; // o reemplaza `any` con el tipo real de tu usuario

  @Output() cerrarSesion = new EventEmitter<void>();
}
