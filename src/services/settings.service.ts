
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // Initialize with value from localStorage if available
  logo = signal<string | null>(localStorage.getItem('app_logo'));

  updateLogo(logoUrl: string | null) {
    this.logo.set(logoUrl);
    if (logoUrl) {
      localStorage.setItem('app_logo', logoUrl);
    } else {
      localStorage.removeItem('app_logo');
    }
  }

  getLogo() {
    return this.logo;
  }
}
