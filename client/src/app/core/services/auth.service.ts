import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private apiUrl = 'http://localhost:3000/api'; // Base API URL

  constructor(private router: Router, private http: HttpClient) {
    // Check if user is already logged in
    this.checkToken();
  }

  private checkToken(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    // In a real app, this would call your API
    // For demo purposes, we'll use mock data first
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      catchError(error => {
        // Fallback to mock data for demo purposes
        if (email === 'admin@example.com' && password === 'password') {
          const user = {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            avatar: 'assets/img/avatar.png'
          };

          localStorage.setItem('token', 'demo-token-admin');
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return of({ success: true, user });
        } else if (email === 'user@example.com' && password === 'password') {
          const user = {
            id: 2,
            name: 'Regular User',
            email: 'user@example.com',
            role: 'user',
            avatar: 'assets/img/avatar2.png'
          };

          localStorage.setItem('token', 'demo-token-user');
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return of({ success: true, user });
        } else {
          return throwError(() => new Error('Invalid email or password'));
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

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  // Create a new user (admin only)
  createUser(userData: Omit<User, 'id'>): Observable<any> {
    // In a real app, this would call your API
    return this.http.post(`${this.apiUrl}/users`, userData).pipe(
      catchError(error => {
        // Mock response for demo
        const newUser = {
          id: Math.floor(Math.random() * 1000) + 3,
          ...userData
        };
        return of({ success: true, user: newUser });
      })
    );
  }

  // Get all users (admin only)
  getUsers(): Observable<User[]> {
    // In a real app, this would call your API
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      catchError(error => {
        // Mock data for demo
        return of([
          {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            avatar: 'assets/img/avatar.png'
          },
          {
            id: 2,
            name: 'Regular User',
            email: 'user@example.com',
            role: 'user',
            avatar: 'assets/img/avatar2.png'
          },
          {
            id: 3,
            name: 'Support Agent',
            email: 'agent@example.com',
            role: 'user',
            avatar: 'assets/img/avatar3.png'
          }
        ]);
      })
    );
  }
}
