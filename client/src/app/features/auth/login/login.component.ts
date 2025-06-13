import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page bg-body-secondary">
      <div class="login-box">
        <div class="card card-outline card-primary">
          <div class="card-header text-center">
            <a href="#" class="h1">
              <i class="fab fa-whatsapp text-success me-2"></i>
              <b>WhatsApp</b>Ticket
            </a>
          </div>
          <div class="card-body">
            <p class="login-box-msg">Sign in to start your session</p>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="input-group mb-3">
                <input type="email" class="form-control" placeholder="Email" formControlName="email">
                <div class="input-group-append">
                  <div class="input-group-text">
                    <span class="fas fa-envelope"></span>
                  </div>
                </div>
              </div>
              <div *ngIf="loginForm.controls['email'].invalid && loginForm.controls['email'].touched" class="text-danger mb-3">
                Valid email is required
              </div>

              <div class="input-group mb-3">
                <input type="password" class="form-control" placeholder="Password" formControlName="password">
                <div class="input-group-append">
                  <div class="input-group-text">
                    <span class="fas fa-lock"></span>
                  </div>
                </div>
              </div>
              <div *ngIf="loginForm.controls['password'].invalid && loginForm.controls['password'].touched" class="text-danger mb-3">
                Password is required
              </div>

              <div class="row">
                <div class="col-8">
                  <div class="icheck-primary">
                    <input type="checkbox" id="remember" formControlName="rememberMe">
                    <label for="remember">
                      Remember Me
                    </label>
                  </div>
                </div>
                <div class="col-4">
                  <button type="submit" class="btn btn-primary btn-block" [disabled]="loginForm.invalid || isLoggingIn">
                    <span *ngIf="isLoggingIn" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Sign In
                  </button>
                </div>
              </div>
            </form>

            <div *ngIf="loginError" class="alert alert-danger mt-3">
              {{ loginError }}
            </div>

            <p class="mb-1 mt-3">
              <a href="#">I forgot my password</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      align-items: center;
      background-color: #e9ecef;
      display: flex;
      flex-direction: column;
      height: 100vh;
      justify-content: center;
    }

    .login-box {
      width: 360px;
    }

    .login-box-msg {
      margin: 0;
      padding: 0 20px 20px;
      text-align: center;
    }

    .icheck-primary {
      margin-top: 6px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null;
  isLoggingIn: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoggingIn = true;
      this.loginError = null;

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loginError = error.message || 'Login failed. Please try again.';
          this.isLoggingIn = false;
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
