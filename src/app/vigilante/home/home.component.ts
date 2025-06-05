import { Component } from '@angular/core';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";

@Component({
  selector: 'app-home',
  imports: [TopBarComponent, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeVigilanteComponent {

  sidebarActive: boolean = false;

    toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}
