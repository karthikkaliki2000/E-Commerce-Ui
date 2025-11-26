import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {

  private baseUrl = 'http://localhost:9090/scheduler';


  constructor(private http: HttpClient) {}

  updateCron(taskName: string, cronExpression: string): Observable<string> {
    const payload = { taskName, cronExpression };
    return this.http.post(`${this.baseUrl}/update-cron`, payload, { responseType: 'text' });
  }

  stopTask(taskName: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/stop?taskName=${encodeURIComponent(taskName)}`, null, { responseType: 'text' });
  }

  checkStatus(taskName: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/status?taskName=${encodeURIComponent(taskName)}`, { responseType: 'text' });
  }

  getAllCrons(): Observable<{ [key: string]: string }> {
    return this.http.get<{ [key: string]: string }>(`${this.baseUrl}/all-crons`);
  }
}
