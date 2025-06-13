import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list.component';
import { UserCreateComponent } from './components/user-create.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'manage',
    pathMatch: 'full'
  },
  {
    path: 'manage',
    component: UserListComponent,
    data: { title: 'Manage Users' }
  },
  {
    path: 'create',
    component: UserCreateComponent,
    data: { title: 'Create User' }
  }
];
