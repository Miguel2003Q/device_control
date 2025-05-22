import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Activo } from '../models/activo.model'; // Asegúrate de tener este modelo creado

@Injectable({
  providedIn: 'root'
})
export class ActivoService {
  private apiUrl = 'http://localhost:8080/activos'; // Ajusta según tu API Spring Boot

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Obtener todos los activos
  obtenerTodosLosActivos(): Observable<Activo[]> {
    return this.http.get<Activo[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener un activo por ID
  obtenerActivoPorId(id: number): Observable<Activo> {
    return this.http.get<Activo>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Buscar activos por nombre
  buscarActivosPorNombre(nombre: string): Observable<Activo[]> {
    return this.http.get<Activo[]>(`${this.apiUrl}/buscarPorNombre?nombre=${encodeURIComponent(nombre)}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Contar activos
  contarActivos(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/contar`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Guardar o actualizar un activo
  guardarActivo(activo: Activo): Observable<Activo> {
    const headers = this.getHeaders();
    if (activo.idactivo) {
      return this.http.put<Activo>(`${this.apiUrl}/${activo.idactivo}`, activo, { headers }).pipe(
        catchError(this.handleError)
      );
    } else {
      return this.http.post<Activo>(this.apiUrl, activo, { headers }).pipe(
        catchError(this.handleError)
      );
    }
  }

  // Eliminar un activo
  eliminarActivo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
