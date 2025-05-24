import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/usuarios'; // Ajusta la URL si tu endpoint cambia
  private cacheUsuarios: Usuario[] | null = null;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Obtener todos los usuarios
  obtenerTodosLosUsuarios(): Observable<Usuario[]> {
    if (this.cacheUsuarios) {
      return of(this.cacheUsuarios);
    } else {
      return this.http.get<Usuario[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
        tap((usuarios) => this.cacheUsuarios = usuarios),
        catchError(this.handleError)
      );
    }
  }

  // Manejo de errores
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
