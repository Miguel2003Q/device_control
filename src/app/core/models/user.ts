export interface User { //Este modelo se usa para representar al usuario autenticado en la aplicación.
    idusuario: number;
    nombre: string;
    email?: string;
    rol: string;
    telefono: number;
}