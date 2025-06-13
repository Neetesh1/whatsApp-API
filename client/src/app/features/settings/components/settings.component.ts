import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="row">
      <!-- WhatsApp API Settings -->
      <div class="col-md-6">
        <div class="card card-primary">
          <div class="card-header">
            <h3 class="card-title">WhatsApp API Settings</h3>
          </div>
          <!-- form start -->
          <form [formGroup]="apiSettingsForm" (ngSubmit)="saveApiSettings()">
            <div class="card-body">
              <div class="form-group">
                <label for="apiKey">API Key</label>
                <input type="password" class="form-control" id="apiKey" placeholder="Enter WhatsApp API Key" formControlName="apiKey">
              </div>
              <div class="form-group">
                <label for="apiUrl">API URL</label>
                <input type="text" class="form-control" id="apiUrl" placeholder="Enter WhatsApp API URL" formControlName="apiUrl">
              </div>
              <div class="form-group">
                <label for="phoneNumberId">Phone Number ID</label>
                <input type="text" class="form-control" id="phoneNumberId" placeholder="Enter WhatsApp Phone Number ID" formControlName="phoneNumberId">
              </div>
              <div class="form-group">
                <div class="custom-control custom-switch">
                  <input type="checkbox" class="custom-control-input" id="autoReconnect" formControlName="autoReconnect">
                  <label class="custom-control-label" for="autoReconnect">Auto-reconnect on disconnect</label>
                </div>
              </div>
            </div>
            <!-- /.card-body -->
            <div class="card-footer">
              <button type="submit" class="btn btn-primary" [disabled]="apiSettingsForm.pristine">Save API Settings</button>
              <button type="button" class="btn btn-info ml-2" (click)="testConnection()">Test Connection</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="col-md-6">
        <div class="card card-success">
          <div class="card-header">
            <h3 class="card-title">Notification Settings</h3>
          </div>
          <!-- form start -->
          <form [formGroup]="notificationSettingsForm" (ngSubmit)="saveNotificationSettings()">
            <div class="card-body">
              <div class="form-group">
                <label>Email Notifications</label>
                <div class="custom-control custom-switch">
                  <input type="checkbox" class="custom-control-input" id="newTicketEmail" formControlName="newTicketEmail">
                  <label class="custom-control-label" for="newTicketEmail">New Ticket Created</label>
                </div>
                <div class="custom-control custom-switch">
                  <input type="checkbox" class="custom-control-input" id="ticketUpdateEmail" formControlName="ticketUpdateEmail">
                  <label class="custom-control-label" for="ticketUpdateEmail">Ticket Updated</label>
                </div>
                <div class="custom-control custom-switch">
                  <input type="checkbox" class="custom-control-input" id="ticketClosedEmail" formControlName="ticketClosedEmail">
                  <label class="custom-control-label" for="ticketClosedEmail">Ticket Closed</label>
                </div>
              </div>
              <div class="form-group">
                <label for="emailRecipients">Email Recipients</label>
                <input type="text" class="form-control" id="emailRecipients" placeholder="Enter comma-separated email addresses" formControlName="emailRecipients">
                <small class="form-text text-muted">Separate multiple email addresses with commas</small>
              </div>
              <div class="form-group">
                <label>Browser Notifications</label>
                <div class="custom-control custom-switch">
                  <input type="checkbox" class="custom-control-input" id="browserNotifications" formControlName="browserNotifications">
                  <label class="custom-control-label" for="browserNotifications">Enable Browser Notifications</label>
                </div>
              </div>
            </div>
            <!-- /.card-body -->
            <div class="card-footer">
              <button type="submit" class="btn btn-success" [disabled]="notificationSettingsForm.pristine">Save Notification Settings</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SettingsComponent implements OnInit {
  apiSettingsForm: FormGroup;
  notificationSettingsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.apiSettingsForm = this.fb.group({
      apiKey: ['', Validators.required],
      apiUrl: ['https://graph.facebook.com/v15.0', Validators.required],
      phoneNumberId: ['', Validators.required],
      autoReconnect: [true]
    });

    this.notificationSettingsForm = this.fb.group({
      newTicketEmail: [true],
      ticketUpdateEmail: [true],
      ticketClosedEmail: [false],
      emailRecipients: ['admin@example.com', [Validators.required, Validators.email]],
      browserNotifications: [true]
    });
  }

  ngOnInit(): void {
    // In a real application, you would load saved settings from a service/API
  }

  saveApiSettings(): void {
    if (this.apiSettingsForm.valid) {
      console.log('API Settings:', this.apiSettingsForm.value);
      // In a real app, you would call a service to save the settings
      alert('API Settings saved successfully!');
      this.apiSettingsForm.markAsPristine();
    }
  }

  saveNotificationSettings(): void {
    if (this.notificationSettingsForm.valid) {
      console.log('Notification Settings:', this.notificationSettingsForm.value);
      // In a real app, you would call a service to save the settings
      alert('Notification Settings saved successfully!');
      this.notificationSettingsForm.markAsPristine();
    }
  }

  testConnection(): void {
    if (this.apiSettingsForm.valid) {
      // In a real app, you would call a service to test the connection
      setTimeout(() => {
        alert('Connection successful!');
      }, 1000);
    } else {
      alert('Please fill in all required API settings first.');
    }
  }
}
