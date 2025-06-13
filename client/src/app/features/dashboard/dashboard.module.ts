import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './components/dashboard.component';
import { DASHBOARD_ROUTES } from './dashboard.routes';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(DASHBOARD_ROUTES)
  ],
  exports: [DashboardComponent]
})
export class DashboardModule { }
