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
        // Mock API call - replace with actual API
        return of({ success: true }).pipe(
            catchError(() => {
                throw new Error('Invalid or expired code.');
            })
        );
    }

    resetPassword(email: string, password: string): Observable<any> {
        // Mock API call - replace with actual API
        return of({ success: true }).pipe(
            catchError(() => {
                throw new Error('Failed to reset password.');
            })
        );
    }
}