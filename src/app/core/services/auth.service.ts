import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../models/auth.model';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/api/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((response) => {
        if (response.success && response.payload.token) {
          this.setToken(response.payload.token);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.baseUrl}/register`,
      request
    );
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isAuthenticatedSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private checkToken(): void {
    const token = this.isValidToken();
    this.isAuthenticatedSubject.next(token);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  isValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);

    if (!token) return false;

    const decodedToken: JwtPayload = jwtDecode(token);
    const isExpired = decodedToken.exp && decodedToken.exp < Date.now() / 1000;
    return !isExpired;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);

      // Handle role as array or string
      if (Array.isArray(decodedToken.role)) {
        return decodedToken.role[0] || null;
      }

      return decodedToken.role || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.userId || null;
    } catch {
      return null;
    }
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.sub || null; // 'sub' is commonly used for username in JWT
    } catch {
      return null;
    }
  }
}
