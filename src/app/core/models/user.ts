export interface User { //Este modelo se usa para representar al usuario autenticado en la aplicación.
    nombre: string;
    email?: string;
    rol: string;
    telefono: number;
}