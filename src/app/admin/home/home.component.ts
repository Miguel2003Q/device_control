import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { TopBarComponent } from "../shared/top-bar/top-bar.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  sidebarActive: boolean = false;

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}
