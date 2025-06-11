// notificacion.model.ts
export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
  fechaCreacion: string;
  fechaLectura?: string;
  leida: boolean;
  solicitudId?: number;
  urlRedireccion?: string;
  icono?: string;
  color?: string;
}

export enum TipoNotificacion {
  SOLICITUD_CREADA = 'SOLICITUD_CREADA',
  SOLICITUD_APROBADA = 'SOLICITUD_APROBADA',
  SOLICITUD_RECHAZADA = 'SOLICITUD_RECHAZADA',
  SOLICITUD_CANCELADA = 'SOLICITUD_CANCELADA',
  SOLICITUD_PROXIMA = 'SOLICITUD_PROXIMA',
  INFORMACION = 'INFORMACION',
  ALERTA = 'ALERTA',
  SISTEMA = 'SISTEMA'
}

export interface NotificacionResponse {
  content: Notificacion[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}