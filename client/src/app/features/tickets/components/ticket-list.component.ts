import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TicketsService, Ticket, TicketReply } from '../../../core/services/tickets.service';
import { AuthService } from '../../../core/services/auth.service';
import { SocketService } from '../../../core/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid">
      <!-- Header with filters -->
      <div class="row mb-3">
        <div class="col-md-8">
          <h2>
            <i class="fas fa-ticket-alt mr-2"></i>
            Support Tickets
          </h2>
        </div>
        <div class="col-md-4">
          <div class="btn-group" role="group">
            <button
              type="button"
              class="btn btn-sm"
              [ngClass]="selectedFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'"
              (click)="filterTickets('all')"
            >
              All Tickets
            </button>
            <button
              type="button"
              class="btn btn-sm"
              [ngClass]="selectedFilter === 'open' ? 'btn-success' : 'btn-outline-success'"
              (click)="filterTickets('open')"
            >
              Available ({{ openCount }})
            </button>
            <button
              type="button"
              class="btn btn-sm"
              [ngClass]="selectedFilter === 'assigned' ? 'btn-info' : 'btn-outline-info'"
              (click)="filterTickets('assigned')"
            >
              My Tickets ({{ myTicketsCount }})
            </button>
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div *ngIf="isLoading" class="text-center py-4">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading tickets...</span>
        </div>
      </div>

      <!-- Tickets list -->
      <div class="row" *ngIf="!isLoading">
        <div class="col-12">
          <div class="card">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped mb-0">
                  <thead class="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Message Preview</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let ticket of filteredTickets"
                        [class.table-warning]="ticket.status === 'open'"
                        [class.table-info]="ticket.status === 'assigned' && ticket.assigned_to === currentUserId"
                        [class.table-success]="ticket.status === 'in_progress'"
                        [class.table-secondary]="ticket.status === 'closed'">
                      <td>
                        <strong>#{{ ticket.id }}</strong>
                        <span *ngIf="ticket.from_whatsapp" class="ml-1">
                          <i class="fab fa-whatsapp text-success" title="From WhatsApp"></i>
                        </span>
                      </td>
                      <td>{{ ticket.customer_name }}</td>
                      <td>
                        <small>{{ ticket.phone_number }}</small>
                      </td>
                      <td>
                        <div class="message-preview">
                          {{ ticket.message | slice:0:50 }}{{ ticket.message.length > 50 ? '...' : '' }}
                        </div>
                        <small class="text-muted" *ngIf="ticket.reply_count && ticket.reply_count > 0">
                          <i class="fas fa-comments"></i> {{ ticket.reply_count }} replies
                        </small>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-warning text-dark': ticket.status === 'open',
                          'bg-info': ticket.status === 'assigned',
                          'bg-primary': ticket.status === 'in_progress',
                          'bg-success': ticket.status === 'closed'
                        }">
                          {{ getStatusLabel(ticket.status) }}
                        </span>
                      </td>
                      <td>
                        <span *ngIf="ticket.assigned_user_name" class="text-info">
                          {{ ticket.assigned_user_name }}
                        </span>
                        <span *ngIf="!ticket.assigned_user_name" class="text-muted">
                          Unassigned
                        </span>
                      </td>
                      <td>
                        <small>{{ ticket.created_at | date:'short' }}</small>
                      </td>
                      <td>
                        <div class="btn-group-vertical btn-group-sm">
                          <!-- Assign to me button (only for unassigned tickets) -->
                          <button
                            *ngIf="ticket.status === 'open' && !ticket.assigned_to"
                            class="btn btn-success btn-sm mb-1"
                            (click)="assignTicketToMe(ticket)"
                            [disabled]="isAssigning === ticket.id"
                            title="Assign to me"
                          >
                            <span *ngIf="isAssigning === ticket.id" class="spinner-border spinner-border-sm mr-1"></span>
                            <i class="fas fa-hand-paper"></i> Take
                          </button>

                          <!-- View/Reply button (for assigned tickets) -->
                          <button
                            *ngIf="ticket.assigned_to === currentUserId && ticket.status !== 'closed'"
                            class="btn btn-primary btn-sm mb-1"
                            (click)="openTicketModal(ticket)"
                            title="View and reply"
                          >
                            <i class="fas fa-reply"></i> Reply
                          </button>

                          <!-- Close button (for assigned tickets) -->
                          <button
                            *ngIf="ticket.assigned_to === currentUserId && ticket.status !== 'closed'"
                            class="btn btn-danger btn-sm"
                            (click)="openCloseModal(ticket)"
                            title="Close ticket"
                          >
                            <i class="fas fa-times"></i> Close
                          </button>

                          <!-- View only for other users' tickets or closed tickets -->
                          <button
                            *ngIf="(ticket.assigned_to && ticket.assigned_to !== currentUserId) || ticket.status === 'closed'"
                            class="btn btn-outline-info btn-sm"
                            (click)="openTicketModal(ticket)"
                            title="View ticket"
                          >
                            <i class="fas fa-eye"></i> View
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr *ngIf="filteredTickets.length === 0">
                      <td colspan="8" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <br>
                        No tickets found for the selected filter
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Details Modal -->
    <div class="modal fade" id="ticketModal" tabindex="-1" *ngIf="selectedTicket">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Ticket #{{ selectedTicket.id }} - {{ selectedTicket.customer_name }}
              <span class="badge ml-2" [ngClass]="{
                'bg-warning text-dark': selectedTicket.status === 'open',
                'bg-info': selectedTicket.status === 'assigned',
                'bg-primary': selectedTicket.status === 'in_progress',
                'bg-success': selectedTicket.status === 'closed'
              }">
                {{ getStatusLabel(selectedTicket.status) }}
              </span>
            </h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <!-- Ticket Info -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <strong>Original Message</strong>
                <small class="float-end">{{ selectedTicket.created_at | date:'medium' }}</small>
              </div>
              <div class="card-body">
                <p><strong>Customer:</strong> {{ selectedTicket.customer_name }}</p>
                <p><strong>Phone:</strong> {{ selectedTicket.phone_number }}</p>
                <p><strong>Message:</strong></p>
                <div class="alert alert-light">{{ selectedTicket.message }}</div>
              </div>
            </div>

            <!-- Conversation History -->
            <div class="card mb-3" *ngIf="selectedTicket.replies && selectedTicket.replies.length > 0">
              <div class="card-header bg-light">
                <strong>Conversation History</strong>
              </div>
              <div class="card-body p-0">
                <div class="conversation-history" style="max-height: 300px; overflow-y: auto;">
                  <div *ngFor="let reply of selectedTicket.replies"
                       class="reply-message p-3 border-bottom"
                       [ngClass]="reply.is_from_customer ? 'bg-light' : 'bg-primary bg-opacity-10'">
                    <div class="d-flex justify-content-between align-items-start">
                      <div class="flex-grow-1">
                        <strong>{{ reply.is_from_customer ? selectedTicket.customer_name : reply.user_name }}</strong>
                        <small class="text-muted ml-2">{{ reply.created_at | date:'short' }}</small>
                        <div class="mt-1">{{ reply.message }}</div>
                        <small *ngIf="!reply.is_from_customer && reply.whatsapp_sent" class="text-success">
                          <i class="fab fa-whatsapp"></i> Sent to WhatsApp
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reply Form -->
            <div class="card" *ngIf="canReply()">
              <div class="card-header bg-light">
                <strong>Send Reply</strong>
              </div>
              <div class="card-body">
                <form (ngSubmit)="sendReply()" #replyForm="ngForm">
                  <div class="mb-3">
                    <textarea
                      class="form-control"
                      rows="3"
                      placeholder="Type your reply here..."
                      [(ngModel)]="replyMessage"
                      name="replyMessage"
                      required
                      #replyTextarea="ngModel"
                    ></textarea>
                  </div>
                  <div class="d-flex justify-content-between">
                    <small class="text-muted">
                      <i class="fab fa-whatsapp text-success"></i>
                      This reply will be sent to the customer via WhatsApp
                    </small>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="!replyForm.valid || isSendingReply"
                    >
                      <span *ngIf="isSendingReply" class="spinner-border spinner-border-sm mr-1"></span>
                      <i class="fas fa-paper-plane mr-1"></i>
                      Send Reply
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Close Ticket Modal -->
    <div class="modal fade" id="closeModal" tabindex="-1" *ngIf="ticketToClose">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Close Ticket #{{ ticketToClose.id }}</h5>
            <button type="button" class="btn-close" (click)="closeCloseModal()"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="closeTicket()" #closeForm="ngForm">
              <div class="mb-3">
                <label for="resolutionNote" class="form-label">Resolution Note (Optional)</label>
                <textarea
                  class="form-control"
                  id="resolutionNote"
                  rows="3"
                  placeholder="Describe how the issue was resolved..."
                  [(ngModel)]="resolutionNote"
                  name="resolutionNote"
                ></textarea>
              </div>
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" (click)="closeCloseModal()">Cancel</button>
                <button
                  type="submit"
                  class="btn btn-danger"
                  [disabled]="isClosingTicket"
                >
                  <span *ngIf="isClosingTicket" class="spinner-border spinner-border-sm mr-1"></span>
                  <i class="fas fa-times mr-1"></i>
                  Close Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .message-preview {
      max-width: 200px;
      word-wrap: break-word;
    }

    .conversation-history {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
    }

    .reply-message {
      border-bottom: 1px solid #e9ecef;
    }

    .reply-message:last-child {
      border-bottom: none;
    }

    .btn-group-vertical .btn {
      margin-bottom: 2px;
    }

    .modal {
      display: block;
      background-color: rgba(0,0,0,0.5);
    }
  `]
})
export class TicketListComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  selectedFilter: string = 'all';
  isLoading = false;

  // Modal states
  selectedTicket: Ticket | null = null;
  ticketToClose: Ticket | null = null;
  replyMessage = '';
  resolutionNote = '';

  // Loading states
  isAssigning: number | null = null;
  isSendingReply = false;
  isClosingTicket = false;

  // User info
  currentUserId: number;

  // Counts for badges
  openCount = 0;
  myTicketsCount = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private ticketsService: TicketsService,
    private authService: AuthService,
    private socketService: SocketService
  ) {
    this.currentUserId = this.authService.getCurrentUser()?.id || 0;
  }

  ngOnInit(): void {
    this.loadTickets();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTickets(): void {
    this.isLoading = true;

    this.subscriptions.push(
      this.ticketsService.getTickets().subscribe({
        next: (tickets) => {
          this.tickets = tickets;
          this.updateCounts();
          this.applyFilter();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading tickets:', error);
          this.isLoading = false;
        }
      })
    );
  }

  filterTickets(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  private applyFilter(): void {
    switch (this.selectedFilter) {
      case 'open':
        this.filteredTickets = this.tickets.filter(t => t.status === 'open' && !t.assigned_to);
        break;
      case 'assigned':
        this.filteredTickets = this.tickets.filter(t => t.assigned_to === this.currentUserId);
        break;
      default:
        this.filteredTickets = [...this.tickets];
    }
  }

  private updateCounts(): void {
    this.openCount = this.tickets.filter(t => t.status === 'open' && !t.assigned_to).length;
    this.myTicketsCount = this.tickets.filter(t => t.assigned_to === this.currentUserId).length;
  }

  assignTicketToMe(ticket: Ticket): void {
    this.isAssigning = ticket.id;

    this.subscriptions.push(
      this.ticketsService.assignTicketToMe(ticket.id).subscribe({
        next: (updatedTicket) => {
          // Update the ticket in the list
          const index = this.tickets.findIndex(t => t.id === ticket.id);
          if (index !== -1) {
            this.tickets[index] = updatedTicket;
            this.updateCounts();
            this.applyFilter();
          }
          this.isAssigning = null;
        },
        error: (error) => {
          console.error('Error assigning ticket:', error);
          this.isAssigning = null;
          // Show error message to user
          alert('Failed to assign ticket: ' + (error.error?.error || 'Unknown error'));
        }
      })
    );
  }

  openTicketModal(ticket: Ticket): void {
    // Load full ticket details with replies
    this.subscriptions.push(
      this.ticketsService.getTicketById(ticket.id).subscribe({
        next: (fullTicket) => {
          this.selectedTicket = fullTicket;
          // Show modal (you can use Bootstrap modal or Angular CDK)
        },
        error: (error) => {
          console.error('Error loading ticket details:', error);
        }
      })
    );
  }

  sendReply(): void {
    if (!this.selectedTicket || !this.replyMessage.trim()) return;

    this.isSendingReply = true;

    this.subscriptions.push(
      this.ticketsService.replyToTicket(this.selectedTicket.id, { message: this.replyMessage }).subscribe({
        next: (reply) => {
          // Add reply to the conversation
          if (!this.selectedTicket!.replies) {
            this.selectedTicket!.replies = [];
          }
          this.selectedTicket!.replies.push(reply);

          // Update ticket status
          this.selectedTicket!.status = 'in_progress';

          // Update in main list
          const index = this.tickets.findIndex(t => t.id === this.selectedTicket!.id);
          if (index !== -1) {
            this.tickets[index].status = 'in_progress';
          }

          this.replyMessage = '';
          this.isSendingReply = false;
          this.applyFilter();
        },
        error: (error) => {
          console.error('Error sending reply:', error);
          this.isSendingReply = false;
          alert('Failed to send reply: ' + (error.error?.error || 'Unknown error'));
        }
      })
    );
  }

  openCloseModal(ticket: Ticket): void {
    this.ticketToClose = ticket;
    this.resolutionNote = '';
  }

  closeTicket(): void {
    if (!this.ticketToClose) return;

    this.isClosingTicket = true;

    this.subscriptions.push(
      this.ticketsService.closeTicket(this.ticketToClose.id, { resolution_note: this.resolutionNote }).subscribe({
        next: (closedTicket) => {
          // Update ticket in list
          const index = this.tickets.findIndex(t => t.id === this.ticketToClose!.id);
          if (index !== -1) {
            this.tickets[index] = closedTicket;
          }

          this.updateCounts();
          this.applyFilter();
          this.closeCloseModal();
          this.isClosingTicket = false;
        },
        error: (error) => {
          console.error('Error closing ticket:', error);
          this.isClosingTicket = false;
          alert('Failed to close ticket: ' + (error.error?.error || 'Unknown error'));
        }
      })
    );
  }

  closeModal(): void {
    this.selectedTicket = null;
    this.replyMessage = '';
  }

  closeCloseModal(): void {
    this.ticketToClose = null;
    this.resolutionNote = '';
  }

  canReply(): boolean {
    return this.selectedTicket?.assigned_to === this.currentUserId &&
           this.selectedTicket?.status !== 'closed';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'open': 'Available',
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'closed': 'Closed'
    };
    return labels[status] || status;
  }

  private setupSocketListeners(): void {
    this.socketService.connect();

    // Listen for new tickets
    this.subscriptions.push(
      this.socketService.onNewTicket().subscribe((ticket) => {
        this.tickets.unshift(ticket);
        this.updateCounts();
        this.applyFilter();
      })
    );

    // Listen for ticket assignments
    this.subscriptions.push(
      this.socketService.on('ticket_assigned').subscribe((ticket) => {
        const index = this.tickets.findIndex(t => t.id === ticket.id);
        if (index !== -1) {
          this.tickets[index] = ticket;
          this.updateCounts();
          this.applyFilter();
        }
      })
    );

    // Listen for ticket replies
    this.subscriptions.push(
      this.socketService.on('ticket_reply').subscribe((data) => {
        if (this.selectedTicket && this.selectedTicket.id === data.ticketId) {
          if (!this.selectedTicket.replies) {
            this.selectedTicket.replies = [];
          }
          this.selectedTicket.replies.push(data.reply);
        }
      })
    );

    // Listen for ticket closures
    this.subscriptions.push(
      this.socketService.on('ticket_closed').subscribe((ticket) => {
        const index = this.tickets.findIndex(t => t.id === ticket.id);
        if (index !== -1) {
          this.tickets[index] = ticket;
          this.updateCounts();
          this.applyFilter();
        }

        if (this.selectedTicket && this.selectedTicket.id === ticket.id) {
          this.selectedTicket = ticket;
        }
      })
    );
  }
}
