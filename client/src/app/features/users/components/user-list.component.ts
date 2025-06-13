import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">User Management</h3>
        <div class="card-tools">
          <button type="button" class="btn btn-primary btn-sm" [routerLink]="['/users/create']">
            <i class="fas fa-user-plus"></i> Add New User
          </button>
        </div>
      </div>
      <div class="card-body table-responsive p-0">
        <table class="table table-hover text-nowrap">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{user.id}}</td>
              <td>
                <img [src]="user.avatar" class="img-circle img-size-32 mr-2" alt="User Image">
                {{user.name}}
              </td>
              <td>{{user.email}}</td>
              <td><span class="badge" [ngClass]="getRoleBadgeClass(user.role)">{{user.role}}</span></td>
              <td><span class="badge" [ngClass]="getStatusBadgeClass(user.status)">{{user.status}}</span></td>
              <td>
                <button class="btn btn-info btn-sm mx-1">
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn btn-danger btn-sm mx-1">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class UserListComponent implements OnInit {
  users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'Active',
      avatar: 'https://adminlte.io/themes/v3/dist/img/user1-128x128.jpg'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Agent',
      status: 'Active',
      avatar: 'https://adminlte.io/themes/v3/dist/img/user3-128x128.jpg'
    },
    {
      id: 3,
      name: 'Robert Johnson',
      email: 'robert@example.com',
      role: 'Agent',
      status: 'Inactive',
      avatar: 'https://adminlte.io/themes/v3/dist/img/user4-128x128.jpg'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // In a real application, fetch users from an API
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'Admin':
        return 'bg-danger';
      case 'Agent':
        return 'bg-success';
      default:
        return 'bg-info';
    }
  }

  getStatusBadgeClass(status: string): string {
    return status === 'Active' ? 'bg-success' : 'bg-secondary';
  }
}
