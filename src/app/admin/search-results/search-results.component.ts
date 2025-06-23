import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NaturalLanguageSearchService, SearchResponse } from '../../core/services/NaturalLanguageSearch.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopBarComponent } from "../shared/top-bar/top-bar.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { trigger, state, style, transition, animate, stagger, query } from '@angular/animations';

@Component({
  selector: 'app-natural-language-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TopBarComponent, SidebarComponent],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  sidebarActive: boolean = false;
  searchPrompt: string = '';
  results: any[] = [];
  sqlQuery: string = '';
  error: string = '';
  isLoading: boolean = false;
  searchHistory: string[] = [];
  isSearchFocused: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private searchService: NaturalLanguageSearchService,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) {
    // Cargar historial de búsqueda del localStorage
    this.loadSearchHistory();
  }

  ngOnInit() {
    // Test connection
    this.searchService.testConnection().subscribe({
      next: (response) => console.log('API connected:', response),
      error: (err) => console.error('API connection error:', err)
    });

    // Suscribirse a los cambios en los parámetros de consulta
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const query = params['q'];
        if (query) {
          this.searchPrompt = query;
          this.search();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  search() {
    if (!this.searchPrompt.trim()) return;

    this.isLoading = true;
    this.error = '';
    this.results = [];
    this.sqlQuery = '';

    // Agregar al historial
    this.addToSearchHistory(this.searchPrompt);

    this.searchService.searchWithNaturalLanguage(this.searchPrompt).subscribe({
      next: (response: SearchResponse) => {
        this.isLoading = false;
        
        if (response.success) {
          this.results = response.results || [];
          this.sqlQuery = response.query || '';

        } else {
          this.error = 'Por favor, intenta con una consulta más específica';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Error de conexión. Por favor, intenta nuevamente.';
        console.error('Search error:', err);
      }
    });
  }

  getColumns(): string[] {
    if (this.results.length === 0) return [];
    return Object.keys(this.results[0]);
  }

  formatColumnName(column: string): string {
    // Convertir snake_case a Title Case
    return column
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatCellValue(value: any): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'number') return value.toLocaleString('es-ES');
    if (value instanceof Date) return value.toLocaleDateString('es-ES');
    return value.toString();
  }

  setExample(example: string) {
    this.searchPrompt = example;
    // Opcional: ejecutar búsqueda automáticamente
    // this.search();
  }

  onSearchFocus() {
    this.isSearchFocused = true;
  }

  onSearchBlur() {
    this.isSearchFocused = false;
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Mostrar notificación de éxito
      this.toast.success('Consulta copiada al portapapeles');
    }).catch(() => {
      this.toast.error('No se pudo copiar la consulta');
    });
  }

  exportResults(format: 'csv' | 'excel') {
    // Implementar lógica de exportación
    if (format === 'csv') {
      this.exportToCSV();
    }
  }

  private exportToCSV() {
    const headers = this.getColumns();
    const csvContent = [
      headers.join(','),
      ...this.results.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar valores que contienen comas
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `busqueda_${new Date().getTime()}.csv`;
    link.click();
    
    this.toast.success('Archivo CSV descargado exitosamente');
  }

  private loadSearchHistory() {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      this.searchHistory = JSON.parse(history).slice(0, 5);
    }
  }

  private addToSearchHistory(query: string) {
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      this.searchHistory = this.searchHistory.slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
  }

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}