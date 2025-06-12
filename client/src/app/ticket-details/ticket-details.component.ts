import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TicketDetailsComponent implements OnInit {
  ticket: any;
  replies: any[] = [];
  replyText: string = '';
  ticketId: number | null = null;
  userRole: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.ticketId = +id;
        this.fetchTicketDetails();
      }
    });
    this.loadUserRole();
  }

  loadUserRole() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userRole = payload.role || 'user';
      } catch (e) {
        console.error('Error decoding token:', e);
        this.userRole = 'user';
      }
    }
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'open':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'responded':
        return 'info';
      case 'closed':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  fetchTicketDetails() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('No authentication token found. Please login again.', 'Error');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    if (this.ticketId !== null) {
      this.http.get(`http://localhost:3000/api/tickets/${this.ticketId}`, { headers }).subscribe({
        next: (response: any) => {
          this.ticket = response.ticket;
          this.replies = response.replies || [];
        },
        error: (error) => {
          this.toastr.error('Failed to fetch ticket details. Please try again.', 'Error');
          console.error('Error fetching ticket details:', error);
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
    }
  }

  submitReply() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('No authentication token found. Please login again.', 'Error');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.replyText || this.ticketId === null) {
      this.toastr.warning('Please enter a reply text.', 'Warning');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const replyData = {
      reply: this.replyText
    };

    this.http.post(`http://localhost:3000/api/tickets/${this.ticketId}/reply`, replyData, { headers }).subscribe({
      next: (response: any) => {
        this.toastr.success('Reply sent successfully', 'Success');
        this.replyText = '';
        this.replies.push(response);
        // Emit event via socket if needed, assuming server handles it
      },
      error: (error) => {
        this.toastr.error('Failed to send reply. Please try again.', 'Error');
        console.error('Error sending reply:', error);
      }
    });
  }

  closeTicket() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('No authentication token found. Please login again.', 'Error');
      this.router.navigate(['/login']);
      return;
    }

    if (this.ticketId === null) {
      this.toastr.warning('Invalid ticket ID.', 'Warning');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`http://localhost:3000/api/tickets/${this.ticketId}/close`, {}, { headers }).subscribe({
      next: (response: any) => {
        this.toastr.success('Ticket closed successfully', 'Success');
        this.ticket = response;
        // Emit event via socket if needed, assuming server handles it
      },
      error: (error) => {
        this.toastr.error('Failed to close ticket. Please try again.', 'Error');
        console.error('Error closing ticket:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    localStorage.removeItem('token');
    this.toastr.success('Logged out successfully', 'Success');
    this.router.navigate(['/login']);
  }
}
