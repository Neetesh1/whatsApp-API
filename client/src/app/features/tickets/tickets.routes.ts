import { Routes } from '@angular/router';
import { TicketListComponent } from './components/ticket-list.component';

export const TICKETS_ROUTES: Routes = [
  {
    path: '',
    component: TicketListComponent
  },
  {
    path: 'open',
    component: TicketListComponent,
    data: { status: 'open' }
  },
  {
    path: 'closed',
    component: TicketListComponent,
    data: { status: 'closed' }
  }
];
