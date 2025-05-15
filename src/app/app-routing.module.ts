import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './public/login/login.component';
import { AuthGuard } from './auth.guard';
import { RegisterComponent } from './admin/register/register.component';
import { HomeComponent } from './admin/home/home.component';

const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {path: 'gestion-usuarios', loadComponent: () => import('./admin/gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent)},];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {loginComponent: any; };

