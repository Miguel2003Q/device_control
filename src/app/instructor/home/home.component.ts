import { Component } from '@angular/core';
import { TopBarComponent } from '../shared/top-bar/top-bar.component';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";

@Component({
  selector: 'app-home',
  imports: [TopBarComponent, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeInstructorComponent {

  sidebarActive: boolean = false;

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
  }

  constructor() { }

  ngOnInit(): void {
    // Aquí puedes cargar datos iniciales si es necesario
  }

  toggleSidebarEmit() {
    this.sidebarActive = !this.sidebarActive;
  }
}
