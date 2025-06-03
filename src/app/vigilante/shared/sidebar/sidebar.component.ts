import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  @Input() active: boolean = false;
  @Output() cerrarSesion = new EventEmitter<void>();

  onCerrarSesion() {
    this.cerrarSesion.emit();
  }

}
