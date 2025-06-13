import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event, ActivatedRoute, RouterOutlet } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  pageTitle: string = 'Dashboard';
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    // Update page title and breadcrumbs based on route data
    this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route) => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data)
    ).subscribe((data) => {
      this.updatePageInfo(data);
      this.updateBreadcrumbs();
    });

    // Initialize on first load
    this.updatePageInfo({});
    this.updateBreadcrumbs();
  }

  private updatePageInfo(data: any): void {
    if (data['title']) {
      this.pageTitle = data['title'];
      this.titleService.setTitle(`WhatsApp Ticket System - ${data['title']}`);
    } else {
      // Extract title from URL path
      const path = this.router.url;
      this.pageTitle = this.generateTitleFromPath(path);
      this.titleService.setTitle(`WhatsApp Ticket System - ${this.pageTitle}`);
    }
  }

  private generateTitleFromPath(path: string): string {
    const segments = path.split('/').filter(segment => segment);

    if (segments.length === 0) return 'Dashboard';

    const lastSegment = segments[segments.length - 1];

    // Convert path segments to readable titles
    const titleMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'tickets': 'Tickets',
      'open': 'Open Tickets',
      'closed': 'Closed Tickets',
      'whatsapp': 'WhatsApp',
      'status': 'Connection Status',
      'templates': 'Message Templates',
      'contacts': 'Contacts',
      'users': 'Users',
      'create': 'Create New',
      'settings': 'Settings'
    };

    return titleMap[lastSegment] || this.capitalize(lastSegment);
  }

  private updateBreadcrumbs(): void {
    const path = this.router.url;
    const segments = path.split('/').filter(segment => segment);

    this.breadcrumbs = [
      { label: 'Home', url: '/dashboard' }
    ];

    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      const breadcrumbMap: { [key: string]: string } = {
        'dashboard': 'Dashboard',
        'tickets': 'Tickets',
        'open': 'Open Tickets',
        'closed': 'Closed Tickets',
        'whatsapp': 'WhatsApp',
        'status': 'Connection Status',
        'templates': 'Message Templates',
        'contacts': 'Contacts',
        'users': 'User Management',
        'create': 'Create New',
        'settings': 'Settings'
      };

      const label = breadcrumbMap[segment] || this.capitalize(segment);

      // Don't add dashboard to breadcrumbs as it's already the home
      if (segment !== 'dashboard') {
        if (index === segments.length - 1) {
          // Last item shouldn't have a link
          this.breadcrumbs.push({ label });
        } else {
          this.breadcrumbs.push({ label, url: currentPath });
        }
      }
    });
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_]/g, ' ');
  }
}
