export interface Ambiente {
  id?: number;
  nombre: string;
  estado: 'Disponible' | 'Ocupado' | 'Mantenimiento';
  capacidad: number;
  ubicacion: string;
  reservadoPor?: string;
  periodoDeUso?: string;
}
