// notificacion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Notificacion, NotificacionResponse } from '../models/notificacion.model';
import { Client, Message, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';


@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = `http://localhost:8080/notificaciones`;
  private contadorNoLeidas = new BehaviorSubject<number>(0);
  private nuevaNotificacion = new Subject<Notificacion>();
  private stompClient: Client | null = null;

  // Observables públicos
  contadorNoLeidas$ = this.contadorNoLeidas.asObservable();
  nuevaNotificacion$ = this.nuevaNotificacion.asObservable();

  constructor(private http: HttpClient) {
    // Inicializar WebSocket si está disponible
    this.initializeWebSocket();
    // Cargar contador inicial
    this.actualizarContador();
  }

  /**
   * Inicializa la conexión WebSocket para notificaciones en tiempo real
   */
  private initializeWebSocket(): void {
    try {
      const jwt = localStorage.getItem('token');  // Obtener el token JWT del almacenamiento local
      const socket = new SockJS(`http://localhost:8080/ws-notificaciones?token=${jwt}`);  //Conexión con el endpoint stomp del backend
      this.stompClient = Stomp.over(socket);

      this.stompClient.onConnect = (frame) => {
        console.log('Conectado a WebSocket:', frame);

        // Suscribirse a las notificaciones del usuario
        const userEmail = this.getUserEmail(); // Implementar según tu auth
        if (userEmail) {
          this.stompClient?.subscribe(`/user/${userEmail}/notificaciones`, (message: Message) => {  // Suscripción al canal de notificaciones del usuario
            const notificacion: Notificacion = JSON.parse(message.body);
            this.handleNuevaNotificacion(notificacion);
          });
        }
      };

      this.stompClient.onStompError = (frame) => {
        console.error('Error en WebSocket:', frame);
        // Reintentar conexión después de 5 segundos
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.stompClient.activate();
    } catch (error) {
      console.error('Error al inicializar WebSocket:', error);
    }
  }

  /**
   * Maneja una nueva notificación recibida
   */
  private handleNuevaNotificacion(notificacion: Notificacion): void {
    this.nuevaNotificacion.next(notificacion);
    this.contadorNoLeidas.next(this.contadorNoLeidas.value + 1);
    
    // Mostrar notificación del navegador si está permitido
    this.mostrarNotificacionNavegador(notificacion);
  }

  /**
   * Muestra una notificación del navegador
   */
  private mostrarNotificacionNavegador(notificacion: Notificacion): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(notificacion.titulo, {
        body: notificacion.mensaje,
        icon: '/assets/icons/notification-icon.png',
        badge: '/assets/icons/notification-badge.png',
        tag: `notificacion-${notificacion.id}`,
        requireInteraction: false
      });

      notification.onclick = () => {
        window.focus();
        if (notificacion.urlRedireccion) {
          window.location.href = notificacion.urlRedireccion;
        }
        notification.close();
      };

      // Auto-cerrar después de 5 segundos
      setTimeout(() => notification.close(), 5000);
    }
  }

  /**
   * Solicita permisos para notificaciones del navegador
   */
  solicitarPermisoNotificaciones(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  /**
   * Obtiene todas las notificaciones del usuario actual
   */
  obtenerNotificaciones(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.apiUrl);
  }

  /**
   * Obtiene notificaciones paginadas
   */
  obtenerNotificacionesPaginadas(page: number = 0, size: number = 20): Observable<NotificacionResponse> {
    return this.http.get<NotificacionResponse>(`${this.apiUrl}/paginadas`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  /**
   * Obtiene solo las notificaciones no leídas
   */
  obtenerNotificacionesNoLeidas(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/no-leidas`);
  }

  /**
   * Obtiene el contador de notificaciones no leídas
   */
  obtenerContadorNoLeidas(): Observable<number> {
    return this.http.get<{ noLeidas: number }>(`${this.apiUrl}/contador`)
      .pipe(map(response => response.noLeidas));
  }

  /**
   * Actualiza el contador de notificaciones no leídas
   */
  actualizarContador(): void {
    this.obtenerContadorNoLeidas().subscribe({
      next: (count) => this.contadorNoLeidas.next(count),
      error: (error) => console.error('Error al actualizar contador:', error)
    });
  }

  /**
   * Marca una notificación como leída
   */
  marcarComoLeida(id: number): Observable<Notificacion> {
    return this.http.put<Notificacion>(`${this.apiUrl}/${id}/leer`, {})
      .pipe(tap(() => {
        const currentCount = this.contadorNoLeidas.value;
        if (currentCount > 0) {
          this.contadorNoLeidas.next(currentCount - 1);
        }
      }));
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  marcarTodasComoLeidas(): Observable<any> {
    return this.http.put(`${this.apiUrl}/leer-todas`, {})
      .pipe(tap(() => this.contadorNoLeidas.next(0)));
  }

  /**
   * Elimina una notificación
   */
  eliminarNotificacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca notificaciones por texto
   */
  buscarNotificaciones(texto: string): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/buscar`, {
      params: { texto }
    });
  }

  /**
   * Obtiene el email del usuario actual (implementar según tu sistema de auth)
   */
  private getUserEmail(): string | null {
    // Implementar según tu servicio de autenticación
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.email || null;
  }

  /**
   * Desconecta el WebSocket
   */
  disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
    }
  }
}