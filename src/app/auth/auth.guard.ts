import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true') {
      return true;
    }

    // Redirect to login page
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OperatorGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // First check if user is authenticated
    if (typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') !== 'true') {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if user is an operator and block access
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        const isOperator = currentUser?.perfil?.nombre?.toLowerCase() === 'operador';

        if (isOperator) {
          // Redirect operator users to their default page
          this.router.navigate(['/dashboard/usuario']);
          return false;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.router.navigate(['/login']);
        return false;
      }
    }

    return true;
  }
}

// Export for use in routes
export const authGuard = AuthGuard;
export const operatorGuard = OperatorGuard;
