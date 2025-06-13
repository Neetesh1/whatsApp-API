import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Dashboard Stats -->
    <div class="row">
      <div class="col-lg-3 col-6">
        <div class="small-box bg-info">
          <div class="inner">
            <h3>{{ totalTickets }}</h3>
            <p>Total Tickets</p>
          </div>
          <div class="icon">
            <i class="fas fa-ticket-alt"></i>
          </div>
          <a [routerLink]="['/tickets/all']" class="small-box-footer">
            View All <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-success">
          <div class="inner">
            <h3>{{ resolvedTickets }}<sup style="font-size: 20px">%</sup></h3>
            <p>Resolution Rate</p>
          </div>
          <div class="icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <a href="#" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-warning">
          <div class="inner">
            <h3>{{ activeChats }}</h3>
            <p>Active Conversations</p>
          </div>
          <div class="icon">
            <i class="fas fa-comments"></i>
          </div>
          <a href="#" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-danger">
          <div class="inner">
            <h3>{{ avgResponseTime }}</h3>
            <p>Avg. Response Time (min)</p>
          </div>
          <div class="icon">
            <i class="fas fa-clock"></i>
          </div>
          <a href="#" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Main row -->
    <div class="row">
      <!-- Left col -->
      <section class="col-lg-7">
        <!-- Recent Tickets -->
        <div class="card">
          <div class="card-header border-transparent">
            <h3 class="card-title">Recent Tickets</h3>
            <div class="card-tools">
              <button type="button" class="btn btn-tool" data-lte-toggle="card-collapse">
                <i class="fas fa-minus"></i>
              </button>
              <button type="button" class="btn btn-tool" data-lte-dismiss="card-remove">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table m-0">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Subject</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let ticket of recentTickets">
                    <td><a href="#">{{ ticket.id }}</a></td>
                    <td>{{ ticket.customer }}</td>
                    <td>
                      <span class="badge" [ngClass]="getStatusBadgeClass(ticket.status)">
                        {{ ticket.status }}
                      </span>
                    </td>
                    <td>{{ ticket.subject }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer clearfix">
            <a [routerLink]="['/tickets/all']" class="btn btn-sm btn-info float-start">View All Tickets</a>
            <a [routerLink]="['/tickets/create']" class="btn btn-sm btn-primary float-end">Create New Ticket</a>
          </div>
        </div>
      </section>

      <!-- Right col -->
      <section class="col-lg-5">
        <!-- WhatsApp Status -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">WhatsApp Connection Status</h3>
            <div class="card-tools">
              <button type="button" class="btn btn-tool" data-lte-toggle="card-collapse">
                <i class="fas fa-minus"></i>
              </button>
              <button type="button" class="btn btn-tool" data-lte-dismiss="card-remove">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center border-bottom mb-3">
              <p class="text-success d-flex">
                <i class="fab fa-whatsapp me-2"></i>
                <span>Connection Status</span>
              </p>
              <p class="d-flex flex-column text-end">
                <span class="font-weight-bold">
                  <i class="fas fa-circle text-success"></i> Online
                </span>
                <span class="text-muted">Since {{ connectionTime }}</span>
              </p>
            </div>
            <div class="d-flex justify-content-between align-items-center border-bottom mb-3">
              <p class="text-info d-flex">
                <i class="fas fa-paper-plane me-2"></i>
                <span>Messages Sent Today</span>
              </p>
              <p class="d-flex flex-column text-end">
                <span class="font-weight-bold">{{ messagesSent }}</span>
              </p>
            </div>
            <div class="d-flex justify-content-between align-items-center border-bottom mb-3">
              <p class="text-warning d-flex">
                <i class="fas fa-inbox me-2"></i>
                <span>Messages Received Today</span>
              </p>
              <p class="d-flex flex-column text-end">
                <span class="font-weight-bold">{{ messagesReceived }}</span>
              </p>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <p class="text-danger d-flex">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <span>Failed Messages</span>
              </p>
              <p class="d-flex flex-column text-end">
                <span class="font-weight-bold">{{ failedMessages }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Recently Added Contacts -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Contacts</h3>
            <div class="card-tools">
              <button type="button" class="btn btn-tool" data-lte-toggle="card-collapse">
                <i class="fas fa-minus"></i>
              </button>
              <button type="button" class="btn btn-tool" data-lte-dismiss="card-remove">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <ul class="users-list clearfix">
              <li *ngFor="let contact of recentContacts">
                <img [src]="contact.avatar" alt="User Image">
                <a class="users-list-name" href="#">{{ contact.name }}</a>
                <span class="users-list-date">{{ contact.joinedDate }}</span>
              </li>
            </ul>
          </div>
          <div class="card-footer text-center">
            <a href="#">View All Contacts</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  // Dashboard metrics
  totalTickets: number = 150;
  resolvedTickets: number = 78;
  activeChats: number = 24;
  avgResponseTime: number = 15;

  // WhatsApp metrics
  connectionTime: string = '2 hours ago';
  messagesSent: number = 356;
  messagesReceived: number = 421;
  failedMessages: number = 12;

  // Recent tickets
  recentTickets = [
    { id: 'TKT-2021', customer: 'John Doe', status: 'Open', subject: 'Unable to send media' },
    { id: 'TKT-2020', customer: 'Jane Smith', status: 'Closed', subject: 'Delivery confirmation issue' },
    { id: 'TKT-2019', customer: 'Alice Johnson', status: 'Pending', subject: 'Payment not received' },
    { id: 'TKT-2018', customer: 'Bob Wilson', status: 'Open', subject: 'Order status inquiry' },
    { id: 'TKT-2017', customer: 'Mike Brown', status: 'Processing', subject: 'Request for information' }
  ];

  // Recent contacts
  recentContacts = [
    { name: 'John Doe', avatar: 'https://adminlte.io/themes/v3/dist/img/user1-128x128.jpg', joinedDate: 'Today' },
    { name: 'Jane Smith', avatar: 'https://adminlte.io/themes/v3/dist/img/user8-128x128.jpg', joinedDate: 'Yesterday' },
    { name: 'Mike Brown', avatar: 'https://adminlte.io/themes/v3/dist/img/user2-160x160.jpg', joinedDate: '2 days' },
    { name: 'Alice Johnson', avatar: 'https://adminlte.io/themes/v3/dist/img/user4-128x128.jpg', joinedDate: '2 days' }
  ];

  constructor() { }

  ngOnInit(): void {
    // In a real application, you would load these metrics from your API
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
}
