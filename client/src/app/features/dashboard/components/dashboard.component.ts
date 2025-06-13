import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketsService, Ticket } from '../../../core/services/tickets.service';
import { WhatsAppService } from '../../../core/services/whatsapp.service';
import { SocketService } from '../../../core/services/socket.service';
import { Subscription } from 'rxjs';

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  messagesReceived: number;
  messagesCount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="row">
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
            <i class="fas fa-envelope-open"></i>
          </div>
          <a routerLink="/tickets/open" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-warning">
          <div class="inner">
            <h3>{{ stats.messagesCount }}</h3>
            <p>Messages Today</p>
          </div>
          <div class="icon">
            <i class="fab fa-whatsapp"></i>
          </div>
          <a routerLink="/whatsapp/status" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-danger">
          <div class="inner">
            <h3>{{ stats.messagesReceived }}</h3>
            <p>Received Today</p>
          </div>
          <div class="icon">
            <i class="fas fa-inbox"></i>
          </div>
          <a routerLink="/whatsapp/status" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Tickets</h3>
            <div class="card-tools">
              <button type="button" class="btn btn-sm btn-primary" (click)="loadDashboardData()">
                <i class="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div *ngIf="isLoading" class="text-center p-3">
              <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
            <table class="table table-striped" *ngIf="!isLoading">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ticket of recentTickets">
                  <td>#{{ ticket.id }}</td>
                  <td>{{ ticket.customer_name }}</td>
                  <td>{{ ticket.subject }}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-warning': ticket.status === 'open',
                      'bg-info': ticket.status === 'in_progress',
                      'bg-success': ticket.status === 'resolved',
                      'bg-secondary': ticket.status === 'closed'
                    }">
                      {{ ticket.status | titlecase }}
                    </span>
                  </td>
                  <td>{{ ticket.created_at | date:'short' }}</td>
                </tr>
                <tr *ngIf="recentTickets.length === 0">
                  <td colspan="5" class="text-center text-muted">No tickets found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-md-4">
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

        <div class="card mt-3">
          <div class="card-header">
            <h3 class="card-title">WhatsApp Status</h3>
          </div>
          <div class="card-body">
            <div class="d-flex align-items-center" *ngIf="whatsappStatus">
              <div class="mr-3">
                <i class="fab fa-whatsapp fa-2x" [ngClass]="{
                  'text-success': whatsappStatus.connected,
                  'text-danger': !whatsappStatus.connected
                }"></i>
              </div>
              <div>
                <strong>{{ whatsappStatus.connected ? 'Connected' : 'Disconnected' }}</strong>
                <br>
                <small class="text-muted" *ngIf="whatsappStatus.phone_number">
                  {{ whatsappStatus.phone_number }}
                </small>
              </div>
            </div>
            <div *ngIf="!whatsappStatus" class="text-center">
              <div class="spinner-border spinner-border-sm" role="status"></div>
              <span class="ml-2">Checking status...</span>
            </div>
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

    .btn-block {
      width: 100%;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {
    totalTickets: 0,
    openTickets: 0,
    messagesReceived: 0,
    messagesCount: 0
  };

  recentTickets: Ticket[] = [];
  whatsappStatus: any = null;
  isLoading = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private ticketsService: TicketsService,
    private whatsappService: WhatsAppService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.socketService.disconnect();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Load tickets
    this.subscriptions.push(
      this.ticketsService.getTickets().subscribe({
        next: (tickets: Ticket[]) => {
          this.recentTickets = tickets.slice(0, 10); // Show only recent 10
          this.stats.totalTickets = tickets.length;
          this.stats.openTickets = tickets.filter((t: Ticket) => t.status === 'open').length;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading tickets:', error);
          this.isLoading = false;
        }
      })
    );

    // Load WhatsApp status
    this.subscriptions.push(
      this.whatsappService.getConnectionStatus().subscribe({
        next: (status: any) => {
          this.whatsappStatus = status;
        },
        error: (error: any) => {
          console.error('Error loading WhatsApp status:', error);
          this.whatsappStatus = { connected: false };
        }
      })
    );

    // Load messages count (mock for now)
    this.stats.messagesCount = Math.floor(Math.random() * 50) + 10;
    this.stats.messagesReceived = Math.floor(Math.random() * 30) + 5;
  }

  private setupSocketListeners(): void {
    this.socketService.connect();

    // Listen for new tickets
    this.subscriptions.push(
      this.socketService.onNewTicket().subscribe((ticket: any) => {
        this.recentTickets.unshift(ticket);
        if (this.recentTickets.length > 10) {
          this.recentTickets.pop();
        }
        this.stats.totalTickets++;
        if (ticket.status === 'open') {
          this.stats.openTickets++;
        }
      })
    );

    // Listen for ticket updates
    this.subscriptions.push(
      this.socketService.onTicketUpdate().subscribe((updatedTicket: any) => {
        const index = this.recentTickets.findIndex(t => t.id === updatedTicket.id);
        if (index !== -1) {
          this.recentTickets[index] = updatedTicket;
        }
      })
    );

    // Listen for WhatsApp status changes
    this.subscriptions.push(
      this.socketService.onWhatsAppStatusChange().subscribe((status: any) => {
        this.whatsappStatus = status;
      })
    );
  }
}
