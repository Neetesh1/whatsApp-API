import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Ticket {
  id: string;
  customer: string;
  customerPhone: string;
  subject: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdAt: string;
  lastUpdated: string;
  messages: number;
  avatar: string;
}

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">{{ pageTitle }}</h3>
        <div class="card-tools">
          <div class="input-group input-group-sm" style="width: 150px;">
            <input type="text" name="table_search" class="form-control float-right" placeholder="Search" [(ngModel)]="searchTerm" (input)="applyFilter()">
            <div class="input-group-append">
              <button type="submit" class="btn btn-default">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- /.card-header -->
      <div class="card-body table-responsive p-0">
        <table class="table table-hover text-nowrap">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ticket of filteredTickets">
              <td>{{ ticket.id }}</td>
              <td>
                <img [src]="ticket.avatar" class="img-circle img-size-32 mr-2" alt="Customer Avatar">
                {{ ticket.customer }}
                <small class="d-block text-muted">{{ ticket.customerPhone }}</small>
              </td>
              <td>{{ ticket.subject }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusBadgeClass(ticket.status)">
                  {{ ticket.status }}
                </span>
              </td>
              <td>
                <span class="badge" [ngClass]="getPriorityBadgeClass(ticket.priority)">
                  {{ ticket.priority }}
                </span>
              </td>
              <td>{{ ticket.assignedTo }}</td>
              <td>{{ ticket.lastUpdated }}</td>
              <td>
                <div class="btn-group">
                  <button type="button" class="btn btn-sm btn-info" (click)="viewTicket(ticket.id)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button type="button" class="btn btn-sm btn-primary" (click)="replyToTicket(ticket.id)">
                    <i class="fas fa-reply"></i>
                  </button>
                  <button type="button" class="btn btn-sm btn-warning" (click)="editTicket(ticket.id)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button type="button" class="btn btn-sm btn-danger" (click)="closeTicket(ticket.id)">
                    <i class="fas fa-times"></i>
                  </button>
                  <button type="button" class="btn btn-sm btn-success" (click)="continueToIterate(ticket.id)">
                    <i class="fas fa-sync-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredTickets.length === 0">
              <td colspan="8" class="text-center py-3">
                <i class="fas fa-ticket-alt text-muted me-2"></i> No tickets found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- /.card-body -->
      <div class="card-footer">
        <div class="float-end">
          <ul class="pagination pagination-sm m-0">
            <li class="page-item"><a class="page-link" href="#">«</a></li>
            <li class="page-item"><a class="page-link" href="#">1</a></li>
            <li class="page-item"><a class="page-link" href="#">2</a></li>
            <li class="page-item"><a class="page-link" href="#">3</a></li>
            <li class="page-item"><a class="page-link" href="#">»</a></li>
          </ul>
        </div>
        <div class="float-start">
          <button class="btn btn-primary" (click)="createNewTicket()">
            <i class="fas fa-plus"></i> New Ticket
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TicketListComponent implements OnInit {
  pageTitle: string = 'All Tickets';
  ticketType: string = 'all';
  searchTerm: string = '';

  tickets: Ticket[] = [
    {
      id: 'TKT-2021',
      customer: 'John Doe',
      customerPhone: '+1 234 567 8901',
      subject: 'Unable to send media',
      status: 'Open',
      priority: 'High',
      assignedTo: 'Agent 1',
      createdAt: '2023-06-10',
      lastUpdated: '1 hour ago',
      messages: 5,
      avatar: 'https://adminlte.io/themes/v3/dist/img/user1-128x128.jpg'
    },
    {
      id: 'TKT-2020',
      customer: 'Jane Smith',
      customerPhone: '+1 234 567 8902',
      subject: 'Delivery confirmation issue',
      status: 'Closed',
      priority: 'Medium',
      assignedTo: 'Agent 2',
      createdAt: '2023-06-09',
      lastUpdated: '1 day ago',
      messages: 8,
      avatar: 'https://adminlte.io/themes/v3/dist/img/user3-128x128.jpg'
    },
    {
      id: 'TKT-2019',
      customer: 'Alice Johnson',
      customerPhone: '+1 234 567 8903',
      subject: 'Payment not received',
      status: 'Pending',
      priority: 'Low',
      assignedTo: 'Agent 1',
      createdAt: '2023-06-08',
      lastUpdated: '2 days ago',
      messages: 3,
      avatar: 'https://adminlte.io/themes/v3/dist/img/user4-128x128.jpg'
    },
    {
      id: 'TKT-2018',
      customer: 'Bob Wilson',
      customerPhone: '+1 234 567 8904',
      subject: 'Order status inquiry',
      status: 'Open',
      priority: 'High',
      assignedTo: 'Agent 3',
      createdAt: '2023-06-07',
      lastUpdated: '3 days ago',
      messages: 6,
      avatar: 'https://adminlte.io/themes/v3/dist/img/user5-128x128.jpg'
    },
    {
      id: 'TKT-2017',
      customer: 'Mike Brown',
      customerPhone: '+1 234 567 8905',
      subject: 'Request for information',
      status: 'Processing',
      priority: 'Medium',
      assignedTo: 'Agent 2',
      createdAt: '2023-06-06',
      lastUpdated: '4 days ago',
      messages: 4,
      avatar: 'https://adminlte.io/themes/v3/dist/img/user6-128x128.jpg'
    }
  ];

  filteredTickets: Ticket[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get the ticket type from the route data
    this.route.data.subscribe(data => {
      this.ticketType = data['ticketType'] || 'all';
      this.pageTitle = data['title'] || 'All Tickets';
      this.filterTickets();
    });
  }

  filterTickets(): void {
    // Filter tickets based on the ticket type and search term
    this.filteredTickets = this.tickets.filter(ticket => {
      // Apply type filter
      if (this.ticketType === 'open' && ticket.status !== 'Open') {
        return false;
      }
      if (this.ticketType === 'closed' && ticket.status !== 'Closed') {
        return false;
      }

      // Apply search filter if search term exists
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        return ticket.id.toLowerCase().includes(term) ||
               ticket.customer.toLowerCase().includes(term) ||
               ticket.subject.toLowerCase().includes(term) ||
               ticket.customerPhone.toLowerCase().includes(term);
      }

      return true;
    });
  }

  applyFilter(): void {
    this.filterTickets();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'bg-danger';
      case 'Closed':
        return 'bg-success';
      case 'Pending':
        return 'bg-warning';
      case 'Processing':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'High':
        return 'bg-danger';
      case 'Medium':
        return 'bg-warning';
      case 'Low':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  viewTicket(id: string): void {
    // Navigate to ticket detail view
    this.router.navigate(['/tickets/view', id]);
  }

  replyToTicket(id: string): void {
    // Navigate to ticket reply view
    this.router.navigate(['/tickets/reply', id]);
  }

  editTicket(id: string): void {
    // Navigate to ticket edit view
    this.router.navigate(['/tickets/edit', id]);
  }

  closeTicket(id: string): void {
    // In a real app, you would call a service to close the ticket
    // For now, just simulate it by updating the local state
    const index = this.tickets.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tickets[index].status = 'Closed';
      this.tickets[index].lastUpdated = 'Just now';
      this.filterTickets();
    }
  }

  continueToIterate(id: string): void {
    // In a real app, you would call a service to continue the ticket iteration
    // For now, just simulate it by updating the local state
    const index = this.tickets.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tickets[index].status = 'Open';
      this.tickets[index].lastUpdated = 'Just now';
      this.filterTickets();
    }
  }

  createNewTicket(): void {
    // Navigate to create ticket view
    this.router.navigate(['/tickets/create']);
  }
}
