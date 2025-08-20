import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppService } from './api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  userId: number | null = null;

  constructor(private appService: AppService) {}

  ngOnInit() {
    // ✅ Load userId if already in sessionStorage (user refreshed chatbot iframe)
    const storedId = sessionStorage.getItem('userId');
    if (storedId) {
      this.userId = parseInt(storedId, 10);
      this.fetchUserStyles(this.userId);
    }

    // ✅ Listen for messages from Aadhaar app
    window.addEventListener('message', (event) => {
      // 🔒 Security check: only accept messages from Aadhaar app
      if (
        event.origin !== 'http://localhost:4200' && 
        event.origin !== 'https://your-adhar-app.com'
      ) {
        return;
      }

      if (event.data && event.data.userId) {
        this.userId = Number(event.data.userId);

        // Save in sessionStorage so chatbot can reuse after reload
        sessionStorage.setItem('userId', this.userId.toString());

        console.log('✅ Chatbot got userId:', this.userId);

        // Fetch styles for this user
        this.fetchUserStyles(this.userId);
      }
    });
  }

  private fetchUserStyles(userId: number) {
    this.appService.getStyles(userId).subscribe({
      next: (styles: any) => {
        console.log('✅ Loaded styles for user:', styles);

        // Notify other components in chatbot
        this.appService.stylesUpdated$.next(styles);
      },
      error: (err) => {
        console.error('❌ Error loading styles:', err);
      }
    });
  }
}
