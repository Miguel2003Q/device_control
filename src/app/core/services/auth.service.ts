import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/usuarios';
  private currentUser: User | null = null;
  private userKey = 'currentUser';
  private tokenKey = 'authToken';

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem(this.userKey);
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  login(loginRequest: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap(user => {
        this.currentUser = user;
        localStorage.setItem(this.userKey, JSON.stringify(user));
      })
    );
  }

  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerRequest);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenKey);
  }

  updateUserProfile(user: { nombre: string; telefono: string; correo: string; rol: string; photoUrl?: string }): Observable<User> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem(this.tokenKey)}` // Asumiendo que el token se almacena
    });

    return this.http.put<User>(`${this.apiUrl}/profile`, user, { headers }).pipe(
      tap(updatedUser => {
        this.currentUser = { ...this.currentUser, ...updatedUser };
        localStorage.setItem(this.userKey, JSON.stringify(this.currentUser));
      })
    );
  }

  uploadProfilePhoto(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem(this.tokenKey)}`
    });

    return this.http.post<string>(`${this.apiUrl}/upload-photo`, formData, { headers }).pipe(
      tap(photoUrl => {
        if (this.currentUser) {
          this.currentUser = { ...this.currentUser, photoUrl };
          localStorage.setItem(this.userKey, JSON.stringify(this.currentUser));
        }
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem(this.tokenKey)}`
    });

    const body = { currentPassword, newPassword };
    return this.http.post(`${this.apiUrl}/change-password`, body, { headers });
  }
}