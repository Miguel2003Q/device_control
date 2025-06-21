import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NaturalLanguageSearchService, SearchResponse } from '../../core/services/NaturalLanguageSearch.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class SearchResultsComponent {
  searchPrompt: string = '';
  searchResponse: SearchResponse | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private searchService: NaturalLanguageSearchService) {}

  performSearch(): void {
    if (!this.searchPrompt.trim()) {
      this.errorMessage = 'Please enter a search query.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.searchResponse = null;

    this.searchService.searchWithNaturalLanguage(this.searchPrompt).subscribe({
      next: (response: SearchResponse) => {
        this.searchResponse = response;
        this.isLoading = false;
        if (!response.success) {
          this.errorMessage = response.error || 'Search failed. Please try again.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred while fetching results. Please try again later.';
        console.error('Search error:', err);
      }
    });
  }

  getResultKeys(result: any): string[] {
    return Object.keys(result).filter(key => key !== 'id' && key !== '_id');
  }

  formatValue(value: any): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    } else if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value?.toString() || '';
  }

  viewDetails(result: any): void {
    // Implementar lógica para ver detalles del resultado
    console.log('View details for:', result);
    // Aquí podrías emitir un evento, navegar a otra ruta, o mostrar un modal
  }

  testConnection(): void {
    this.searchService.testConnection().subscribe({
      next: (response: string) => {
        console.log('Connection test successful:', response);
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Connection test failed:', err);
        this.errorMessage = 'Failed to connect to the server.';
      }
    });
  }
}