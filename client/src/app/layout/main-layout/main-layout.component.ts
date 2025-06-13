import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event, ActivatedRoute, RouterOutlet } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  pageTitle: string = 'Dashboard';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    // Update page title based on route data
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
      if (data['title']) {
        this.pageTitle = data['title'];
        this.titleService.setTitle(`WhatsApp Ticket System - ${data['title']}`);
      } else {
        this.pageTitle = 'Dashboard';
        this.titleService.setTitle('WhatsApp Ticket System - Dashboard');
      }
    });
  }
}
