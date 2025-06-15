import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { TopBarComponent } from "../../shared/top-bar/top-bar.component";
import { RegisterComponent } from '../register/register.component';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, TopBarComponent, RegisterComponent],
  templateUrl: './usuarios-tabla.component.html',
  styleUrls: ['./usuarios-tabla.component.css']
})
export class UsuariosTablaComponent implements OnInit {

  getEmptyUser(): Usuario {
    return {
      idusuario: 0,
      nombre: '',
      email: '',
      rol: 0,
      clave: '',
      telefono: '',
    };
  }

  // Propiedades del componente
  usuarios: Usuario[] = [];
  filteredUsers: Usuario[] = [];
  searchTerm: string = '';
  selectedFilter: string = '';
  sidebarActive: boolean = false;
  screenWidth: number;

  // Propiedades para el modal de crear/editar
  showModal: boolean = false;
  isEditing: boolean = false;
  currentUser: Usuario = this.getEmptyUser();

  // Propiedades para el modal de detalles
  showDetailsModal: boolean = false;
  selectedUser: Usuario = this.getEmptyUser();
  newRole: number = 0;

  constructor(
    private usuarioService: UsuarioService,
    private loadingService: LoadingService,
    private toastr: ToastrService
  ) {
    this.screenWidth = window.innerWidth;
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    if (this.screenWidth < 900) {
      this.sidebarActive = false;
    } else {
      this.sidebarActive = true;
    }
  }

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  cargarUsuarios(): void {
    this.loadingService.show();
    this.usuarioService.obtenerTodosLosUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.filteredUsers = [...this.usuarios];
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Error al obtener usuarios', err)
        this.loadingService.hide();
      }
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.usuarios.filter(user => {
      const searchMatch = this.searchTerm === '' ||
        user.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const filterMatch = this.selectedFilter === '' ||
        String(user.rol) === this.selectedFilter;

      return searchMatch && filterMatch;
    });
  }

  // Métodos para modal de crear/editar
  openCreateUserModal(): void {
    this.isEditing = false;
    this.currentUser = this.getEmptyUser();
    this.showModal = true;
  }

  editUser(user: Usuario): void {
    this.isEditing = true;
    this.currentUser = { ...user };
    this.showModal = true;
  }

  closeModal(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay') ||
      target.classList.contains('close-modal-btn') ||
      target.classList.contains('cancel-btn')) {
      this.showModal = false;
    }
  }

  // Métodos para modal de detalles
  openDetailsModal(user: Usuario): void {
    this.selectedUser = { ...user };
    this.newRole = user.rol;
    this.showDetailsModal = true;
  }

  closeDetailsModal(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }
    this.showDetailsModal = false;
    this.selectedUser = this.getEmptyUser();
    this.newRole = 0;
  }

  // Cambiar rol del usuario
  updateUserRole(): void {
    this.loadingService.show();
    if (this.newRole === this.selectedUser.rol) {
      alert('El rol seleccionado es el mismo que el actual');
      this.loadingService.hide();
      return;
    }

    if (this.selectedUser?.idusuario != null) {
      const datosActualizacion = {
        id: this.selectedUser.idusuario,
        rol: this.newRole
      };

      this.usuarioService.actualizarRol(this.selectedUser.idusuario, datosActualizacion).subscribe({
        next: () => {
          this.usuarios = this.usuarios.map(user =>
            user.idusuario === this.selectedUser.idusuario
              ? { ...user, rol: this.newRole }
              : user
          );
          this.filterUsers();
          this.closeDetailsModal();
          this.toastr.success('Rol actualizado correctamente', 'Éxito');
          this.loadingService.hide();
        },
        error: (err) => {
          console.error('Error al actualizar rol', err);
          this.toastr.error('Error al actualizar el rol del usuario', 'Error');
          this.loadingService.hide();
        }
      });
    } else {
      console.error('ID de usuario inválido');
      this.loadingService.hide();
    }
  }


  // Eliminar usuario
  deleteUser(): void {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${this.selectedUser.nombre}?`)) {
      this.loadingService.show();
      // Aquí puedes agregar la lógica para eliminar el usuario del backend
      this.usuarioService.eliminarUsuario(this.selectedUser.idusuario).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(user => user.idusuario !== this.selectedUser.idusuario);
          this.filterUsers();
          this.closeDetailsModal();
          this.toastr.success('Usuario eliminado correctamente', 'Éxito');
          this.loadingService.hide();
        },
        error: (err) => {
          console.error('Error al eliminar usuario', err);
          this.toastr.error('Error al eliminar el usuario', 'Error');
        }
      });

      // // Simulación temporal (remover cuando implementes el servicio)
      // this.usuarios = this.usuarios.filter(user => user.idusuario !== this.selectedUser.idusuario);
      // this.filterUsers();
      // this.closeDetailsModal();
      // alert('Usuario eliminado correctamente');
    }
  }

  saveUser(): void {
    if (this.isEditing) {
      this.usuarios = this.usuarios.map(user =>
        user.idusuario === this.currentUser.idusuario ? this.currentUser : user
      );
    } else {
      const newId = Math.max(...this.usuarios.map(user => user.idusuario ?? 0), 0) + 1;
      this.usuarios.push({
        ...this.currentUser,
        idusuario: newId
      });
    }

    this.filterUsers();
    this.showModal = false;
  }

  rolNombreMap: Record<number, string> = {
    4: 'Administrador',
    3: 'Almacén',
    2: 'Instructor',
    1: 'Vigilante'
  };

  toggleSidebarEmit(): void {
    this.sidebarActive = !this.sidebarActive;
  }
}