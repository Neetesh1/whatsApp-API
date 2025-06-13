import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-box">
        <div class="login-logo">
          <a href="#"><b>WhatsApp</b> Ticket System</a>
        </div>
        <div class="card">
          <div class="card-body login-card-body">
            <p class="login-box-msg">Sign in to start your session</p>

            <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
              <div class="input-group mb-3">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Username"
                  [(ngModel)]="credentials.username"
                  name="username"
                  required
                  #username="ngModel"
                >
                <div class="input-group-append">
                  <div class="input-group-text">
                    <span class="fas fa-user"></span>
                  </div>
                </div>
              </div>
              <div class="input-group mb-3">
                <input
                  type="password"
                  class="form-control"
                  placeholder="Password"
                  [(ngModel)]="credentials.password"
                  name="password"
                  required
                  #password="ngModel"
                >
                <div class="input-group-append">
                  <div class="input-group-text">
                    <span class="fas fa-lock"></span>
                  </div>
                </div>
              </div>

              <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>

              <div class="row">
                <div class="col-12">
                  <button
                    type="submit"
                    class="btn btn-primary btn-block"
                    [disabled]="isLoading || !loginForm.valid"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Sign In
                  </button>
                </div>
              </div>
            </form>

            <p class="mb-1 mt-3">
              <small class="text-muted">
                Demo credentials: admin/password or user/password
              </small>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-box {
      width: 360px;
    }

    .login-logo {
      text-align: center;
      margin-bottom: 20px;
    }

    .login-logo a {
      color: white;
      font-size: 2rem;
      font-weight: 300;
      text-decoration: none;
    }

    .card {
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      border: none;
      border-radius: 10px;
    }

    .login-card-body {
      padding: 20px;
    }

    .login-box-msg {
      text-align: center;
      margin-bottom: 20px;
      color: #666;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 5px;
      padding: 10px;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }
  `]
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.credentials.username && this.credentials.password) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.credentials.username, this.credentials.password).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}
