import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// IMPORTA COMPONENTES STANDALONE USADOS EN EL HTML
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { TopBarComponent } from '../shared/top-bar/top-bar.component';


@Component({
  selector: 'app-estadisticas-activos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    SidebarComponent,
    TopBarComponent,
  ],
  templateUrl: './estadisticas-activos.component.html',
  styleUrls: ['./estadisticas-activos.component.css']
})
export class EstadisticasActivosComponent implements OnInit {

  // NECESARIO PARA QUE funcione `[active]` en app-sidebar
  sidebarActive: boolean = true;

  // NECESARIO PARA manejar evento `(toggleSidebar)`
  toggleSidebarEmit() {
    this.sidebarActive = !this.sidebarActive;
  }

  // Lógica del componente
  estadisticas: any = null;
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEstadisticas();
  }

  loadEstadisticas(): void {
    this.loading = true;
    this.http.get<any>('http://localhost:8080/estadisticas/activos')
      .subscribe({
        next: (data) => {
          this.estadisticas = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar estadísticas:', err);
          this.loading = false;
        }
      });
  }

  refreshData(): void {
    this.loadEstadisticas();
  }

  viewPDF(): void {
    window.open('http://localhost:8080/estadisticas/activos/pdf', '_blank');
  }

  downloadPDF(): void {
    window.location.href = 'http://localhost:8080/estadisticas/activos/pdf';
  }

  downloadExcel(): void {
    window.location.href = 'http://localhost:8080/estadisticas/activos/excel';
  }
}
