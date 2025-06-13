import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        data: { title: 'Dashboard' }
      },
      {
        path: 'tickets',
        loadChildren: () => import('./features/tickets/tickets.routes').then(m => m.TICKETS_ROUTES),
        data: { title: 'Tickets' }
      },
      {
        path: 'whatsapp',
        loadChildren: () => import('./features/whatsapp/whatsapp.routes').then(m => m.WHATSAPP_ROUTES),
        data: { title: 'WhatsApp' }
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES),
        data: { title: 'User Management' }
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
        data: { title: 'Settings' }
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
