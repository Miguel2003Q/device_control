import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() active: boolean = false; // 👈 necesario para [active]
  @Output() toggle = new EventEmitter<void>(); // 👈 necesario para (toggle)
  @Output() cerrarSesion = new EventEmitter<void>(); // 👈 necesario para (cerrarSesion)
}
