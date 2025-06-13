import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'client';

  ngOnInit() {
    // Initialize Bootstrap dropdowns
    this.initializeBootstrap();
  }

  private initializeBootstrap() {
    // Load Bootstrap JS dynamically
    if (typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
      script.onload = () => {
        // Bootstrap is now loaded
        console.log('Bootstrap JS loaded');
      };
      document.head.appendChild(script);
    }
  }
}
