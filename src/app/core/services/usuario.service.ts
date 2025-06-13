import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';

interface UsuarioRolUpdate {
  id: number;
  rol: number;
}

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

  // Obtener un usuario por su ID
  obtenerUsuarioPorId(id: number): Observable<Usuario> {
    const url = `${this.apiUrl}/getById/${id}`;
    return this.http.get<Usuario>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  obtenerUsuarioPorEmail(email: string): Observable<Usuario> {
    const url = `${this.apiUrl}/email/${email}`;
    return this.http.get<Usuario>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  actualizarRol(id: number, datos: { id: number; rol: number }): Observable<void> {
    const url = `${this.apiUrl}/rolUpdate/${id}`;
    return this.http.put<void>(
      url,
      datos, // el objeto completo
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }



  eliminarUsuario(id: number | undefined): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
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
