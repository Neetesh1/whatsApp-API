import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl, {
      autoConnect: false
    });
  }

  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // Generic event listeners
  on(event: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(event, (data: any) => observer.next(data));
    });
  }

  // Generic event emitter
  emit(event: string, data?: any): void {
    this.socket.emit(event, data);
  }

  // WhatsApp specific events
  onWhatsAppMessage(): Observable<any> {
    return this.on('whatsapp_message');
  }

  onWhatsAppStatusChange(): Observable<any> {
    return this.on('whatsapp_status_change');
  }

  onTicketUpdate(): Observable<any> {
    return this.on('ticket_update');
  }

  onNewTicket(): Observable<any> {
    return this.on('new_ticket');
  }

  // Join specific rooms for targeted updates
  joinRoom(room: string): void {
    this.emit('join_room', room);
  }

  leaveRoom(room: string): void {
    this.emit('leave_room', room);
  }

  // Connection status
  isConnected(): boolean {
    return this.socket.connected;
  }

  onConnect(): Observable<void> {
    return this.on('connect');
  }

  onDisconnect(): Observable<void> {
    return this.on('disconnect');
  }
}
