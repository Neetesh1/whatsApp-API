import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components: TemplateComponent[];
  createdAt: string;
  updatedAt: string;
}

interface TemplateComponent {
  type: string;
  text?: string;
  format?: string;
  example?: any;
}

@Component({
  selector: 'app-message-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-comment-dots mr-2"></i>
              WhatsApp Message Templates
            </h3>
            <div class="card-tools">
              <div class="input-group input-group-sm" style="width: 150px;">
                <input type="text" name="table_search" class="form-control float-right" placeholder="Search"
                       [(ngModel)]="searchTerm" (input)="applyFilter()">
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
              <div class="col-md-3">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Category</span>
                  </div>
                  <select class="form-control" [(ngModel)]="filterCategory" (change)="applyFilter()">
                    <option value="">All Categories</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>
              </div>

              <div class="col-md-3">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Status</span>
                  </div>
                  <select class="form-control" [(ngModel)]="filterStatus" (change)="applyFilter()">
                    <option value="">All Statuses</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div class="col-md-3">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Language</span>
                  </div>
                  <select class="form-control" [(ngModel)]="filterLanguage" (change)="applyFilter()">
                    <option value="">All Languages</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="pt_BR">Portuguese</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>

              <div class="col-md-3 text-right">
                <button class="btn btn-primary" (click)="createNewTemplate()">
                  <i class="fas fa-plus mr-1"></i> New Template
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Content</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let template of filteredTemplates">
                    <td>{{ template.name }}</td>
                    <td>
                      <span class="badge" [ngClass]="getCategoryBadgeClass(template.category)">
                        {{ template.category }}
                      </span>
                    </td>
                    <td>{{ getLanguageName(template.language) }}</td>
                    <td>
                      <span class="badge" [ngClass]="getStatusBadgeClass(template.status)">
                        {{ template.status }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-info" (click)="viewTemplateContent(template)">
                        <i class="fas fa-eye mr-1"></i> View
                      </button>
                    </td>
                    <td>{{ template.createdAt }}</td>
                    <td>
                      <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-primary" (click)="sendTemplate(template)">
                          <i class="fas fa-paper-plane"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-warning" (click)="editTemplate(template)">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-danger" (click)="deleteTemplate(template)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card-footer clearfix">
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

    <!-- Template Preview Modal -->
    <div class="modal fade" id="template-preview-modal" tabindex="-1" *ngIf="selectedTemplate">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedTemplate.name }}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="card card-whatsapp">
              <div class="card-header bg-success">
                <h3 class="card-title">
                  <i class="fab fa-whatsapp mr-2"></i>
                  WhatsApp Message Preview
                </h3>
              </div>
              <div class="card-body bg-light">
                <div *ngFor="let component of selectedTemplate?.components">
                  <div *ngIf="component.type === 'HEADER'" class="mb-2 font-weight-bold">
                    {{ component.text }}
                  </div>
                  <div *ngIf="component.type === 'BODY'" class="mb-2">
                    {{ component.text }}
                  </div>
                  <div *ngIf="component.type === 'FOOTER'" class="text-muted small mt-3">
                    {{ component.text }}
                  </div>
                  <div *ngIf="component.type === 'BUTTONS'" class="mt-2">
                    <button *ngFor="let button of getComponentButtons(component)" class="btn btn-sm btn-outline-success mr-2">
                      {{ button.text }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" (click)="sendTemplate(selectedTemplate)">
              <i class="fas fa-paper-plane mr-1"></i> Send Test
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-whatsapp {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  `]
})
export class MessageTemplatesComponent implements OnInit {
  templates: Template[] = [
    {
      id: '123456',
      name: 'order_confirmation',
      category: 'UTILITY',
      language: 'en',
      status: 'APPROVED',
      components: [
        {
          type: 'HEADER',
          text: 'Order Confirmation'
        },
        {
          type: 'BODY',
          text: 'Hello {{1}}, your order #{{2}} has been confirmed and will be shipped on {{3}}. Thank you for shopping with us!'
        },
        {
          type: 'FOOTER',
          text: 'Reply to this message for any questions'
        }
      ],
      createdAt: '2023-05-15',
      updatedAt: '2023-05-15'
    },
    {
      id: '123457',
      name: 'appointment_reminder',
      category: 'UTILITY',
      language: 'en',
      status: 'APPROVED',
      components: [
        {
          type: 'HEADER',
          text: 'Appointment Reminder'
        },
        {
          type: 'BODY',
          text: 'Hello {{1}}, this is a reminder that you have an appointment scheduled for {{2}} at {{3}}. Please reply YES to confirm or NO to reschedule.'
        },
        {
          type: 'FOOTER',
          text: 'Thank you for your business'
        }
      ],
      createdAt: '2023-05-16',
      updatedAt: '2023-05-16'
    },
    {
      id: '123458',
      name: 'special_offer',
      category: 'MARKETING',
      language: 'en',
      status: 'PENDING',
      components: [
        {
          type: 'HEADER',
          text: 'Special Offer Inside!'
        },
        {
          type: 'BODY',
          text: 'Hello {{1}}, we have a special offer just for you! Get {{2}}% off your next purchase when you use code {{3}} at checkout. Offer valid until {{4}}.'
        },
        {
          type: 'FOOTER',
          text: 'You received this message because you opted into marketing messages'
        }
      ],
      createdAt: '2023-06-01',
      updatedAt: '2023-06-01'
    },
    {
      id: '123459',
      name: 'authentication_code',
      category: 'AUTHENTICATION',
      language: 'en',
      status: 'APPROVED',
      components: [
        {
          type: 'BODY',
          text: 'Your authentication code is {{1}}. This code expires in {{2}} minutes. Do not share this code with anyone.'
        }
      ],
      createdAt: '2023-04-10',
      updatedAt: '2023-04-10'
    },
    {
      id: '123460',
      name: 'confirmacion_pedido',
      category: 'UTILITY',
      language: 'es',
      status: 'APPROVED',
      components: [
        {
          type: 'HEADER',
          text: 'Confirmación de Pedido'
        },
        {
          type: 'BODY',
          text: 'Hola {{1}}, tu pedido #{{2}} ha sido confirmado y será enviado el {{3}}. ¡Gracias por comprar con nosotros!'
        },
        {
          type: 'FOOTER',
          text: 'Responde a este mensaje para cualquier pregunta'
        }
      ],
      createdAt: '2023-05-20',
      updatedAt: '2023-05-20'
    }
  ];

  filteredTemplates: Template[] = [];
  selectedTemplate: Template | null = null;

  // Filter properties
  searchTerm: string = '';
  filterCategory: string = '';
  filterStatus: string = '';
  filterLanguage: string = '';

  constructor() { }

  ngOnInit(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredTemplates = this.templates.filter(template => {
      // Apply search filter
      if (this.searchTerm && !template.name.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        return false;
      }

      // Apply category filter
      if (this.filterCategory && template.category !== this.filterCategory) {
        return false;
      }

      // Apply status filter
      if (this.filterStatus && template.status !== this.filterStatus) {
        return false;
      }

      // Apply language filter
      if (this.filterLanguage && template.language !== this.filterLanguage) {
        return false;
      }

      return true;
    });
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'MARKETING':
        return 'bg-purple';
      case 'UTILITY':
        return 'bg-info';
      case 'AUTHENTICATION':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-success';
      case 'PENDING':
        return 'bg-warning';
      case 'REJECTED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getLanguageName(code: string): string {
    const languages: {[key: string]: string} = {
      'en': 'English',
      'es': 'Spanish',
      'pt_BR': 'Portuguese (Brazil)',
      'fr': 'French'
    };

    return languages[code] || code;
  }

  viewTemplateContent(template: Template): void {
    this.selectedTemplate = template;
    // In a real app, you would show a modal with the template content
    console.log('Viewing template content:', template);
  }

  createNewTemplate(): void {
    // In a real app, you would navigate to a template creation page or show a modal
    console.log('Creating new template');
  }

  editTemplate(template: Template): void {
    // In a real app, you would navigate to a template edit page or show a modal
    console.log('Editing template:', template);
  }

  deleteTemplate(template: Template): void {
    // In a real app, you would confirm deletion and then remove the template
    console.log('Deleting template:', template);

    // For demonstration, just remove from the local array
    const index = this.templates.findIndex(t => t.id === template.id);
    if (index !== -1) {
      this.templates.splice(index, 1);
      this.applyFilter();
    }
  }

  sendTemplate(template: Template): void {
    // In a real app, you would open a modal to select recipients and send the template
    console.log('Sending template:', template);
  }

  getComponentButtons(component: TemplateComponent): any[] {
    // This method is used to access the buttons property of a component
    return (component as any).buttons || [];
  }
}
