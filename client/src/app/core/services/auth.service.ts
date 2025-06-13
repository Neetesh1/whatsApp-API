import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = 'http://localhost:3000/api'; // Base API URL

  constructor(private http: HttpClient, private router: Router) {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        // Fallback to mock data for demo purposes
        if (username === 'admin' && password === 'password') {
          const user = {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin'
          };

          localStorage.setItem('token', 'demo-token-admin');
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return of({ token: 'demo-token-admin', user });
        } else if (username === 'user' && password === 'password') {
          const user = {
            id: 2,
            username: 'user',
            email: 'user@example.com',
            role: 'user'
          };

          localStorage.setItem('token', 'demo-token-user');
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return of({ token: 'demo-token-user', user });
        } else {
          return throwError(() => new Error('Invalid username or password'));
        }
      })
    );
  }

  logout(): void {
    // Remove token and user info
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);

    // Navigate to login
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
