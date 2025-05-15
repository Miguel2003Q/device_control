import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8080/usuarios';

  constructor(private http: HttpClient) { }

  testConnection(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/test`);
  }
}