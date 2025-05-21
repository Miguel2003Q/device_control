import { Component } from '@angular/core';
import { TopBarComponent } from "../../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gestion-usuarios',
  imports: [TopBarComponent, SidebarComponent, RouterModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css'
})
export class RolesTablaComponent {

}
