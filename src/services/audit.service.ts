
import { Injectable, signal } from '@angular/core';

export interface AuditLog {
  id: number;
  timestamp: Date;
  user: string;
  action: string;
  details: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private logs = signal<AuditLog[]>([]);

  getLogs() {
    return this.logs;
  }

  logAction(user: string, action: string, details: string) {
    const newLog: AuditLog = {
      id: Date.now(),
      timestamp: new Date(),
      user,
      action,
      details
    };
    this.logs.update(logs => [newLog, ...logs]);
    
    // In a real enterprise app, this would send to a backend/Splunk/Datadog
    console.log(`[AUDIT] ${user} - ${action}: ${details}`);
  }
}
