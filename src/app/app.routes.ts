import { Routes } from '@angular/router';
import { LoginComponent } from './public/login/login.component';
import { LandingPageComponent } from './public/landing-page/landing-page.component';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // 🌐 Rutas públicas
  { path: '', redirectTo: '/landing-page', pathMatch: 'full' },
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },

  // 🔐 Rutas de ADMIN (rol: '4')
  {
    path: 'home',
    loadComponent: () => import('./admin/home/home.component').then(m => m.HomeComponent),
    canActivate: [RoleGuard],
    data: { roles: [4] }
  },
  {
    path: 'gestion-usuarios',
    loadComponent: () => import('./admin/gestion-usuarios/usuarios-tabla/usuarios-tabla.component').then(m => m.UsuariosTablaComponent),
    canActivate: [RoleGuard],
    data: { roles: [4] }
  },
  {
    path: 'gestion-usuarios/usuarios-tabla',
    loadComponent: () => import('./admin/gestion-usuarios/usuarios-tabla/usuarios-tabla.component').then(m => m.UsuariosTablaComponent),
  },
  {
    path: 'gestion-usuarios/roles-tabla',
    loadComponent: () => import('./admin/gestion-usuarios/roles-tabla/gestion-usuarios.component').then(m => m.RolesTablaComponent),
    canActivate: [RoleGuard],
    data: { roles: [4] }
  },
  {
    path: 'gestion-activos',
    loadComponent: () => import('./admin/activos/gestion-activos/gestion-activos.component').then(m => m.GestionActivosComponent),
    canActivate: [RoleGuard],
    data: { roles: [4] }
  },
  {
    path: 'gestion-ambientes',
    loadComponent: () => import('./admin/gestion-ambientes/gestion-ambientes.component').then(m => m.GestionAmbientesComponent),
    canActivate: [RoleGuard],
    data: { roles: [4] }
  },
  {
    path: 'estadisticas-activos',
    loadComponent: () =>
      import('./admin/estadisticas-activos/estadisticas-activos.component')
        .then(m => m.EstadisticasActivosComponent),
    canActivate: [RoleGuard],
    data: { roles: [4] }
  },
  

  {
    path: 'perfil',
    loadComponent: () => import('./admin/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [RoleGuard],
    data: { roles: [4] }
  },
  {
    path: 'stats/espaciosStats',
    loadComponent: () => import('./admin/stats/estadisticas-espacio/estadisticas-espacio.component').then(m => m.EstadisticasEspacioComponent),
    canActivate: [RoleGuard],
    data: { roles: [4] }
  },

  // 🎓 Rutas de INSTRUCTOR (rol: '2')
  {
    path: 'ins/home',
    loadComponent: () => import('./instructor/home/home.component').then(m => m.InstructorHomeComponent),
    canActivate: [RoleGuard],
    data: { roles: [2] }
  },
  {
    path: 'ins/profile',
    loadComponent: () => import('./instructor/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [RoleGuard],
    data: { roles: [2] }
  },
  {
    path: 'ins/solicitar-ambiente',
    loadComponent: () => import('./instructor/solicitar-espacio/solicitar-espacio.component').then(m => m.SolicitarEspacioComponent),
    canActivate: [RoleGuard],
    data: { roles: [2] }
  },
  {
    path: 'ins/historial-solicitudes',
    loadComponent: () => import('./instructor/historial-solicitudes/historial-solicitudes.component').then(m => m.HistorialSolicitudesComponent),
    canActivate: [RoleGuard],
    data: { roles: [2] }
  },

  // 🛡️ Rutas de VIGILANTE (rol: '3')
  {
    path: 'vig/home',
    loadComponent: () => import('./vigilante/home/home.component').then(m => m.HomeComponent),
    canActivate: [RoleGuard],
    data: { roles: [1] }
  },
  {
    path: 'vig/perfil',
    loadComponent: () => import('./vigilante/perfil/perfil.component').then(m => m.PerfilVigilanteComponent),
    canActivate: [RoleGuard],
    data: { roles: [1] }
  },
  {
    path: 'vig/solicitudes-espacios',
    loadComponent: () => import('./vigilante/solicitudes-espacios/solicitudes-espacios.component').then(m => m.SolicitudesEspaciosComponent),
    canActivate: [RoleGuard],
    data: { roles: [1] }
  },
  {
    path: 'almac/home',
    loadComponent: () => import('./almacen/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'almac/perfil',
    loadComponent: () => import('./almacen/perfil/perfil.component').then(m => m.PerfilComponent),
  },
  {
    path: 'almac/activos',
    loadComponent: () => import('./almacen/activos/gestion-activos/gestion-activos.component').then(m => m.GestionActivosComponent),
  },
  // Rutas auxiliares
  {
    path: 'password-reset',
    loadComponent: () => import('./auxiliar/password-reset/password-reset.component').then(m => m.PasswordResetComponent)
  }
];  