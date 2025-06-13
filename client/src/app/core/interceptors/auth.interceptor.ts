import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from local storage
    const authToken = localStorage.getItem('token');

    // Clone the request and add the authorization header if token exists
    let authReq = req;
    if (authToken) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // Handle the request and catch errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token is invalid or expired, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
