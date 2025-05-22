import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Example: Add an Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer YOUR_TOKEN_HERE`
      }
    });
    return next.handle(authReq);
  }
}