import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  whatsappMessages: number;
}

interface RecentTicket {
  id: number;
  subject: string;
  status: string;
  priority: string;
  created: string;
  customer: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="row">
      <!-- Stats Cards -->
      <div class="col-lg-3 col-6">
        <div class="small-box bg-info">
          <div class="inner">
            <h3>{{ stats.totalTickets }}</h3>
            <p>Total Tickets</p>
          </div>
          <div class="icon">
            <i class="fas fa-ticket-alt"></i>
          </div>
          <a routerLink="/tickets" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-success">
          <div class="inner">
            <h3>{{ stats.openTickets }}</h3>
            <p>Open Tickets</p>
          </div>
          <div class="icon">
            <i class="fas fa-folder-open"></i>
          </div>
          <a routerLink="/tickets/open" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-warning">
          <div class="inner">
            <h3>{{ stats.closedTickets }}</h3>
            <p>Closed Tickets</p>
          </div>
          <div class="icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <a routerLink="/tickets/closed" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-danger">
          <div class="inner">
            <h3>{{ stats.whatsappMessages }}</h3>
            <p>WhatsApp Messages</p>
          </div>
          <div class="icon">
            <i class="fab fa-whatsapp"></i>
          </div>
          <a routerLink="/whatsapp" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Recent Tickets -->
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Tickets</h3>
            <div class="card-tools">
              <button type="button" class="btn btn-tool" (click)="loadRecentTickets()">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table m-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Subject</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let ticket of recentTickets">
                    <td>{{ ticket.id }}</td>
                    <td>{{ ticket.subject }}</td>
                    <td>{{ ticket.customer }}</td>
                    <td>
                      <span class="badge"
                            [class.badge-success]="ticket.status === 'Open'"
                            [class.badge-warning]="ticket.status === 'In Progress'"
                            [class.badge-secondary]="ticket.status === 'Closed'">
                        {{ ticket.status }}
                      </span>
                    </td>
                    <td>
                      <span class="badge"
                            [class.badge-danger]="ticket.priority === 'High'"
                            [class.badge-warning]="ticket.priority === 'Medium'"
                            [class.badge-info]="ticket.priority === 'Low'">
                        {{ ticket.priority }}
                      </span>
                    </td>
                    <td>{{ ticket.created }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer clearfix">
            <a routerLink="/tickets" class="btn btn-sm btn-info float-right">View All Tickets</a>
          </div>
        </div>
      </div>

      <!-- WhatsApp Status -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">WhatsApp Status</h3>
          </div>
          <div class="card-body">
            <div class="info-box">
              <span class="info-box-icon bg-success elevation-1">
                <i class="fab fa-whatsapp"></i>
              </span>
              <div class="info-box-content">
                <span class="info-box-text">Connection</span>
                <span class="info-box-number">Connected</span>
              </div>
            </div>

            <div class="info-box">
              <span class="info-box-icon bg-info elevation-1">
                <i class="fas fa-comments"></i>
              </span>
              <div class="info-box-content">
                <span class="info-box-text">Today's Messages</span>
                <span class="info-box-number">{{ stats.whatsappMessages }}</span>
              </div>
            </div>

            <a routerLink="/whatsapp/status" class="btn btn-primary btn-block">
              <i class="fab fa-whatsapp mr-2"></i>
              Manage WhatsApp
            </a>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Quick Actions</h3>
          </div>
          <div class="card-body">
            <a routerLink="/tickets/create" class="btn btn-success btn-block mb-2">
              <i class="fas fa-plus mr-2"></i>
              Create New Ticket
            </a>
            <a routerLink="/whatsapp/templates" class="btn btn-info btn-block mb-2">
              <i class="fas fa-file-alt mr-2"></i>
              Message Templates
            </a>
            <a routerLink="/settings" class="btn btn-secondary btn-block">
              <i class="fas fa-cog mr-2"></i>
              System Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .small-box {
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    .card {
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    .info-box {
      margin-bottom: 15px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    whatsappMessages: 0
  };

  recentTickets: RecentTicket[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Mock data - replace with actual API calls
    this.stats = {
      totalTickets: 150,
      openTickets: 23,
      closedTickets: 127,
      whatsappMessages: 45
    };

    this.loadRecentTickets();
  }

  loadRecentTickets(): void {
    // Mock data - replace with actual API call
    this.recentTickets = [
      {
        id: 1,
        subject: 'Login Issue',
        customer: 'John Doe',
        status: 'Open',
        priority: 'High',
        created: '2025-06-13 10:30'
      },
      {
        id: 2,
        subject: 'Payment Problem',
        customer: 'Jane Smith',
        status: 'In Progress',
        priority: 'Medium',
        created: '2025-06-13 09:15'
      },
      {
        id: 3,
        subject: 'Feature Request',
        customer: 'Bob Johnson',
        status: 'Open',
        priority: 'Low',
        created: '2025-06-13 08:45'
      },
      {
        id: 4,
        subject: 'Bug Report',
        customer: 'Alice Brown',
        status: 'Closed',
        priority: 'High',
        created: '2025-06-12 16:20'
      }
    ];
  }
}
