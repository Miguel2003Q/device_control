import { Routes } from '@angular/router';
import { LoginComponent } from './public/login/login.component';
import { RegisterComponent } from './admin/register/register.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'home',
        loadComponent: () => import('./admin/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'gestion-usuarios',
        loadComponent: () => import('./admin/gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent)
    },
    {
        path: 'gestion-activos',
        loadComponent: () => import('./admin/gestion-activos/gestion-activos.component').then(m => m.GestionActivosComponent)
    },
    {
        path: 'gestion-ambientes',
        loadComponent: () => import('./admin/gestion-ambientes/gestion-ambientes.component').then(m => m.GestionAmbientesComponent)
    }
];

