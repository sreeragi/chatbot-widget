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
  userName: string = 'Guest';  // 👈 added

  @ViewChild('body') body!: ElementRef;
  
  constructor(
    private router: Router, 
    private http: HttpClient,
    private appService: AppService,
  ) {}

  ngOnInit() {
    // ✅ Listen for Aadhaar app sending userId via postMessage
    window.addEventListener('message', (event) => {
      if (event.origin !== 'http://localhost:4200') return;

      const data = event.data;
      if (data?.userId) {
        this.userId = Number(data.userId);
        sessionStorage.setItem('userId', this.userId.toString());
        this.loadStyles();
        this.loadUserName();   // 👈 fetch username
      }
    });

    // ✅ fallback: get from sessionStorage if already saved
    const savedId = sessionStorage.getItem('userId');
    if (savedId) {
      this.userId = Number(savedId);
      this.loadStyles();
      this.loadUserName();   // 👈 fetch username
    }

    this.messages.push({ text: 'Welcome! How can I help you today?', isUser: false });

    // Listen for style updates from other components
    this.appService.stylesUpdated$.subscribe(() => {
      this.loadStyles();
    });
  }

  private loadStyles() {
    if (!this.userId) {
      this.applyStyles(this.getDefaultStyles());
      return;
    }
    this.appService.getStyles(this.userId).subscribe({
      next: (dbStyles: any) => {
        if (dbStyles) this.applyStyles(dbStyles);
      },
      error: () => {
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

  // 👇 NEW: Fetch username from Aadhaar API
  private loadUserName() {
    if (!this.userId) return;

    this.http.get<{ name: string }>(`https://your-adhar-server.com/api/users/${this.userId}`)
      .subscribe({
        next: (res) => {
          if (res?.name) {
            this.userName = res.name;
          }
        },
        error: (err) => {
          console.error('❌ Failed to load user name:', err);
        }
      });
  }

  openSettings() {
    this.router.navigate(['/style-editor']);
  }

  sendMessage() {
    const t = this.userMessage?.trim();
    if (!t) return;

    this.messages.push({ text: t, isUser: true });
    this.scrollToBottom();
    this.isTyping = true;

    this.appService.sendAiMessage(t, this.userId).subscribe({
      next: (res) => {
        this.messages.push({ text: res.reply, isUser: false });
        this.isTyping = false;
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({ text: "Oops, I couldn't reply right now.", isUser: false });
        this.isTyping = false;
      }
    });

    this.userMessage = '';
  }

  scrollToBottom() {
    setTimeout(() => {
      try {
        const el = this.body.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch {}
    }, 50);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
