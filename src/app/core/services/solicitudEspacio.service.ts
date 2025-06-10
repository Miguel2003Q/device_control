import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { SolicitudEspacio } from '../models/solicitudEspacio.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SolicitudEspacioService {
  private apiUrl = 'http://localhost:8080/movespacios';
  private solicitudParaDuplicar = new BehaviorSubject<SolicitudEspacio | null>(null);

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Obtiene todas las solicitudes del usuario actual
   */
  getMisSolicitudes(): Observable<SolicitudEspacio[]> {
    return this.http.get<SolicitudEspacio[]>(`${this.apiUrl}/buscarPorUsuario/${this.auth.getCurrentUser()?.idusuario}`);
  }

  /**
   * Obtiene una solicitud específica por ID
   */
  getSolicitudById(id: number): Observable<SolicitudEspacio> {
    return this.http.get<SolicitudEspacio>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva solicitud de espacio
   */
  crearSolicitud(solicitud: Partial<SolicitudEspacio>): Observable<SolicitudEspacio> {
    return this.http.post<SolicitudEspacio>(this.apiUrl, solicitud);
  }

  /**
   * Actualiza el estado de una solicitud
   */
  actualizarEstado(id: number, estado: string): Observable<SolicitudEspacio> {
    return this.http.patch<SolicitudEspacio>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  /**
   * Cancela una solicitud pendiente
   */
  cancelarSolicitud(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/cancelar/${id}`, {});
  }

  /**
   * Descarga el comprobante PDF de una solicitud aprobada
   */
  descargarComprobante(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/comprobante`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf'
      })
    });
  }

  /**
   * Exporta el historial de solicitudes a Excel
   */
  exportarHistorial(solicitudes?: SolicitudEspacio[]): Observable<Blob> {
    const body = solicitudes ? { solicitudes } : {};
    
    return this.http.post(`http://localhost:8080/api/movEspacios/exportar`, body, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    });
  }

  /**
   * Busca solicitudes con filtros
   */
  buscarSolicitudes(filtros: {
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    espacio?: string;
  }): Observable<SolicitudEspacio[]> {
    let params: any = {};
    
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
    if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
    if (filtros.espacio) params.espacio = filtros.espacio;

    return this.http.get<SolicitudEspacio[]>(`${this.apiUrl}/buscar`, { params });
  }

  /**
   * Verifica disponibilidad de un espacio en un rango de fechas
   */
  verificarDisponibilidad(espacioId: number, fechaInicio: string, fechaFin: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verificar-disponibilidad`, {
      params: {
        espacioId: espacioId.toString(),
        fechaInicio,
        fechaFin
      }
    });
  }

  /**
   * Obtiene las solicitudes pendientes de aprobación (para administradores)
   */
  getSolicitudesPendientes(): Observable<SolicitudEspacio[]> {
    return this.http.get<SolicitudEspacio[]>(`${this.apiUrl}/pendientes`);
  }

  /**
   * Aprueba una solicitud (para administradores)
   */
  aprobarSolicitud(id: number, observaciones?: string): Observable<SolicitudEspacio> {
    return this.http.put<SolicitudEspacio>(`${this.apiUrl}/${id}/aprobar`, { observaciones });
  }

  /**
   * Rechaza una solicitud (para administradores)
   */
  rechazarSolicitud(id: number, motivo: string): Observable<SolicitudEspacio> {
    return this.http.put<SolicitudEspacio>(`${this.apiUrl}/${id}/rechazar`, { motivo });
  }

  /**
   * Marca una solicitud como completada
   */
  completarSolicitud(id: number): Observable<SolicitudEspacio> {
    return this.http.put<SolicitudEspacio>(`${this.apiUrl}/${id}/completar`, {});
  }

  /**
   * Obtiene estadísticas generales de solicitudes
   */
  getEstadisticas(): Observable<{
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
    completadas: number;
    canceladas: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas`);
  }

  /**
   * Guarda temporalmente una solicitud para duplicar
   */
  setSolicitudParaDuplicar(solicitud: SolicitudEspacio): void {
    this.solicitudParaDuplicar.next(solicitud);
  }

  /**
   * Obtiene la solicitud guardada para duplicar
   */
  getSolicitudParaDuplicar(): Observable<SolicitudEspacio | null> {
    return this.solicitudParaDuplicar.asObservable();
  }

  /**
   * Limpia la solicitud guardada para duplicar
   */
  clearSolicitudParaDuplicar(): void {
    this.solicitudParaDuplicar.next(null);
  }
}