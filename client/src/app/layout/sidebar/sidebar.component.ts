import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  currentPath: string = '';
  ticketCount: number = 12;
  openTicketCount: number = 5;
  currentUser: User | null = null;

  // Track which menus are open
  openMenus: Set<string> = new Set();

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Track current route for active menu highlighting
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.url;
      this.updateMenuState();
    });

    // Initialize with current path
    this.currentPath = this.router.url;
    this.updateMenuState();
    this.loadTicketCounts();

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  updateMenuState(): void {
    // Auto-open menus based on current route
    if (this.currentPath.startsWith('/tickets')) {
      this.openMenus.add('tickets');
    }
    if (this.currentPath.startsWith('/whatsapp')) {
      this.openMenus.add('whatsapp');
    }
    if (this.currentPath.startsWith('/users')) {
      this.openMenus.add('users');
    }
  }

  toggleMenu(menu: string): void {
    if (this.openMenus.has(menu)) {
      this.openMenus.delete(menu);
    } else {
      this.openMenus.add(menu);
    }
  }

  isMenuOpen(menu: string): boolean {
    return this.openMenus.has(menu);
  }

  loadTicketCounts(): void {
    // Mock data - replace with actual API call later
    this.ticketCount = 12;
    this.openTicketCount = 5;
  }

  isMenuActive(path: string): boolean {
    return this.currentPath.startsWith(path);
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  logout(): void {
    this.authService.logout();
  }
}
