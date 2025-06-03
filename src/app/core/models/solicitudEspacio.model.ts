import { Espacio } from "./espacio.model";
import { User } from "./user";

export interface SolicitudEspacio {
  id?: number;
  espacio: Espacio;
  fechaPrestamo: Date;
  fechaDevolucion: Date;
  solicitante: User;
  motivo: string; //No esta en el backend, pero se puede agregar para mayor claridad
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'En Proceso';
}