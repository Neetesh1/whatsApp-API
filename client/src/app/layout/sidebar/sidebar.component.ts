import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  currentPath: string = '';
  ticketCount: number = 12; // Default value, replace with API call
  openTicketCount: number = 5; // Default value, replace with API call

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Track current route for active menu highlighting
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.url;
    });

    // Initialize with current path
    this.currentPath = this.router.url;

    this.loadTicketCounts();
  }

  loadTicketCounts(): void {
    // Mock data - replace with actual API call later
    this.ticketCount = 12;
    this.openTicketCount = 5;
  }

  isMenuActive(path: string): boolean {
    return this.currentPath.startsWith(path);
  }

  getUserName(): string {
    // Replace with actual user data from auth service
    return 'Admin User';
  }

  isAdmin(): boolean {
    // Replace with actual role check from auth service
    return true;
  }

  logout(): void {
    // Replace with actual logout logic
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
