import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit() {
    const loginData = {
      username: this.username,
      password: this.password
    };

    this.http.post('http://localhost:3000/api/login', loginData).subscribe({
      next: (response: any) => {
        // Store the token in local storage
        localStorage.setItem('token', response.token);
        this.toastr.success('Login successful', 'Success');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Login failed. Please try again.';
        this.toastr.error(this.errorMessage, 'Error');
      }
    });
  }
}
