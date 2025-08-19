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
  userId: number = 0;

  constructor(private appService: AppService) {}

  ngOnInit() {
    window.addEventListener('message', (event) => {
      // ✅ Security check: only allow messages from Aadhaar app
      if (
        event.origin !== 'http://localhost:4200' && 
        event.origin !== 'https://your-adhar-app.com'
      ) {
        return;
      }

      if (event.data && event.data.userId) {
        this.userId = event.data.userId;
        console.log('✅ Chatbot got userId:', this.userId);
        // now you can use this.userId for API calls inside chatbot
        this.appService.getStyles(this.userId).subscribe(styles => {
          console.log('✅ Loaded styles for user:', styles);
        });
      }
    });
  }
}
