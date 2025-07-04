import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SearchResponse {
  success: boolean;
  query?: string;
  results?: any[];
  count?: number;
  error?: string;
}

export interface SearchRequest {
  prompt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NaturalLanguageSearchService {
  private apiUrl = `${environment.apiUrl}/api/search`;

  constructor(private http: HttpClient) {}

  searchWithNaturalLanguage(prompt: string): Observable<SearchResponse> {
    const request: SearchRequest = { prompt };
    return this.http.post<SearchResponse>(
      `${this.apiUrl}/natural-language`, 
      request
    );
  }

  testConnection(): Observable<string> {
    return this.http.get(`${this.apiUrl}/test`, { responseType: 'text' });
  }
}