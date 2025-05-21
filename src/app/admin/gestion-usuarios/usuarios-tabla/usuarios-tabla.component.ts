import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { TopBarComponent } from "../../shared/top-bar/top-bar.component";
import { RegisterComponent } from "../../register/register.component";

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, RouterModule, SidebarComponent, TopBarComponent, RegisterComponent],
  templateUrl: './usuarios-tabla.component.html',
  styleUrls: ['./usuarios-tabla.component.css']
})
export class UsuariosTablaComponent implements OnInit {
  // Propiedades del componente
  usuarios: Usuario[] = [];
  filteredUsers: Usuario[] = [];
  searchTerm: string = '';
  selectedFilter: string = '';
  sidebarActive: boolean = true;
  screenWidth: number;
  
  // Propiedades para el modal
  showModal: boolean = false;
  isEditing: boolean = false;
  currentUser: Usuario = this.getEmptyUser();
  
  constructor() {
    // Inicializar el ancho de pantalla
    this.screenWidth = window.innerWidth;
    // Ajustar sidebar según tamaño de pantalla
    this.checkScreenSize();
  }

  ngOnInit(): void {
    // Cargar datos
    this.cargarUsuarios();
  }

  // Método para detectar cambios en el tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    this.checkScreenSize();
  }

  // Comprobar tamaño de pantalla y ajustar sidebar
  checkScreenSize(): void {
    if (this.screenWidth < 900) {
      this.sidebarActive = false;
    } else {
      this.sidebarActive = true;
    }
  }

  // Cambiar estado del sidebar
  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  // Cargar lista de usuarios
  cargarUsuarios(): void {
    // Aquí normalmente harías una llamada a un servicio
    // Por ahora, usamos datos de ejemplo
    this.usuarios = [
      {
        id: 1,
        nombre: 'Jorge Mario',
        correo: 'JorgitoLopez@hotmail.com',
        rol: 'Instructor',
        estado: 'Activo'
      },
      {
        id: 2,
        nombre: 'Carlos Lopez',
        correo: 'CarlosLop@hotmail.com',
        rol: 'Vigilante',
        estado: 'Activo'
      },
      {
        id: 3,
        nombre: 'Rodrigo Perez',
        correo: 'PerezRo@hotmail.com',
        rol: 'Administrador',
        estado: 'Inactivo'
      },
      {
        id: 4,
        nombre: 'Jaime Ortiz',
        correo: 'Ortiz02@hotmail.com',
        rol: 'Vigilante',
        estado: 'Activo'
      }
    ];
    
    this.filteredUsers = [...this.usuarios];
  }

  // Filtrar usuarios según términos de búsqueda y filtros
  filterUsers(): void {
    this.filteredUsers = this.usuarios.filter(user => {
      // Aplicar filtro de búsqueda
      const searchMatch = this.searchTerm === '' || 
        user.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.correo.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Aplicar filtro de rol
      const filterMatch = this.selectedFilter === '' || 
        user.rol === this.selectedFilter;
      
      return searchMatch && filterMatch;
    });
  }

  // Abrir modal para crear usuario
  openCreateUserModal(): void {
    this.isEditing = false;
    this.currentUser = this.getEmptyUser();
    this.showModal = true;
  }

  // Abrir modal para editar usuario
  editUser(user: Usuario): void {
    this.isEditing = true;
    // Clonar el usuario para no modificar directamente el original
    this.currentUser = { ...user };
    this.showModal = true;
  }

  // Cerrar modal
  closeModal(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay') || 
        target.classList.contains('close-modal-btn') ||
        target.classList.contains('cancel-btn')) {
      this.showModal = false;
    }
  }

  // Guardar cambios de usuario
  saveUser(): void {
    if (this.isEditing) {
      // Actualizar usuario existente
      this.usuarios = this.usuarios.map(user => 
        user.id === this.currentUser.id ? this.currentUser : user
      );
    } else {
      // Crear nuevo usuario
      const newId = Math.max(...this.usuarios.map(user => user.id), 0) + 1;
      this.usuarios.push({
        ...this.currentUser,
        id: newId
      });
    }
    
    // Actualizar lista filtrada
    this.filterUsers();
    // Cerrar modal
    this.showModal = false;
  }

  // Obtener usuario vacío para el formulario
  getEmptyUser(): Usuario {
    return {
      id: 0,
      nombre: '',
      correo: '',
      rol: '',
      estado: 'Activo'
    };
  }

  // Navegar a vista de roles


  onEstadoChange(event: Event) {
  const input = event.target as HTMLInputElement | null;
  if (input) {
    this.currentUser.estado = input.checked ? 'Activo' : 'Inactivo';
  }
}
}