import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './public/login/login.component';
import { AuthGuard } from './auth.guard';
import { RegisterComponent } from './admin/register/register.component';
import { HomeComponent } from './admin/home/home.component';
import { LoadingComponent } from './auxiliar/loading/loading.component';
import { ActivosComponent } from './admin/gestion-activos/gestion-activos.component';
import { GestionAmbientesComponent } from './admin/gestion-ambientes/gestion-ambientes.component';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';
const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {path: 'gestion-usuarios', loadComponent: () => import('./admin/gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent)},
  {path: 'gestion-ambientes', loadComponent: () => import('./admin/gestion-ambientes/gestion-ambientes.component').then(m => m.GestionAmbientesComponent)},
  {path: 'gestion-activos', loadComponent: () => import('./admin/gestion-activos/gestion-activos.component').then(m => m.ActivosComponent)},
  {path: 'estadisticas', loadComponent: () => import('./estadisticas/estadisticas.component').then(m => m.EstadisticasComponent)},
];
  

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {loginComponent: any; };

