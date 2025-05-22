import { Espacio } from "./Espacio";
import { TipoActivo } from "./TipoActivo";

export interface Activo {
    idactivo?: number;
    nombre: string;
    url: string;
    serial: string;
    estado: string; // Activo, Inactivo, En Mantenimiento ?
    observaciones: string;
    espacio: Espacio;
    tipoActivo: TipoActivo;
}