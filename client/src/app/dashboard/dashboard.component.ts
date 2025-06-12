import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { io } from 'socket.io-client';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DashboardComponent implements OnInit, OnDestroy {
  tickets: any[] = [];
  private socket: any;
  private socketSubscription: Subscription | undefined;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.fetchTickets();
    this.setupSocketConnection();
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  fetchTickets() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('No authentication token found. Please login again.', 'Error');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get('http://localhost:3000/api/tickets', { headers }).subscribe({
      next: (response: any) => {
        this.tickets = response;
      },
      error: (error) => {
        this.toastr.error('Failed to fetch tickets. Please try again.', 'Error');
        console.error('Error fetching tickets:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  setupSocketConnection() {
    this.socket = io('http://localhost:3000');
    this.socket.on('newTicket', (ticket: any) => {
      this.tickets.unshift(ticket);
      this.toastr.info('New ticket received', 'New Ticket');
    });
    this.socket.on('ticketUpdated', (updatedTicket: any) => {
      const index = this.tickets.findIndex(t => t.id === updatedTicket.id);
      if (index !== -1) {
        this.tickets[index] = updatedTicket;
        this.toastr.info(`Ticket ${updatedTicket.id} updated`, 'Ticket Update');
      }
    });
  }

  viewTicket(id: number) {
    this.router.navigate(['/ticket', id]);
  }

  assignTicket(id: number) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('No authentication token found. Please login again.', 'Error');
      this.router.navigate(['/login']);
      return;
    }

    // Assuming user ID is stored in the token or can be fetched from a user service
    // For simplicity, using a placeholder user ID 1
    const userId = 1;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`http://localhost:3000/api/tickets/${id}/assign`, { userId }, { headers }).subscribe({
      next: (response: any) => {
        this.toastr.success(`Ticket ${id} assigned to you`, 'Success');
        const index = this.tickets.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tickets[index] = response;
        }
      },
      error: (error) => {
        this.toastr.error('Failed to assign ticket. Please try again.', 'Error');
        console.error('Error assigning ticket:', error);
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.toastr.success('Logged out successfully', 'Success');
    this.router.navigate(['/login']);
  }
}
