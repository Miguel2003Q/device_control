import { Espacio } from "./espacio.model";
import { User } from "./user";

export interface SolicitudEspacio {
  idmov?: number; 
  espacio: Espacio; 
  fechaSolicitud: string;
  fechaPres: string; //ISO 8601 string //Formato fecha-hora
  fechaDevol: string;
  usuario: User;
  motivo: string; //No esta en el backend, pero se puede agregar para mayor claridad
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Cancelado' | 'Completado';
}

// {
//         id: 1,
//         tipo: 'ambiente',
//         ambiente: 'Aula 101',
//         estado: 'Aprobado',
//         fechaSolicitud: new Date('2025-05-20T10:00:00'),
//         fechaInicio: new Date('2025-06-01T09:00:00'),
//         fechaFin: new Date('2025-06-01T12:00:00'),
//         horaInicio: '09:00',
//         horaFin: '12:00',
//         motivo: 'Clase de Matemáticas',
//         numAsistentes: 30,
//         ubicacion: 'Edificio A',
//         fechaActualizacion: new Date('2025-05-21T15:00:00'),
//         responsable: 'Admin Juan',
//         historialEstados: [
//           { estado: 'Pendiente', fecha: new Date('2025-05-20T10:00:00'), usuario: 'Usuario' },
//           { estado: 'Aprobado', fecha: new Date('2025-05-21T15:00:00'), usuario: 'Admin Juan' }
//         ]
//       },