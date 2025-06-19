import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Espacio } from '../models/espacio.model'; // Asegúrate de que la ruta sea correcta
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspacioService {

  private apiUrl = `${environment.apiUrl}/espacios`;

  private activosCache: Espacio[] | null = null; // Caché para espacios activos

  constructor(private http: HttpClient) {}

  // Método privado para obtener los encabezados con el token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Ajusta 'token' según tu clave
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Obtener todos los espacios
  obtenerTodosLosEspacios(): Observable<Espacio[]> {
    if (this.activosCache) {
      return of(this.activosCache);
    }
    return this.http.get<Espacio[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap((data: Espacio[]) => this.activosCache = data),
      catchError(this.handleError)
    );
  }

  // Obtener un espacio por ID
  obtenerEspacioPorId(id: number): Observable<Espacio> {
    return this.http.get<Espacio>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Buscar espacios por nombre
  buscarEspaciosPorNombre(nombre: string): Observable<Espacio[]> {
    return this.http.get<Espacio[]>(`${this.apiUrl}/buscarPorNombre?nombre=${encodeURIComponent(nombre)}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Contar espacios
  contarEspacios(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/contar`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Crear un nuevo espacio
  crearEspacio(espacio: Espacio): Observable<Espacio> {
    // Validar que no se proporcione un idespacio
    if (espacio.idespacio) {
      return throwError(() => new Error('No se debe proporcionar un idespacio para crear un nuevo espacio'));
    }

    // Validar que el nombre no esté vacío
    if (!espacio.nombre || espacio.nombre.trim() === '') {
      return throwError(() => new Error('El nombre del espacio es obligatorio'));
    }

    return this.http.post<Espacio>(this.apiUrl, espacio, { headers: this.getHeaders() }).pipe(
      tap((nuevoEspacio: Espacio) => {
        // Actualizar el caché
        if (this.activosCache) {
          this.activosCache.push(nuevoEspacio);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Actualizar un espacio existente
  actualizarEspacio(espacio: Espacio): Observable<Espacio> {
    // Validar que se proporcione un idespacio
    if (!espacio.idespacio) {
      return throwError(() => new Error('Se requiere un idespacio para actualizar un espacio'));
    }

    // Validar que el nombre no esté vacío
    if (!espacio.nombre || espacio.nombre.trim() === '') {
      return throwError(() => new Error('El nombre del espacio es obligatorio'));
    }

    return this.http.put<Espacio>(`${this.apiUrl}/${espacio.idespacio}`, espacio, { headers: this.getHeaders() }).pipe(
      tap((espacioActualizado: Espacio) => {
        // Actualizar el caché
        if (this.activosCache) {
          this.activosCache = this.activosCache.map(e =>
            e.idespacio === espacioActualizado.idespacio ? espacioActualizado : e
          );
        }
      }),
      catchError(this.handleError)
    );
  }

  // Eliminar un espacio
  eliminarEspacio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => {
        // Actualizar el caché
        if (this.activosCache) {
          this.activosCache = this.activosCache.filter(e => e.idespacio !== id);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Invalidar el caché manualmente
  invalidarCache(): void {
    this.activosCache = null;
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 400 && error.error) {
        // Manejar errores específicos del backend (como nombre duplicado)
        errorMessage = typeof error.error === 'string' ? error.error : error.error.message || `Error ${error.status}: ${error.message}`;
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}