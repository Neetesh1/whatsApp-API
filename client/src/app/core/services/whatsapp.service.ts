import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WhatsAppStatus {
  connected: boolean;
  phone_number?: string;
  connection_time?: string;
  last_activity?: string;
}

export interface MessageTemplate {
  id: number;
  name: string;
  content: string;
  category: string;
  language: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

export interface SendMessageRequest {
  phone_number: string;
  message: string;
  template_id?: number;
}

export interface Contact {
  id: number;
  name: string;
  phone_number: string;
  last_message_at?: string;
  status: 'active' | 'blocked';
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Connection status
  getConnectionStatus(): Observable<WhatsAppStatus> {
    return this.http.get<WhatsAppStatus>(`${this.apiUrl}/whatsapp/status`);
  }

  connectWhatsApp(): Observable<any> {
    return this.http.post(`${this.apiUrl}/whatsapp/connect`, {});
  }

  disconnectWhatsApp(): Observable<any> {
    return this.http.post(`${this.apiUrl}/whatsapp/disconnect`, {});
  }

  // Message operations
  sendMessage(request: SendMessageRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/whatsapp/send-message`, request);
  }

  getMessages(phoneNumber?: string): Observable<any[]> {
    const url = phoneNumber
      ? `${this.apiUrl}/whatsapp/messages?phone=${phoneNumber}`
      : `${this.apiUrl}/whatsapp/messages`;
    return this.http.get<any[]>(url);
  }

  // Template operations
  getTemplates(): Observable<MessageTemplate[]> {
    return this.http.get<MessageTemplate[]>(`${this.apiUrl}/whatsapp/templates`);
  }

  createTemplate(template: Partial<MessageTemplate>): Observable<MessageTemplate> {
    return this.http.post<MessageTemplate>(`${this.apiUrl}/whatsapp/templates`, template);
  }

  updateTemplate(id: number, template: Partial<MessageTemplate>): Observable<MessageTemplate> {
    return this.http.put<MessageTemplate>(`${this.apiUrl}/whatsapp/templates/${id}`, template);
  }

  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/whatsapp/templates/${id}`);
  }

  // Contact operations
  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/whatsapp/contacts`);
  }

  addContact(contact: Partial<Contact>): Observable<Contact> {
    return this.http.post<Contact>(`${this.apiUrl}/whatsapp/contacts`, contact);
  }

  updateContact(id: number, contact: Partial<Contact>): Observable<Contact> {
    return this.http.put<Contact>(`${this.apiUrl}/whatsapp/contacts/${id}`, contact);
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/whatsapp/contacts/${id}`);
  }

  blockContact(id: number): Observable<Contact> {
    return this.http.put<Contact>(`${this.apiUrl}/whatsapp/contacts/${id}/block`, {});
  }

  unblockContact(id: number): Observable<Contact> {
    return this.http.put<Contact>(`${this.apiUrl}/whatsapp/contacts/${id}/unblock`, {});
  }
}
