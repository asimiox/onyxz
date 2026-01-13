
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-login',
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
        <h2 class="font-bold text-white uppercase tracking-[0.2em] text-sm mt-4">Account Login</h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-12 px-6 shadow-2xl sm:rounded-sm sm:px-12">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="username" class="block text-xs font-bold text-black uppercase tracking-widest mb-2">Username or Email</label>
              <div class="mt-1">
                <input 
                  id="username" 
                  type="text" 
                  formControlName="username" 
                  class="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-black focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-none bg-white text-black"
                >
              </div>
            </div>

            <div>
              <label for="password" class="block text-xs font-bold text-black uppercase tracking-widest mb-2">Password</label>
              <div class="mt-1">
                <input 
                  id="password" 
                  type="password" 
                  formControlName="password" 
                  class="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-black focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-none bg-white text-black"
                >
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input id="remember-me" type="checkbox" class="h-4 w-4 text-black focus:ring-black border-gray-300 rounded-none">
                <label for="remember-me" class="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>

              <div class="text-sm">
                <a routerLink="/forgot-password" class="font-medium text-gray-500 hover:text-black transition-colors">Forgot password?</a>
              </div>
            </div>

            <div class="pt-4">
              <button type="submit" class="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none transition-all uppercase tracking-[0.2em]">
                Sign in
              </button>
            </div>
            
            <div class="text-center mt-6">
              <p class="text-sm text-gray-500">Don't have an account? <a routerLink="/signup" class="font-bold text-black hover:underline uppercase text-xs tracking-wide">Join Us</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb: FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  settingsService = inject(SettingsService);
  router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      
      const result = this.authService.login(username!, password!);
      
      if (result.success) {
        const currentUser = this.authService.currentUser();
        const successMsg = currentUser ? `Logged in Successfully as ${currentUser.name}` : result.message;
        
        this.toastService.show(successMsg, 'success');
        
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/profile']);
        }
      } else {
        this.toastService.show(result.message, 'error');
      }
    } else {
      this.toastService.show('Please fill in all fields', 'error');
    }
  }
}
