
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="font-serif text-center text-3xl font-bold text-white">Admin Portal</h2>
        <p class="mt-2 text-center text-sm text-slate-400">
          Restricted Access
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-slate-800 py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-slate-700">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="username" class="block text-sm font-medium text-slate-300">Username</label>
              <div class="mt-1">
                <input id="username" type="text" formControlName="username" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black sm:text-sm">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-300">Password</label>
              <div class="mt-1">
                <input id="password" type="password" formControlName="password" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black sm:text-sm">
              </div>
            </div>

            <div>
              <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500">
                Access Dashboard
              </button>
            </div>
            
            @if (errorMessage) {
              <div class="text-red-400 text-sm text-center mt-2">{{ errorMessage }}</div>
            }
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
  private fb: FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  errorMessage = '';

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      if (this.authService.login(username!, password!)) {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
           this.errorMessage = 'Unauthorized Access';
        }
      } else {
        this.errorMessage = 'Invalid credentials';
      }
    }
  }
}
