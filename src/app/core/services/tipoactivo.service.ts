import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TipoActivo } from '../models/TipoActivo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoActivoService {

  private apiUrl = `${environment.apiUrl}/tipoactivos`;

  private tipoActivoCache: TipoActivo[] | null = null;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Obtener todos los tipos de activos
  obtenerTodosLosTiposActivos(): Observable<TipoActivo[]> {
    if (this.tipoActivoCache) {
      return of(this.tipoActivoCache);
    } else {
      return this.http.get<TipoActivo[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
        tap((data: TipoActivo[]) => this.tipoActivoCache = data),
        catchError(this.handleError)
      );
    }
  }

  // Obtener tipo de activo por ID
  obtenerTipoActivoPorId(id: number): Observable<TipoActivo> {
    return this.http.get<TipoActivo>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Buscar por nombre
  buscarTipoActivoPorNombre(nombre: string): Observable<TipoActivo[]> {
    return this.http.get<TipoActivo[]>(`${this.apiUrl}/buscarPorNombre?nombre=${encodeURIComponent(nombre)}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Guardar o actualizar tipo activo
  guardarTipoActivo(tipoActivo: TipoActivo): Observable<TipoActivo> {
    const headers = this.getHeaders();
    // if (tipoActivo.idtipoact) {
    //   return this.http.put<TipoActivo>(`${this.apiUrl}/${tipoActivo.idtipoact}`, tipoActivo, { headers }).pipe(
    //     catchError(this.handleError)
    //   );
    // } else {
      return this.http.post<TipoActivo>(this.apiUrl, tipoActivo, { headers }).pipe(
        catchError(this.handleError)
      );
    // }
  }

  // Eliminar tipo activo
  eliminarTipoActivo(id: number): Observable<void> {
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
