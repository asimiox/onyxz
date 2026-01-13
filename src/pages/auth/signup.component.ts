
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <a routerLink="/" class="inline-block mb-6">
           @if (settingsService.logo()) {
             <img [src]="settingsService.logo()" class="h-16 w-auto object-contain mx-auto" alt="Logo">
           } @else {
             <span class="font-serif text-4xl font-bold text-black tracking-tighter">ONYX</span>
           }
        </a>
        <h2 class="font-bold text-gray-900 text-sm uppercase tracking-widest">Create your account</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Already have an account? <a routerLink="/login" class="font-bold text-black hover:underline">Sign in</a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
              <div class="mt-1">
                <input id="name" type="text" formControlName="name" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black">
                @if(signupForm.get('name')?.touched && signupForm.get('name')?.invalid) {
                   <p class="text-xs text-red-500 mt-1">Full Name is required</p>
                }
              </div>
            </div>

            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
              <div class="mt-1">
                <input id="username" type="text" formControlName="username" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black">
                @if(signupForm.get('username')?.touched && signupForm.get('username')?.invalid) {
                   <p class="text-xs text-red-500 mt-1">Username is required</p>
                }
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <div class="mt-1">
                <input id="email" type="email" formControlName="email" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black">
                @if(signupForm.get('email')?.touched && signupForm.get('email')?.invalid) {
                   <p class="text-xs text-red-500 mt-1">Valid email is required</p>
                }
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <div class="mt-1">
                <input id="password" type="password" formControlName="password" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black">
                @if(signupForm.get('password')?.touched && signupForm.get('password')?.invalid) {
                   <p class="text-xs text-red-500 mt-1">Password must be at least 6 characters</p>
                }
              </div>
            </div>

            <div>
              <button type="submit" [disabled]="signupForm.invalid" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
  private fb: FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  settingsService = inject(SettingsService);
  router = inject(Router);

  signupForm = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.signupForm.valid) {
      const { name, username, email, password } = this.signupForm.value;
      const result = this.authService.signup(name!, username!, email!, password!);
      
      if (result.success) {
        this.toastService.show(`${name} registered Successfully`, 'success');
        this.router.navigate(['/profile']);
      } else {
        this.toastService.show(result.message, 'error');
      }
    } else {
      this.toastService.show('Please fix the errors in the form.', 'error');
    }
  }
}
