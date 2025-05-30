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
        loadComponent: () => import('./perfil/perfil.component').then(m => m.PerfilComponent)
    },
    {
        path: 'solicitudes',
        loadComponent: () => import('./instructor/solicitud-ambiente/solicitud-ambiente.component').then(m => m.SolicitudAmbienteComponent)
    },
    {
        path: 'stats/espaciosStats',
        loadComponent: () => import('./admin/stats/estadisticas-espacio/estadisticas-espacio.component').then(m => m.EstadisticasEspacioComponent)
    }
];

