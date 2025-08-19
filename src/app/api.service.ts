import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppService {
  private readonly apiUrl = 'https://chatbot-server-3-31wb.onrender.com/api';

  public stylesUpdated$ = new Subject<any>();

  constructor(private http: HttpClient) {}

  getStyles(userId: number) {
    return this.http.get(`${this.apiUrl}/styles?userId=${userId}`);
  }

  saveStyles(userId: number, styles: any) {
    return this.http.post(`${this.apiUrl}/styles`, { userId, ...styles }).pipe(
      tap((savedStyles: any) => {
        this.stylesUpdated$.next(savedStyles);
      })
    );
  }

  sendAiMessage(message: string, userId?: string | number) {
    return this.http.post<{ reply: string }>(`${this.apiUrl}/chat`, {
      message,
      userId
    });
  }
}