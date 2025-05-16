import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/public/login/login.component';
import { RegisterComponent } from './app/admin/register/register.component';
import { HomeComponent } from './app/admin/home/home.component';
import { Routes } from '@angular/router';
import { GestionUsuariosComponent } from './app/admin/gestion-usuarios/gestion-usuarios.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { GestionActivosComponent } from './app/admin/gestion-activos/gestion-activos.component';
import { GestionAmbientesComponent } from './app/admin/gestion-ambientes/gestion-ambientes.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'gestion-usuarios', component: GestionUsuariosComponent },
  { path: 'gestion-ambientes', component: GestionAmbientesComponent},
  { path: 'gestion-activos', component: GestionActivosComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/login', pathMatch: 'full' },


];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(FormsModule),
    provideAnimations()
  ]
}).catch(err => console.error(err));