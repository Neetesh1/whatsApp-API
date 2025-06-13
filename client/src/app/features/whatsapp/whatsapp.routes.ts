import { Routes } from '@angular/router';
import { WhatsappStatusComponent } from './components/whatsapp-status.component';
import { MessageTemplatesComponent } from './components/message-templates.component';

export const WHATSAPP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'status',
    pathMatch: 'full'
  },
  {
    path: 'status',
    component: WhatsappStatusComponent,
    data: { title: 'WhatsApp Connection Status' }
  },
  {
    path: 'templates',
    component: MessageTemplatesComponent,
    data: { title: 'Message Templates' }
  }
];
