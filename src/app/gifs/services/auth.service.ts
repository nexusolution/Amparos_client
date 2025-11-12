import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'isAuthenticated';
  private readonly USER_KEY = 'currentUser';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.success === true) {
            this.handleSuccessfulLogin(response);
          }
        })
      );
  }

  private handleSuccessfulLogin(response: LoginResponse): void {
    // Store authentication status
    localStorage.setItem(this.TOKEN_KEY, 'true');

    // Store auth token from nested data structure
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
    }

    // Store user data from nested data structure
    if (response.data?.user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
      this.currentUserSubject.next(response.data.user);
    }

    // Update authentication state
    this.isAuthenticatedSubject.next(true);

    // Navigate to dashboard
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('authToken');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.TOKEN_KEY) === 'true';
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  getAuthErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Credenciales incorrectas';
    } else if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifique que el servidor esté ejecutándose.';
    } else if (error.error && error.error.message) {
      return error.error.message;
    } else {
      return 'Error del servidor. Intente nuevamente.';
    }
  }
}
