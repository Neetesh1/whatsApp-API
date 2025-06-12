import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class SidebarComponent {
  constructor(private router: Router) {}

  isAdmin(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role === 'admin';
      } catch (e) {
        console.error('Error decoding token:', e);
        return false;
      }
    }
    return false;
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
