import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppService {
  private readonly apiUrl = 'https://chatbot-server-3-31wb.onrender.com/api';

  public stylesUpdated$ = new Subject<any>();

  constructor(private http: HttpClient) {}

  // Helper to normalize userId to a number
  private normalizeUserId(userId?: string | number): number | undefined {
    if (userId === undefined || userId === null) return undefined;
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return isNaN(id) ? undefined : id;
  }

  getStyles(userId: string | number) {
    const id = this.normalizeUserId(userId);
    if (id === undefined) throw new Error(`Invalid userId: ${userId}`);
    return this.http.get(`${this.apiUrl}/styles?userId=${id}`);
  }

  saveStyles(userId: string | number, styles: any) {
    const id = this.normalizeUserId(userId);
    if (id === undefined) throw new Error(`Invalid userId: ${userId}`);
    return this.http.post(`${this.apiUrl}/styles`, { userId: id, ...styles }).pipe(
      tap((savedStyles: any) => {
        this.stylesUpdated$.next(savedStyles);
      })
    );
  }

  getUser(userId: number) {
  return this.http.get(`http://localhost:3000/api/users/${userId}`);
}


  sendAiMessage(message: string, userId?: string | number) {
    const id = this.normalizeUserId(userId);
    return this.http.post<{ reply: string }>(`${this.apiUrl}/chat`, {
      message,
      userId: id
    });
  }
}
