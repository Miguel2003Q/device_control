export interface Ambiente {
  id?: number;
  nombre: string;
  estado: 'Disponible' | 'Ocupado' | 'Mantenimiento';
  capacidad: number;
  ubicacion: string;
  proyector?: boolean;
  computadoras?: boolean;
  wifi?: boolean;
  reservadoPor?: string;
  periodoDeUso?: string;
}
