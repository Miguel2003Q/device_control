import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> { //Se ejecuta cada vez que se hace una petición HTTP
    const token = localStorage.getItem('token'); // O donde tengas guardado el token

    if (token) {
      // Clona la petición para añadir el header
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    // Si no hay token, deja pasar la petición tal cual
    return next.handle(req);
  }
}
