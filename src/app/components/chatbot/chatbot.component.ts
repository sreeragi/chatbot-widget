import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../../api.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, OnDestroy {
  userMessage = '';
  messages: { text: string; isUser: boolean }[] = [];
  sub?: Subscription;
  styles: any = {};
  isTyping = false;
  userId: number = 0;

  @ViewChild('body') body!: ElementRef;
  
  constructor(
    private router: Router, 
    private http: HttpClient,
    private appService: AppService,
  ) {}

  ngOnInit() {
    // ✅ Listen for Aadhaar app sending userId via postMessage
    window.addEventListener('message', (event) => {
      // ⚠️ SECURITY: Replace with your Aadhaar app's actual origin
      if (event.origin !== 'http://localhost:4200') return;

      const data = event.data;
      if (data?.userId) {
        this.userId = Number(data.userId);
        localStorage.setItem('userId', this.userId.toString());
        this.loadStyles();
      }
    });

    // ✅ fallback: get from localStorage if already saved
    const savedId = localStorage.getItem('userId');
    if (savedId) {
      this.userId = Number(savedId);
      this.loadStyles();
    }

    this.messages.push({ text: 'Welcome! How can I help you today?', isUser: false });

    // Listen for style updates from other components
    this.appService.stylesUpdated$.subscribe(() => {
      this.loadStyles();
    });
  }

  private loadStyles() {
    if (!this.userId) {
      console.warn("No userId available, applying default styles.");
      this.applyStyles(this.getDefaultStyles());
      return;
    }

    // 1. Try localStorage first
    const savedStyles = localStorage.getItem(`chatbotStyles_${this.userId}`);
    if (savedStyles) {
      this.applyStyles(JSON.parse(savedStyles));
    }

    // 2. Fetch from server
    this.appService.getStyles(this.userId).subscribe({
      next: (dbStyles: any) => {
        if (dbStyles) {
          this.applyStyles(dbStyles);
          // Update localStorage with fresh DB data
          localStorage.setItem(`chatbotStyles_${this.userId}`, JSON.stringify(dbStyles));
        }
      },
      error: (err) => {
        console.error('Failed to load styles:', err);
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
    document.documentElement.style.setProperty('--header-bg', style.header_bg || '#3498db');
    document.documentElement.style.setProperty('--bot-msg-bg', style.bot_message_bg || '#ffffff');
    document.documentElement.style.setProperty('--user-msg-bg', style.user_message_bg || '#3498db');
    document.documentElement.style.setProperty('--button-bg', style.button_bg || '#3498db');
    document.documentElement.style.setProperty('--font-family', style.font_family || 'Arial');
  }

  openSettings() {
    this.router.navigate(['/style-editor']);
  }

  closeChat() {
    console.log('Chat closed');
  }

  sendMessage() {
    const t = this.userMessage?.trim();
    if (!t) return;

    // Add user's message locally
    this.messages.push({ text: t, isUser: true });
    this.scrollToBottom();

    // Show typing indicator
    this.isTyping = true;

    // Get userId from localStorage (or Aadhaar flow)
    const userId = localStorage.getItem('userId') || undefined;

    // Send message to AI
    this.appService.sendAiMessage(t, userId).subscribe({
      next: (res) => {
        this.messages.push({ text: res.reply, isUser: false });
        this.isTyping = false;
        this.scrollToBottom();
      },
      error: (err) => {
        this.messages.push({ text: "Oops, I couldn't reply right now.", isUser: false });
        this.isTyping = false;
        console.error(err);
      }
    });

    // Clear input
    this.userMessage = '';
  }

  scrollToBottom() {
    setTimeout(() => {
      try {
        const el = this.body.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch (err) {}
    }, 50);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
