import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable, tap , } from 'rxjs';
import { LoginRequest } from '../models/login-request';
import { User } from '../models/user';

interface UpdateProfileRequest {
  nombre: string;
  telefono: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/usuarios';
  private currentUser: User | null = null;
  private userkey = 'currentUser';
  private tokenley = 'authToken';

    
  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  login(loginRequest: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap(user => {
        // Almacenar el usuario en localStorage y en la variable currentUser
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

 register(registerRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerRequest);
  }


// Método para actualizar perfil
updateUserProfile(userId: number, profileData: UpdateProfileRequest): Observable<any> {
  return this.http.put(`${this.apiUrl}/perfil/${userId}`, profileData);
}

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  logout(): void {
    // Limpiar el usuario almacenado
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.rol : null;
  }

}