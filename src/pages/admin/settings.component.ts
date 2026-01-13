import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-black mb-8 font-serif">Admin Settings</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Branding Settings -->
        <div class="bg-white border border-gray-200 rounded-sm shadow-sm p-8">
           <h2 class="text-xl font-bold text-black mb-6">Branding & Logo</h2>
           <p class="text-sm text-gray-500 mb-6">Upload a logo to replace the default ONYX text across the entire application (Navbar, Footer, Admin Sidebar, Login).</p>
           
           <div class="mb-6">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Current Logo</label>
              <div class="p-6 bg-gray-50 border border-gray-200 flex items-center justify-center min-h-[120px] rounded relative">
                 @if (settingsService.logo()) {
                    <img [src]="settingsService.logo()" class="max-h-16 w-auto object-contain">
                    <button (click)="removeLogo()" class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 bg-white rounded-full shadow-sm border border-gray-200" title="Remove Logo">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                 } @else {
                    <span class="text-gray-400 text-sm font-serif italic">Using Default ONYX Brand</span>
                 }
              </div>
           </div>

           <div>
              <label class="block w-full cursor-pointer">
                 <span class="sr-only">Choose logo</span>
                 <input type="file" (change)="onFileSelected($event)" accept="image/*" class="block w-full text-sm text-gray-500
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-sm file:border-0
                    file:text-xs file:font-bold file:uppercase file:tracking-widest
                    file:bg-black file:text-white
                    file:cursor-pointer hover:file:bg-gray-800
                 "/>
              </label>
              <p class="mt-2 text-[10px] text-gray-400">Recommended: PNG with transparent background. Max size 2MB.</p>
           </div>
        </div>

        <!-- Security Settings -->
        <div class="bg-white border border-gray-200 rounded-sm shadow-sm p-8">
           <h2 class="text-xl font-bold text-black mb-6">Security</h2>
           
           <div class="bg-yellow-50 border border-yellow-100 p-4 rounded mb-6 text-sm text-yellow-800">
              For security reasons, changing your password requires your current credentials.
           </div>

           <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div>
                 <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Username</label>
                 <input type="text" formControlName="username" class="w-full border border-gray-300 p-3 rounded-sm focus:border-black focus:ring-black bg-white text-black placeholder-black">
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Old Password</label>
                    <input type="password" formControlName="oldPassword" class="w-full border border-gray-300 p-3 rounded-sm focus:border-black focus:ring-black bg-white text-black placeholder-black">
                 </div>
                 <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">New Password</label>
                    <input type="password" formControlName="newPassword" class="w-full border border-gray-300 p-3 rounded-sm focus:border-black focus:ring-black bg-white text-black placeholder-black">
                 </div>
              </div>

              <div class="pt-4">
                 <button type="submit" [disabled]="passwordForm.invalid" class="w-full px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
                   Update Password
                 </button>
              </div>
           </form>
        </div>

      </div>
    </div>
  `
})
export class AdminSettingsComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  settingsService = inject(SettingsService);

  passwordForm = this.fb.group({
    username: ['', Validators.required],
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
         this.toastService.show('Image is too large (Max 2MB)', 'error');
         return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.settingsService.updateLogo(result);
        this.toastService.show('Logo updated across system', 'success');
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
     this.settingsService.updateLogo(null);
     this.toastService.show('Restored default branding', 'info');
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const { username, oldPassword, newPassword } = this.passwordForm.value;
      const result = this.authService.changePassword(username!, oldPassword!, newPassword!);
      
      if (result.success) {
        this.toastService.show(result.message, 'success');
        this.passwordForm.reset();
      } else {
        this.toastService.show(result.message, 'error');
      }
    }
  }
}
