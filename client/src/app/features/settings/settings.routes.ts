import { Routes } from '@angular/router';
import { SettingsComponent } from './components/settings.component';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: SettingsComponent,
    data: { title: 'System Settings' }
  }
];
