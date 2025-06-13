import { Routes } from '@angular/router';
export const WHATSAPP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'status',
    pathMatch: 'full'
  },
  {
    path: 'status',
    loadComponent: () => import('./components/whatsapp-status.component').then(c => c.WhatsappStatusComponent)
  },
  {
    path: 'templates',
    loadComponent: () => import('./components/message-templates.component').then(c => c.MessageTemplatesComponent)
  },
  {
    path: 'contacts',
    loadComponent: () => import('./components/whatsapp-contacts.component').then(c => c.WhatsappContactsComponent)
  }
];
