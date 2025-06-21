import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:8080/api/search';

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