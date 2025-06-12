import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PasswordResetService {
    private apiUrl = 'http://localhost:8080/password-reset'; // Replace with your API endpoint

    constructor(private http: HttpClient) { }

    sendResetCode(email: string): Observable<any> {
        const body = { email };

        return this.http.post(`${this.apiUrl}/forgot-password`, body).pipe(
            catchError((error: HttpErrorResponse) => {
                // Puedes hacer logging aquí si quieres
                return throwError(() => error); // Propaga el error real al componente
            })
        );
    }


    verifyCode(email: string, code: string): Observable<any> {
        const body = { email, code };

        return this.http.post(`${this.apiUrl}/verify-code`, body, { responseType: 'text' }).pipe(
            catchError((error: HttpErrorResponse) => {
                // Puedes hacer logging aquí si quieres
                return throwError(() => error); // Propaga el error real al componente
            })
        );
    }

    resetPassword(email: string, code: string, newPassword: string): Observable<any> {
        const body = { email, code, newPassword };

        return this.http.post(`${this.apiUrl}/reset-password`, body, { responseType: 'text' }).pipe(
            catchError((error: HttpErrorResponse) => {
                // Puedes hacer logging aquí si quieres
                return throwError(() => error); // Propaga el error real al componente
            })
        );
    }
}