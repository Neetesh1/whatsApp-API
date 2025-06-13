import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Ticket {
  id: number;
  customer_name: string;
  phone_number: string;
  subject: string;
  message: string;
  status: 'open' | 'assigned' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  assigned_user_name?: string;
  assigned_at?: string;
  closed_by?: number;
  closed_by_name?: string;
  closed_at?: string;
  resolution_note?: string;
  from_whatsapp: boolean;
  last_reply_at?: string;
  created_at: string;
  updated_at: string;
  reply_count?: number;
  replies?: TicketReply[];
}

export interface TicketReply {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name: string;
  message: string;
  sent_to_whatsapp: boolean;
  whatsapp_sent: boolean;
  is_from_customer: boolean;
  created_at: string;
}

export interface CreateTicketRequest {
  customer_name: string;
  phone_number: string;
  message: string;
  from_whatsapp?: boolean;
}

export interface ReplyRequest {
  message: string;
}

export interface CloseTicketRequest {
  resolution_note?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  // Get tickets (filtered based on user permissions)
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  // Get tickets by status
  getTicketsByStatus(status: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/status/${status}`);
  }

  // Get single ticket with replies
  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  // Create ticket (usually from WhatsApp webhook)
  createTicket(ticket: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  // Assign ticket to current user
  assignTicketToMe(ticketId: number): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/${ticketId}/assign`, {});
  }

  // Reply to ticket (saves to DB and sends to WhatsApp)
  replyToTicket(ticketId: number, reply: ReplyRequest): Observable<TicketReply> {
    return this.http.post<TicketReply>(`${this.apiUrl}/${ticketId}/reply`, reply);
  }

  // Close ticket
  closeTicket(ticketId: number, closeRequest: CloseTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/${ticketId}/close`, closeRequest);
  }

  // Reopen ticket (admin only)
  reopenTicket(ticketId: number): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/${ticketId}/reopen`, {});
  }
}
