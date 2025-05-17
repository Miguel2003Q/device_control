// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
<<<<<<< HEAD
import { ActivosComponent } from './app/admin/gestion-activos/gestion-activos.component';
import { GestionAmbientesComponent } from './app/admin/gestion-ambientes/gestion-ambientes.component';
import { EstadisticasComponent } from './app/estadisticas/estadisticas.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'gestion-usuarios', component: GestionUsuariosComponent },
  { path: 'gestion-ambientes', component: GestionAmbientesComponent},
  { path: 'gestion-activos', component: ActivosComponent},
  {path: 'estadisticas', component: EstadisticasComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/login', pathMatch: 'full' },


];
=======

// Importar las rutas desde el archivo app.routes.ts
import { routes } from './app/app.routes';
>>>>>>> d711d64afe27c5732ff567ab696ebcf61fd5b064

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Usamos las rutas importadas
    provideHttpClient(),
    importProvidersFrom(FormsModule),
    provideAnimations()
  ]
}).catch(err => console.error(err));
