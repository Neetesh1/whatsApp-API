import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';

interface Message {
  sender: string;
  content: string;
  time: string;
  avatarUrl: string;
}

interface Notification {
  text: string;
  time: string;
  iconClass: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  unreadMessages: number = 2;
  recentMessages: Message[] = [];
  notificationCount: number = 3;
  notifications: Notification[] = [];
  whatsappConnected: boolean = true;
  darkMode: boolean = false;
  currentUser: User | null = null;

  constructor(private router: Router, private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.loadNotifications();
    this.loadMessages();
    this.checkDarkModePreference();
  }

  loadNotifications(): void {
    // Mock data - replace with actual API call later
    this.notifications = [
      { text: '5 new tickets created', time: '3 mins', iconClass: 'fas fa-ticket-alt text-warning me-2' },
      { text: 'Server load at 80%', time: '10 mins', iconClass: 'fas fa-server text-danger me-2' },
      { text: 'WhatsApp API connected', time: '2 hours', iconClass: 'fab fa-whatsapp text-success me-2' }
    ];
    this.notificationCount = this.notifications.length;
  }

  loadMessages(): void {
    // Mock data - replace with actual API call later
    this.recentMessages = [
      {
        sender: 'John Doe',
        content: 'I need help with my order',
        time: '5 mins ago',
        avatarUrl: 'https://adminlte.io/themes/v3/dist/img/user1-128x128.jpg'
      },
      {
        sender: 'Jane Smith',
        content: 'When will my order be delivered?',
        time: '2 hours ago',
        avatarUrl: 'https://adminlte.io/themes/v3/dist/img/user3-128x128.jpg'
      }
    ];
    this.unreadMessages = this.recentMessages.length;
  }

  toggleWhatsAppStatus(): void {
    this.whatsappConnected = !this.whatsappConnected;
    // Replace with actual API call later
  }

  checkDarkModePreference(): void {
    const savedPreference = localStorage.getItem('darkMode');
    this.darkMode = savedPreference === 'true';
    this.applyDarkMode();
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyDarkMode();
  }

  applyDarkMode(): void {
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToTickets(): void {
    this.router.navigate(['/tickets']);
  }

  navigateToMessages(): void {
    this.router.navigate(['/messages']);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  getUserName(): string {
    // Replace with actual user data from auth service
    return 'Admin User';
  }

  logout(): void {
    this.authService.logout();
    // Replace with actual logout logic
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    const body = document.querySelector('body');
    if (body) {
      body.classList.toggle('sidebar-collapse');
    }
  }
}
