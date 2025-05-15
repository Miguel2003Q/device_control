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
import { GestionUsuariosComponent } from './app/gestion-usuarios/gestion-usuarios.component';
import { provideAnimations } from '@angular/platform-browser/animations';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'gestion-usuarios', component: GestionUsuariosComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login', pathMatch: 'full' } // Redirige cualquier ruta desconocida a /login
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(FormsModule),
    provideAnimations()
  ]
}).catch(err => console.error(err));