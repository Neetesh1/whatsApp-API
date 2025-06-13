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
    this.restoreSidebarState();
    this.addWindowResizeListener();
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
      // Check if we're on mobile (screen width < 992px)
      const isMobile = window.innerWidth < 992;

      if (isMobile) {
        // On mobile: toggle sidebar-open class for overlay behavior
        body.classList.toggle('sidebar-open');

        // Close sidebar when clicking overlay (if opened)
        if (body.classList.contains('sidebar-open')) {
          this.addOverlayClickListener();
        } else {
          this.removeOverlayClickListener();
        }
      } else {
        // On desktop: toggle between normal, collapsed, and hidden
        if (body.classList.contains('sidebar-collapse')) {
          // Currently collapsed, make it hidden
          body.classList.remove('sidebar-collapse');
          body.classList.add('sidebar-hidden');
          localStorage.setItem('sidebar-state', 'hidden');
        } else if (body.classList.contains('sidebar-hidden')) {
          // Currently hidden, make it normal
          body.classList.remove('sidebar-hidden');
          localStorage.setItem('sidebar-state', 'normal');
        } else {
          // Currently normal, make it collapsed
          body.classList.add('sidebar-collapse');
          localStorage.setItem('sidebar-state', 'collapsed');
        }
      }
    }
  }

  private addOverlayClickListener(): void {
    // Add click listener to close sidebar when clicking overlay on mobile
    setTimeout(() => {
      const overlay = document.querySelector('body.sidebar-open::before');
      document.addEventListener('click', this.handleOverlayClick.bind(this));
    }, 100);
  }

  private removeOverlayClickListener(): void {
    document.removeEventListener('click', this.handleOverlayClick.bind(this));
  }

  private handleOverlayClick(event: Event): void {
    const target = event.target as HTMLElement;
    const sidebar = document.querySelector('.main-sidebar');
    const body = document.querySelector('body');

    // Close sidebar if clicking outside of it on mobile
    if (body?.classList.contains('sidebar-open') &&
        sidebar &&
        !sidebar.contains(target) &&
        !target.closest('.nav-link[data-widget="pushmenu"]')) {
      body.classList.remove('sidebar-open');
      this.removeOverlayClickListener();
    }
  }

  private restoreSidebarState(): void {
    const body = document.querySelector('body');
    const savedState = localStorage.getItem('sidebar-state');

    if (body && savedState) {
      // Clear all sidebar classes first
      body.classList.remove('sidebar-collapse', 'sidebar-hidden', 'sidebar-open');

      // Apply saved state (only on desktop)
      if (window.innerWidth >= 992) {
        if (savedState === 'collapsed') {
          body.classList.add('sidebar-collapse');
        } else if (savedState === 'hidden') {
          body.classList.add('sidebar-hidden');
        }
      }
    }
  }

  private addWindowResizeListener(): void {
    window.addEventListener('resize', () => {
      const body = document.querySelector('body');
      if (body) {
        // Clear mobile-specific classes when switching to desktop
        if (window.innerWidth >= 992) {
          body.classList.remove('sidebar-open');
          this.removeOverlayClickListener();
          this.restoreSidebarState(); // Restore desktop state
        } else {
          // Clear desktop-specific classes when switching to mobile
          body.classList.remove('sidebar-collapse', 'sidebar-hidden');
        }
      }
    });
  }
}
