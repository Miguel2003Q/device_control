
// notification-sound.service.ts - Servicio para sonidos de notificación
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationSoundService {
  private audio: HTMLAudioElement | null = null;
  private enabled: boolean = true;

  constructor() {
    this.loadSettings();
  }

  /**
   * Reproduce el sonido de notificación
   */
  playNotificationSound(): void {
    if (!this.enabled) {
        console.log('Sonido de notificación deshabilitado');
        return};

    try {
      if (!this.audio) {
        this.audio = new Audio('/assets/sounds/notification.mp3');
        this.audio.volume = 0.3;
        console.log('Sonido de notificación cargado');
      }
      
      this.audio.currentTime = 0;
      this.audio.play().catch(err => {
        console.log('No se pudo reproducir el sonido:', err);
      });
    } catch (error) {
      console.error('Error al reproducir sonido:', error);
    }
  }

  /**
   * Habilita o deshabilita los sonidos
   */
  toggleSound(): void {
    this.enabled = !this.enabled;
    this.saveSettings();
  }

  /**
   * Obtiene el estado actual
   */
  isSoundEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Carga la configuración del localStorage
   */
  private loadSettings(): void {
    const saved = localStorage.getItem('notificationSound');
    if (saved !== null) {
      this.enabled = JSON.parse(saved);
    }
  }

  /**
   * Guarda la configuración en localStorage
   */
  private saveSettings(): void {
    localStorage.setItem('notificationSound', JSON.stringify(this.enabled));
    console.log('Configuración de sonido guardada:', this.enabled);
  }
}
