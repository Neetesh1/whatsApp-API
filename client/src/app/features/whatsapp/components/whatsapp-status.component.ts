import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ConnectionMetric {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  tooltip?: string;
}

@Component({
  selector: 'app-whatsapp-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fab fa-whatsapp text-success mr-2"></i>
              WhatsApp Connection Status
            </h3>
            <div class="card-tools">
              <button type="button" class="btn btn-sm btn-primary" (click)="refreshStatus()">
                <i class="fas fa-sync-alt mr-1"></i> Refresh
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-8">
                <div class="row">
                  <div class="col-md-6" *ngFor="let metric of connectionMetrics">
                    <div class="info-box" [ngClass]="'bg-' + metric.color">
                      <span class="info-box-icon"><i class="fas" [ngClass]="metric.icon"></i></span>
                      <div class="info-box-content">
                        <span class="info-box-text">{{ metric.title }}</span>
                        <span class="info-box-number">{{ metric.value }}</span>
                        <div class="progress">
                          <div class="progress-bar" style="width: 100%"></div>
                        </div>
                        <span class="progress-description" *ngIf="metric.tooltip">
                          {{ metric.tooltip }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-4">
                <div class="card card-outline" [ngClass]="connectionActive ? 'card-success' : 'card-danger'">
                  <div class="card-header">
                    <h3 class="card-title">WhatsApp API</h3>
                  </div>
                  <div class="card-body text-center">
                    <div class="mt-2 mb-3">
                      <i class="fas" [ngClass]="connectionActive ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'" style="font-size: 4rem;"></i>
                    </div>
                    <h4 [ngClass]="connectionActive ? 'text-success' : 'text-danger'">
                      {{ connectionActive ? 'Connected' : 'Disconnected' }}
                    </h4>
                    <p class="text-muted" *ngIf="connectionActive">
                      Connected since {{ connectionTime }}
                    </p>
                    <p class="text-danger" *ngIf="!connectionActive">
                      {{ disconnectionReason }}
                    </p>
                    <button class="btn btn-lg mt-3" [ngClass]="connectionActive ? 'btn-danger' : 'btn-success'" (click)="toggleConnection()">
                      {{ connectionActive ? 'Disconnect' : 'Connect' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="row mt-4">
              <div class="col-12">
                <div class="card card-primary card-outline">
                  <div class="card-header">
                    <h3 class="card-title">Connection Logs</h3>
                  </div>
                  <div class="card-body p-0">
                    <div class="table-responsive">
                      <table class="table m-0">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Event</th>
                            <th>Status</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let log of connectionLogs">
                            <td>{{ log.time }}</td>
                            <td>{{ log.event }}</td>
                            <td>
                              <span class="badge" [ngClass]="log.status === 'Success' ? 'bg-success' : 'bg-danger'">
                                {{ log.status }}
                              </span>
                            </td>
                            <td>{{ log.details }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class WhatsappStatusComponent implements OnInit {
  connectionActive: boolean = true;
  connectionTime: string = 'June 12, 2023 09:45 AM';
  disconnectionReason: string = 'API Key expired or invalid';

  connectionMetrics: ConnectionMetric[] = [
    {
      title: 'Messages Sent (Today)',
      value: 354,
      icon: 'fa-paper-plane',
      color: 'info'
    },
    {
      title: 'Messages Received (Today)',
      value: 432,
      icon: 'fa-inbox',
      color: 'success'
    },
    {
      title: 'Failed Messages (Today)',
      value: 12,
      icon: 'fa-exclamation-triangle',
      color: 'danger',
      tooltip: '3.4% failure rate'
    },
    {
      title: 'Active Sessions',
      value: 28,
      icon: 'fa-users',
      color: 'warning'
    }
  ];

  connectionLogs = [
    {
      time: '2023-06-12 09:45:23',
      event: 'Connection Established',
      status: 'Success',
      details: 'WhatsApp API connection established successfully'
    },
    {
      time: '2023-06-12 09:44:58',
      event: 'Authentication',
      status: 'Success',
      details: 'Authenticated with WhatsApp Business API'
    },
    {
      time: '2023-06-12 09:44:45',
      event: 'Connection Attempt',
      status: 'Success',
      details: 'Attempting to connect to WhatsApp Business API'
    },
    {
      time: '2023-06-11 18:30:12',
      event: 'Disconnection',
      status: 'Error',
      details: 'Connection closed due to inactivity'
    },
    {
      time: '2023-06-11 09:15:45',
      event: 'Connection Established',
      status: 'Success',
      details: 'WhatsApp API connection established successfully'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // In a real application, you would fetch the connection status from a service
  }

  refreshStatus(): void {
    // In a real application, you would call a service to refresh the connection status
    console.log('Refreshing WhatsApp connection status...');
    // For demonstration, just show a temporary "refresh" message
    this.connectionMetrics[0].value = Math.floor(Math.random() * 100) + 300; // Random update to the metrics
    this.connectionMetrics[1].value = Math.floor(Math.random() * 100) + 400;
    this.connectionMetrics[2].value = Math.floor(Math.random() * 20);
  }

  toggleConnection(): void {
    // In a real application, you would call a service to connect/disconnect
    this.connectionActive = !this.connectionActive;

    if (this.connectionActive) {
      // Add a new log entry for connection
      const now = new Date();
      this.connectionTime = now.toLocaleString();
      this.connectionLogs.unshift({
        time: now.toISOString().replace('T', ' ').substring(0, 19),
        event: 'Connection Established',
        status: 'Success',
        details: 'WhatsApp API connection established manually'
      });
    } else {
      // Add a new log entry for disconnection
      const now = new Date();
      this.connectionLogs.unshift({
        time: now.toISOString().replace('T', ' ').substring(0, 19),
        event: 'Disconnection',
        status: 'Success',
        details: 'WhatsApp API disconnected manually'
      });
    }
  }
}
