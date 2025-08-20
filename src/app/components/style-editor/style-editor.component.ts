import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../api.service';

@Component({
  selector: 'app-style-editor',
  templateUrl: './style-editor.component.html',
  styleUrls: ['./style-editor.component.css'],
  imports:[CommonModule, FormsModule]
})
export class StyleEditorComponent {
  private readonly apiUrl = 'http://localhost:3000/api';
  userId: number = 0;

  styles: any = {
    header_bg: '#3498db',
    bot_message_bg: '#ffffff',
    user_message_bg: '#3498db',
    button_bg: '#3498db',
    font_family: 'Arial',
    theme: 'light'
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private appService: AppService
  ) {}

  ngOnInit() {
    // ✅ Listen for userId from Aadhaar app
    window.addEventListener('message', (event) => {
      if (
        event.origin !== 'http://localhost:4200' &&
        event.origin !== 'https://your-adhar-app.com'
      ) return;

      if (event.data?.userId) {
        this.userId = Number(event.data.userId);
        sessionStorage.setItem('userId', this.userId.toString());
        this.loadStyles();
      }
    });

    // ✅ fallback: check sessionStorage if already set
    const savedId = sessionStorage.getItem('userId');
    if (savedId) {
      this.userId = Number(savedId);
      this.loadStyles();
    }

    // ✅ Listen for live style updates
    this.appService.stylesUpdated$.subscribe((newStyles) => {
      this.applyStyles(newStyles);
    });
  }

  private loadStyles() {
    if (!this.userId) {
      console.warn("⚠️ No userId available, applying defaults.");
      this.applyStyles(this.getDefaultStyles());
      return;
    }

    // Try sessionStorage first
    const savedStyles = sessionStorage.getItem(`chatbotStyles_${this.userId}`);
    if (savedStyles) {
      this.applyStyles(JSON.parse(savedStyles));
    }

    // Then fetch from server
    this.appService.getStyles(this.userId).subscribe({
      next: (styles: any) => {
        this.applyStyles(styles);
        sessionStorage.setItem(`chatbotStyles_${this.userId}`, JSON.stringify(styles));
      },
      error: (err) => {
        console.error('❌ Failed to load styles:', err);
        this.applyStyles(this.getDefaultStyles());
      }
    });
  }

  private getDefaultStyles() {
    return {
      header_bg: '#3498db',
      bot_message_bg: '#ffffff',
      user_message_bg: '#3498db',
      button_bg: '#3498db',
      font_family: 'Arial',
      theme: 'light'
    };
  }

  applyStyles(style: any) {
    this.styles = style;
    document.documentElement.style.setProperty('--header-bg', style.header_bg || '#3498db');
    document.documentElement.style.setProperty('--bot-msg-bg', style.bot_message_bg || '#ffffff');
    document.documentElement.style.setProperty('--user-msg-bg', style.user_message_bg || '#3498db');
    document.documentElement.style.setProperty('--button-bg', style.button_bg || '#3498db');
    document.documentElement.style.setProperty('--font-family', style.font_family || 'Arial');
    document.body.classList.toggle('dark-theme', style.theme === 'dark');
  }

  updatePreview() {
    // Preview handled automatically by bindings
  }

  getPreviewStyles() {
    return {
      '--header-bg': this.styles.header_bg,
      '--bot-msg-bg': this.styles.bot_message_bg,
      '--user-msg-bg': this.styles.user_message_bg,
      '--button-bg': this.styles.button_bg,
      '--font-family': this.styles.font_family,
      '--theme': this.styles.theme === 'dark' ? '#333' : '#f5f5f5'
    };
  }

  // ✅ Save styles to DB for this user
  saveStyles() {
    if (!this.userId) {
      console.error("❌ No userId found, cannot save styles!");
      alert("Please login from Aadhaar app first.");
      return;
    }

    const payload = {
      userId: this.userId,
      header_bg: this.styles.header_bg,
      bot_message_bg: this.styles.bot_message_bg,
      user_message_bg: this.styles.user_message_bg,
      button_bg: this.styles.button_bg,
      font_family: this.styles.font_family,
      theme: this.styles.theme
    };

    this.appService.saveStyles(this.userId, payload).subscribe({
      next: (savedStyles) => {
        sessionStorage.setItem(`chatbotStyles_${this.userId}`, JSON.stringify(savedStyles));
        console.log("✅ Styles saved to DB and sessionStorage");
        this.router.navigate(['/chatbot']);
      },
      error: (err) => {
        console.error("❌ Failed to save styles:", err);
      }
    });
  }

  continueEditing() {
    // Stay on the editor
  }
}
