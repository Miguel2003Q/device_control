import { Routes } from '@angular/router';
import { LoginComponent } from './public/login/login.component';
import { RegisterComponent } from './admin/register/register.component';
import { LandingPageComponent } from './public/landing-page/landing-page.component';

export const routes: Routes = [ //Lazy Loading lo que significa que los componentes se cargarán solo cuando el usuario navegue hacia esa ruta específica.
    {
        path: '', redirectTo: '/landing-page', pathMatch: 'full'
    },
    {
        path: 'landing-page', component: LandingPageComponent
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'register', component: RegisterComponent
    },
    //Admin Routes
    {
        path: 'home',
        loadComponent: () => import('./admin/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'gestion-usuarios',
        loadComponent: () => import('./admin/gestion-usuarios/usuarios-tabla/usuarios-tabla.component').then(m => m.UsuariosTablaComponent)
    },
    {
        path: 'gestion-activos',
        loadComponent: () => import('./admin/gestion-activos/gestion-activos.component').then(m => m.ActivosComponent)
    },
    {
        path: 'gestion-ambientes',
        loadComponent: () => import('./admin/gestion-ambientes/gestion-ambientes.component').then(m => m.GestionAmbientesComponent)
    },
    {
        path: 'estadisticas',
        loadComponent: () => import('./admin/estadisticas/estadisticas.component').then(m => m.EstadisticasComponent)   
    },
    {
        path: 'gestion-usuarios/usuarios-tabla',
        loadComponent: () => import('./admin/gestion-usuarios/usuarios-tabla/usuarios-tabla.component').then(m => m.UsuariosTablaComponent)
    },
    {
        path: 'gestion-usuarios/roles-tabla',
        loadComponent: () => import('./admin/gestion-usuarios/roles-tabla/gestion-usuarios.component').then(m => m.RolesTablaComponent)
    },
    {
        path: 'perfil',
        loadComponent: () => import('./admin/perfil/perfil.component').then(m => m.PerfilComponent)
    },
    {
        path: 'stats/espaciosStats',
        loadComponent: () => import('./admin/stats/estadisticas-espacio/estadisticas-espacio.component').then(m => m.EstadisticasEspacioComponent)
    },
    //Instructor Routes
    {
        path: 'ins/solicitudes', //Esta ruta es de ejemplo
        loadComponent: () => import('./instructor/solicitud-ambiente/solicitud-ambiente.component').then(m => m.SolicitudAmbienteComponent)
    },
    {
        path: 'ins/home',
        loadComponent: () => import('./instructor/home/home.component').then(m => m.HomeInstructorComponent)
    },
    {
        path: 'ins/profile',
        loadComponent: () => import('./instructor/profile/profile.component').then(m => m.ProfileComponent)
    },
    {
        path: 'ins/solicitar-ambiente',
        loadComponent: () => import('./instructor/solicitar-espacio/solicitar-espacio.component').then(m => m.SolicitarEspacioComponent)
    },
    {
        path: 'ins/historial-solicitudes',
        loadComponent: () => import('./instructor/historial-solicitudes/historial-solicitudes.component').then(m => m.HistorialSolicitudesComponent)
    },
    //Vigilante Routes
    {
        path: 'vig/home',
        loadComponent: () => import('./vigilante/home/home.component').then(m => m.HomeVigilanteComponent)
    },
    {
        path: 'vig/perfil',
        loadComponent: () => import('./vigilante/perfil/perfil.component').then(m => m.PerfilVigilanteComponent)
    },
    {
        path: 'vig/solicitudes-espacios',
        loadComponent: () => import('./vigilante/solicitudes-espacios/solicitudes-espacios.component').then(m => m.SolicitudesEspaciosComponent)
    }
];

