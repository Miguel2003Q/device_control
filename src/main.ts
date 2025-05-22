// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app/app.routes';

// ✅ Importa el interceptor
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import * as authInterceptor from './app/core/services/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // 👈 Activa interceptores desde DI
    importProvidersFrom(FormsModule),
    provideAnimations(),

    // ✅ Registro del interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: authInterceptor.AuthInterceptor,
      multi: true
    }
  ]
}).catch(err => console.error(err));
