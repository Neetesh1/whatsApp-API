import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="card card-primary">
      <div class="card-header">
        <h3 class="card-title">Create New User</h3>
      </div>
      <!-- form start -->
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <div class="card-body">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" class="form-control" id="name" placeholder="Enter full name" formControlName="name">
            <div *ngIf="userForm.controls['name'].invalid && userForm.controls['name'].touched" class="text-danger">
              Name is required
            </div>
          </div>
          <div class="form-group">
            <label for="email">Email address</label>
            <input type="email" class="form-control" id="email" placeholder="Enter email" formControlName="email">
            <div *ngIf="userForm.controls['email'].invalid && userForm.controls['email'].touched" class="text-danger">
              Valid email is required
            </div>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control" id="password" placeholder="Password" formControlName="password">
            <div *ngIf="userForm.controls['password'].invalid && userForm.controls['password'].touched" class="text-danger">
              Password must be at least 6 characters
            </div>
          </div>
          <div class="form-group">
            <label for="role">Role</label>
            <select class="form-control" id="role" formControlName="role">
              <option value="Admin">Admin</option>
              <option value="Agent">Agent</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <div class="form-check">
              <input class="form-check-input" type="radio" id="active" value="Active" formControlName="status">
              <label class="form-check-label" for="active">Active</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" id="inactive" value="Inactive" formControlName="status">
              <label class="form-check-label" for="inactive">Inactive</label>
            </div>
          </div>
        </div>
        <!-- /.card-body -->

        <div class="card-footer">
          <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid">Create User</button>
          <button type="button" class="btn btn-default ml-2" [routerLink]="['/users/manage']">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class UserCreateComponent {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Agent', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      console.log('Form submitted:', this.userForm.value);
      // In a real app, you would call a service to create the user
      this.router.navigate(['/users/manage']);
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }
}
