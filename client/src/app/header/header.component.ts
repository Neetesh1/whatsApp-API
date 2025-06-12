import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class HeaderComponent {
  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  logout() {
    localStorage.removeItem('token');
    this.toastr.success('Logged out successfully', 'Success');
    this.router.navigate(['/login']);
  }
}
