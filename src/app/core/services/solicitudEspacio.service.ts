import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SolicitudEspacio } from '../models/solicitudEspacio.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudEspacioService {
  private apiUrl = 'http://localhost:8080/movespacios'; // Ajusta según tu backend
  private solicitudesCache: SolicitudEspacio[] | null = null;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  obtenerTodasLasSolicitudes(): Observable<SolicitudEspacio[]> {
    if (this.solicitudesCache) {
      return of(this.solicitudesCache);
    } else {
      return this.http.get<SolicitudEspacio[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
        tap((data: SolicitudEspacio[]) => this.solicitudesCache = data),
        catchError(this.handleError)
      );
    }
  }

  limpiarCache(): void {
    this.solicitudesCache = null;
  }

  obtenerSolicitudPorId(id: number): Observable<SolicitudEspacio> {
    return this.http.get<SolicitudEspacio>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  guardarSolicitud(solicitud: SolicitudEspacio): Observable<SolicitudEspacio> {
    return this.http.post<SolicitudEspacio>(this.apiUrl, solicitud, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  actualizarSolicitud(id: number, solicitud: SolicitudEspacio): Observable<SolicitudEspacio> {
    return this.http.put<SolicitudEspacio>(`${this.apiUrl}/actualizar/${id}`, solicitud, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  eliminarSolicitud(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  buscarPorEstado(estado: string): Observable<SolicitudEspacio[]> {
    return this.http.get<SolicitudEspacio[]>(`${this.apiUrl}/buscarPorEstado?estado=${encodeURIComponent(estado)}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  contarSolicitudes(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/contar`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor ${error.status}: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
