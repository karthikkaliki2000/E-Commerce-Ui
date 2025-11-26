import { Component } from '@angular/core';
import { SchedulerService } from '../_services/scheduler.service';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css']
})
export class SchedulerComponent {
  taskName = '';
  cronExpression = '';
  statusMessage = '';
  allCrons: { [key: string]: string } = {};

  constructor(private schedulerService: SchedulerService) {}

  updateCron(): void {
    this.schedulerService.updateCron(this.taskName, this.cronExpression).subscribe({
      next: (res: string) => this.statusMessage = `✅ ${res}`,
      error: err => {
        const msg = typeof err.error === 'string' ? err.error : err.message;
        this.statusMessage = `❌ Error while updating cron: ${msg}`;
      }
    });
  }

  stopTask(): void {
    this.schedulerService.stopTask(this.taskName).subscribe({
      next: (res: string) => this.statusMessage = `🛑 ${res}`,
      error: err => this.statusMessage = `❌ Error while stopping task: ${err.message}`
    });
  }

  checkStatus(): void {
    this.schedulerService.checkStatus(this.taskName).subscribe({
      next: (res: string) => this.statusMessage = `📋 ${res}`,
      error: err => this.statusMessage = `❌ Error while checking status: ${err.message}`
    });
  }

  loadAllCrons(): void {
    this.schedulerService.getAllCrons().subscribe({
      next: (data) => this.allCrons = data,
      error: err => this.statusMessage = `❌ Failed to load crons: ${err.message}`
    });
  }

  isValidCron(): boolean {
    const fields = this.cronExpression.trim().split(/\s+/);
    return this.taskName.trim() !== '' && fields.length === 6;
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
