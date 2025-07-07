import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OllamaChatService {
  private apiUrl = 'http://localhost:9090/api/ollama/ask';

  constructor(private http: HttpClient) {}

  askOllama(message: string, history: string[] = []): Observable<string> {
    return this.http.post(this.apiUrl, { message, history }, { responseType: 'text' });
  }
} 