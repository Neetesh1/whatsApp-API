import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="row">
      <div class="col-lg-3 col-6">
        <div class="small-box bg-info">
          <div class="inner">
            <h3>150</h3>
            <p><i class="fas fa-ticket-alt"></i> Total Tickets</p>
          </div>
          <div class="icon">

          </div>
          <a routerLink="/tickets" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-success">
          <div class="inner">
            <h3>53</h3>
            <p><i class="fas fa-envelope-open"></i> Open Tickets</p>
          </div>
          <div class="icon">

          </div>
          <a routerLink="/tickets/open" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-warning">
          <div class="inner">
            <h3>44</h3>
            <p><i class="fab fa-whatsapp"></i> Messages Today</p>
          </div>
          <div class="icon">

          </div>
          <a routerLink="/whatsapp/status" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-danger">
          <div class="inner">
            <h3>12</h3>
            <p><i class="fas fa-exclamation-triangle"></i> Failed Messages</p>
          </div>
          <div class="icon">

          </div>
          <a routerLink="/whatsapp/status" class="small-box-footer">
            More info <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Tickets</h3>
          </div>
          <div class="card-body p-0">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#001</td>
                  <td>John Doe</td>
                  <td>Order Issue</td>
                  <td><span class="badge bg-warning">Open</span></td>
                  <td>2023-06-12</td>
                </tr>
                <tr>
                  <td>#002</td>
                  <td>Jane Smith</td>
                  <td>Delivery Question</td>
                  <td><span class="badge bg-success">Resolved</span></td>
                  <td>2023-06-11</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Quick Actions</h3>
          </div>
          <div class="card-body">
            <a routerLink="/tickets/create" class="btn btn-success btn-block mb-2">
              <i class="fas fa-plus mr-2"></i>
              Create New Ticket
            </a>
            <a routerLink="/whatsapp/templates" class="btn btn-info btn-block mb-2">
              <i class="fas fa-file-alt mr-2"></i>
              Message Templates
            </a>
            <a routerLink="/settings" class="btn btn-secondary btn-block">
              <i class="fas fa-cog mr-2"></i>
              System Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .small-box {
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    .card {
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
  `]
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
