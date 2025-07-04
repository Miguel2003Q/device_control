import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles: number[] = route.data['roles'];
    const userRoleStr = this.authService.getUserRole(); // ← de localStorage o backend
    const userRole = userRoleStr ? parseInt(userRoleStr, 10) : null;

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!userRole || !expectedRoles.includes(userRole)) {
      this.router.navigate(['/landing-page']); 
      return false; 
    }

    return true;
  }
}
