// auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number; // fecha en segundos
}

const ignoredEndpoints = ['/usuarios/login', '/password-reset']; // agrega los endpoints que quieras ignorar

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    const url = new URL(req.url);
    const shouldIgnore = ignoredEndpoints.some(endpoint => url.pathname.startsWith(endpoint));


    if (token && !shouldIgnore) {
      const isExpired = this.isTokenExpired(token);
      if (isExpired) {
        this.handleUnauthorized('Tu sesión ha expirado. Inicia sesión nuevamente.');
        return throwError(() => new Error('Token expirado'));
      }

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.handleUnauthorized('No estás autenticado. Inicia sesión.');
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(req); // sin token
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const now = Math.floor(Date.now() / 1000); // en segundos
      return payload.exp < now;
    } catch (e) {
      return true; // si falla al decodificar, asumimos que está vencido
    }
  }

  private handleUnauthorized(message: string): void {
    if (this.router.url === '/login') {
      return; // No mostrar mensaje si ya estás en login
    }

    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });

    this.authService.logout();
    // this.router.navigate(['/login']); //Para producción, descomentar esta línea
  }

}
