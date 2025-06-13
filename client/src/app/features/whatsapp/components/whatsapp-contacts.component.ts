import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastMessageTime: string;
  status: 'online' | 'offline' | 'typing';
  avatar?: string;
  unreadCount: number;
}

@Component({
  selector: 'app-whatsapp-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-address-book mr-2"></i>
              WhatsApp Contacts
            </h3>
            <div class="card-tools">
              <div class="input-group input-group-sm" style="width: 200px;">
                <input type="text" name="contact_search" class="form-control float-right"
                       placeholder="Search contacts..." [(ngModel)]="searchTerm" (input)="applyFilter()">
                <div class="input-group-append">
                  <button type="submit" class="btn btn-default">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-4">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Status</span>
                  </div>
                  <select class="form-control" [(ngModel)]="filterStatus" (change)="applyFilter()">
                    <option value="">All Statuses</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="typing">Typing</option>
                  </select>
                </div>
              </div>

              <div class="col-md-4">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Sort By</span>
                  </div>
                  <select class="form-control" [(ngModel)]="sortBy" (change)="applySorting()">
                    <option value="name">Name</option>
                    <option value="lastMessage">Last Message</option>
                    <option value="unreadCount">Unread Count</option>
                  </select>
                </div>
              </div>

              <div class="col-md-4 text-right">
                <button class="btn btn-success" (click)="addNewContact()">
                  <i class="fas fa-plus mr-1"></i> Add Contact
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Last Message</th>
                    <th>Status</th>
                    <th>Unread</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let contact of filteredContacts">
                    <td>
                      <div class="d-flex align-items-center">
                        <img [src]="contact.avatar || getDefaultAvatar()"
                             class="img-circle img-size-32 mr-2" alt="Contact Avatar">
                        <div>
                          <strong>{{ contact.name }}</strong>
                          <br>
                          <small class="text-muted">{{ contact.lastMessageTime }}</small>
                        </div>
                      </div>
                    </td>
                    <td>{{ contact.phone }}</td>
                    <td>
                      <div class="text-truncate" style="max-width: 200px;">
                        {{ contact.lastMessage }}
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="getStatusBadgeClass(contact.status)">
                        <i [class]="getStatusIcon(contact.status)" class="mr-1"></i>
                        {{ contact.status | titlecase }}
                      </span>
                    </td>
                    <td>
                      <span *ngIf="contact.unreadCount > 0" class="badge badge-danger">
                        {{ contact.unreadCount }}
                      </span>
                      <span *ngIf="contact.unreadCount === 0" class="text-muted">-</span>
                    </td>
                    <td>
                      <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-primary"
                                (click)="openChat(contact)" title="Open Chat">
                          <i class="fab fa-whatsapp"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-info"
                                (click)="viewContact(contact)" title="View Details">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-warning"
                                (click)="editContact(contact)" title="Edit">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-danger"
                                (click)="deleteContact(contact)" title="Delete">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div *ngIf="filteredContacts.length === 0" class="text-center py-4">
              <i class="fas fa-address-book fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">No contacts found</h4>
              <p class="text-muted">Try adjusting your search criteria or add a new contact.</p>
            </div>
          </div>

          <div class="card-footer clearfix">
            <div class="float-left">
              Showing {{ filteredContacts.length }} of {{ contacts.length }} contacts
            </div>
            <ul class="pagination pagination-sm m-0 float-right">
              <li class="page-item"><a class="page-link" href="#">«</a></li>
              <li class="page-item"><a class="page-link" href="#">1</a></li>
              <li class="page-item"><a class="page-link" href="#">2</a></li>
              <li class="page-item"><a class="page-link" href="#">3</a></li>
              <li class="page-item"><a class="page-link" href="#">»</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .img-size-32 {
      width: 32px;
      height: 32px;
    }
  `]
})
export class WhatsappContactsComponent implements OnInit {
  contacts: Contact[] = [
    {
      id: '1',
      name: 'John Doe',
      phone: '+1234567890',
      lastMessage: 'Hello, I need help with my order',
      lastMessageTime: '2 minutes ago',
      status: 'online',
      avatar: 'https://adminlte.io/themes/v3/dist/img/user1-128x128.jpg',
      unreadCount: 2
    },
    {
      id: '2',
      name: 'Jane Smith',
      phone: '+1234567891',
      lastMessage: 'Thank you for your help!',
      lastMessageTime: '1 hour ago',
      status: 'offline',
      avatar: 'https://adminlte.io/themes/v3/dist/img/user3-128x128.jpg',
      unreadCount: 0
    },
    {
      id: '3',
      name: 'Bob Johnson',
      phone: '+1234567892',
      lastMessage: 'When will my order arrive?',
      lastMessageTime: '3 hours ago',
      status: 'typing',
      unreadCount: 1
    },
    {
      id: '4',
      name: 'Alice Brown',
      phone: '+1234567893',
      lastMessage: 'Great service, highly recommended!',
      lastMessageTime: '1 day ago',
      status: 'offline',
      avatar: 'https://adminlte.io/themes/v3/dist/img/user4-128x128.jpg',
      unreadCount: 0
    },
    {
      id: '5',
      name: 'Charlie Wilson',
      phone: '+1234567894',
      lastMessage: 'Can you send me the invoice?',
      lastMessageTime: '2 days ago',
      status: 'online',
      unreadCount: 3
    }
  ];

  filteredContacts: Contact[] = [];
  searchTerm: string = '';
  filterStatus: string = '';
  sortBy: string = 'name';

  constructor() { }

  ngOnInit(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredContacts = this.contacts.filter(contact => {
      // Apply search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        if (!contact.name.toLowerCase().includes(searchLower) &&
            !contact.phone.includes(searchLower)) {
          return false;
        }
      }

      // Apply status filter
      if (this.filterStatus && contact.status !== this.filterStatus) {
        return false;
      }

      return true;
    });

    this.applySorting();
  }

  applySorting(): void {
    this.filteredContacts.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastMessage':
          return new Date(a.lastMessageTime).getTime() - new Date(b.lastMessageTime).getTime();
        case 'unreadCount':
          return b.unreadCount - a.unreadCount;
        default:
          return 0;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'offline':
        return 'bg-secondary';
      case 'typing':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'online':
        return 'fas fa-circle';
      case 'offline':
        return 'far fa-circle';
      case 'typing':
        return 'fas fa-edit';
      default:
        return 'far fa-circle';
    }
  }

  getDefaultAvatar(): string {
    return 'https://adminlte.io/themes/v3/dist/img/user2-160x160.jpg';
  }

  openChat(contact: Contact): void {
    console.log('Opening chat with:', contact);
    // In a real app, this would open the chat interface
  }

  viewContact(contact: Contact): void {
    console.log('Viewing contact details:', contact);
    // In a real app, this would show contact details modal
  }

  editContact(contact: Contact): void {
    console.log('Editing contact:', contact);
    // In a real app, this would open edit contact modal/form
  }

  deleteContact(contact: Contact): void {
    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      const index = this.contacts.findIndex(c => c.id === contact.id);
      if (index !== -1) {
        this.contacts.splice(index, 1);
        this.applyFilter();
      }
    }
  }

  addNewContact(): void {
    console.log('Adding new contact');
    // In a real app, this would open add contact modal/form
  }
}
