import { Routes } from '@angular/router';
import { TicketListComponent } from './components/ticket-list.component';

export const TICKETS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'all',
    pathMatch: 'full'
  },
  {
    path: 'all',
    component: TicketListComponent,
    data: { title: 'All Tickets', ticketType: 'all' }
  },
  {
    path: 'open',
    component: TicketListComponent,
    data: { title: 'Open Tickets', ticketType: 'open' }
  },
  {
    path: 'closed',
    component: TicketListComponent,
    data: { title: 'Closed Tickets', ticketType: 'closed' }
  }
];
