// notification-settings.component.ts - Componente para configuración
import { Component, HostListener, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationSoundService } from '../../core/services/notification-sound.service';

@Component({
    selector: 'app-notification-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `

<div class="dropdown-wrapper">
<button class="notification-btn" (click)="toggleDropdown($event)">
    <i class="fas fa-cog"></i>
  </button>

    <div class="notification-settings" [class.show]="mostrarDropdown" (click)="$event.stopPropagation()">
      <h3>Configuración de Notificaciones</h3>
      
      <div class="setting-item">
        <label class="switch">
          <input type="checkbox" 
                 [checked]="soundEnabled" 
                 (change)="toggleSound()">
          <span class="slider"></span>
        </label>
        <span class="setting-label">Sonido de notificaciones</span>
      </div>
      
      <div class="setting-item">
        <label class="switch">
          <input type="checkbox" 
                 [checked]="browserNotifications" 
                 (change)="toggleBrowserNotifications()">
          <span class="slider"></span>
        </label>
        <span class="setting-label">Notificaciones del navegador</span>
      </div>
      
      <div class="setting-item">
        <button class="test-btn" (click)="testNotification()">
          <i class="fas fa-bell"></i>
          Probar notificación
        </button>
      </div>
    </div>
    </div>
  `,
    styles: [`
    /* Botón de notificaciones */
    .notification-btn {
    position: relative;
    background: none;
    border: none;
    color: #666666;
    font-size: 20px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    }

    .notification-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #274C77;
    }

    .dropdown-wrapper {
    position: relative; /* permite posicionar el dropdown respecto a este contenedor */
    display: inline-block;
    }

    .notification-settings {
    position: absolute;
    top: 40px; /* espacio debajo del botón */
    right: 0;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    width: 250px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: none;
    z-index: 1000;
    }

    .notification-settings.show {
    display: block;
    }


    h3 {
      margin: 0 0 20px 0;
      color: #274C77;
      font-size: 18px;
    }

    .setting-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .setting-label {
      color: #333333;
      font-size: 14px;
    }

    /* Switch estilo iOS */
    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 28px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 28px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #4CAF50;
    }

    input:checked + .slider:before {
      transform: translateX(22px);
    }

    .test-btn {
      padding: 8px 16px;
      background: #6096BA;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.3s ease;
    }

    .test-btn:hover {
      background: #274C77;
    }
  `]
})
export class NotificationSettingsComponent {


    @Input() dropdownId!: number;
    @Input() openedId!: number | null;
    @Output() toggle = new EventEmitter<number | null>();

    soundEnabled: boolean = true;
    browserNotifications: boolean = false;

    constructor(private soundService: NotificationSoundService, private eRef: ElementRef) {
        this.soundEnabled = this.soundService.isSoundEnabled();
        this.checkBrowserNotificationPermission();
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.toggle.emit(null); // Esto cierra el dropdown desde el padre
        }
    }

    get mostrarDropdown(): boolean {
        return this.openedId === this.dropdownId;
    }

    toggleDropdown(event: Event) {
        event.stopPropagation();
        this.toggle.emit(this.dropdownId);
    }

    toggleSound(): void {
        this.soundService.toggleSound();
        this.soundEnabled = this.soundService.isSoundEnabled();
    }

    toggleBrowserNotifications(): void {
        if (!this.browserNotifications && 'Notification' in window) {
            Notification.requestPermission().then(permission => {
                this.browserNotifications = permission === 'granted';
                this.saveBrowserNotificationSetting();
            });
        } else {
            this.browserNotifications = false;
            this.saveBrowserNotificationSetting();
        }
    }

    testNotification(): void {
        // Probar sonido
        this.soundService.playNotificationSound();

        // Probar notificación del navegador
        if (this.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Notificación de prueba', {
                body: '¡Las notificaciones están funcionando correctamente!',
                icon: '/assets/icons/notification-icon.png'
            });
        }
    }

    private checkBrowserNotificationPermission(): void {
        if ('Notification' in window) {
            this.browserNotifications = Notification.permission === 'granted';
        }
    }

    private saveBrowserNotificationSetting(): void {
        localStorage.setItem('browserNotifications', JSON.stringify(this.browserNotifications));
    }
}
