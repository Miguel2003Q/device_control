import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Ambiente } from '../models/ambiente.model';

@Injectable({
  providedIn: 'root'
})
export class EspacioService {
  private apiUrl = 'http://localhost:8080/espacios'; // Ajusta la URL según tu API Spring Boot

  constructor(private http: HttpClient) {}

  // Método privado para obtener los encabezados con el token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Ajusta 'token' según tu clave (p. ej., 'authToken')
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Get all spaces
  obtenerTodosLosEspacios(): Observable<Ambiente[]> {
    return this.http.get<Ambiente[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Get space by ID
  obtenerEspacioPorId(id: number): Observable<Ambiente> {
    return this.http.get<Ambiente>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Search spaces by name
  buscarEspaciosPorNombre(nombre: string): Observable<Ambiente[]> {
    return this.http.get<Ambiente[]>(`${this.apiUrl}/buscarPorNombre?nombre=${encodeURIComponent(nombre)}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Count spaces
  contarEspacios(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/contar`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Save or update a space
  guardarEspacio(espacio: Ambiente): Observable<Ambiente> {
    const headers = this.getHeaders();
    if (espacio.id) {
      return this.http.put<Ambiente>(`${this.apiUrl}/${espacio.id}`, espacio, { headers }).pipe(
        catchError(this.handleError)
      );
    } else {
      return this.http.post<Ambiente>(this.apiUrl, espacio, { headers }).pipe(
        catchError(this.handleError)
      );
    }
  }

  // Delete a space
  eliminarEspacio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error ${error.status}: ${error.message}`;
    }
    console.error(errorMessage); // Opcional: para depuración
    return throwError(() => new Error(errorMessage));
  }
}