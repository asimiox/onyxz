
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <a routerLink="/" class="inline-block mb-8">
           @if (settingsService.logo()) {
             <img [src]="settingsService.logo()" class="h-20 w-auto object-contain mx-auto" alt="Logo">
           } @else {
             <span class="font-serif text-5xl font-bold text-white tracking-tighter">ONYX</span>
           }
        </a>
        <h2 class="font-bold text-white uppercase tracking-[0.2em] text-sm mt-4">Reset Password</h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-12 px-6 shadow-2xl sm:rounded-sm sm:px-12">
          <p class="text-sm text-gray-500 mb-6 text-center leading-relaxed">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>

          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="email" class="block text-xs font-bold text-black uppercase tracking-widest mb-2">Email Address</label>
              <div class="mt-1">
                <input 
                  id="email" 
                  type="email" 
                  formControlName="email" 
                  class="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-black focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-none bg-white text-black"
                  placeholder="you@example.com"
                >
                @if(forgotForm.get('email')?.touched && forgotForm.get('email')?.invalid) {
                   <p class="text-xs text-red-500 mt-1">Please enter a valid email address.</p>
                }
              </div>
            </div>

            <div class="pt-2">
              <button type="submit" [disabled]="forgotForm.invalid || isSubmitting" class="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none transition-all uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSubmitting ? 'Sending...' : 'Send Reset Link' }}
              </button>
            </div>
            
            <div class="text-center mt-6">
              <a routerLink="/login" class="font-bold text-black hover:underline uppercase text-xs tracking-wide">Back to Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private router = inject(Router);
  settingsService = inject(SettingsService);

  isSubmitting = false;

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isSubmitting = true;
      
      // Simulate network request
      setTimeout(() => {
        this.isSubmitting = false;
        this.toastService.show('If an account exists, a reset link has been sent.', 'success');
        this.router.navigate(['/login']);
      }, 1500);
    } else {
      this.toastService.show('Please enter a valid email address.', 'error');
    }
  }
}
