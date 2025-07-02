import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Activo } from '../models/activo.model'; // Asegúrate de tener este modelo creado
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivoService {
  
  private apiUrl = `${environment.apiUrl}/activos`;

  public activosCache: Activo[] | null = null; //Para almacenar en caché los activos (no hacer consultas innecesarias)


  constructor(private http: HttpClient) { }

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
    if (this.activosCache) {
      // Ya tengo los datos en caché, los devuelvo como observable
      return of(this.activosCache);
    } else {
      // No tengo los datos, hago la consulta HTTP y los guardo
      return this.http.get<Activo[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
        tap((data: Activo[]) => this.activosCache = data),
        catchError(this.handleError)
      );
    }
  }

  //Para cuando se crea un nuevo activo
  limpiarCacheActivos(): void {
    this.activosCache = null;
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
      return this.http.post<Activo>(`${this.apiUrl}/${activo.idactivo}`, activo
        // , { headers }).pipe(
        // catchError(this.handleError)
      );
    } else {
      return this.http.post<Activo>(this.apiUrl, activo
        // , { headers }).pipe(  Esto
        // catchError(this.handleError)
      );
    }
  }

  actualizarActivo(id: number, activo: Activo): Observable<Activo> {
    return this.http.put<Activo>(`${this.apiUrl}/actualizar/${id}`, activo
    //   , {
    //   headers: this.getHeaders()
    // }).pipe(    Si se descomenta causa que el error sea undefined
    //   catchError(this.handleError)
    );
  }

  // Eliminar un activo
  eliminarActivo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`, { headers: this.getHeaders() }).pipe(
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
