
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      <!-- Mobile Header -->
      <div class="md:hidden bg-black text-white p-4 flex justify-between items-center">
         @if (settingsService.logo()) {
             <img [src]="settingsService.logo()" class="h-8 w-auto object-contain invert brightness-0" alt="Logo">
         } @else {
             <span class="font-serif text-lg font-bold">ONYX Admin</span>
         }
        <button (click)="isSidebarOpen.set(!isSidebarOpen())" class="text-white">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      <!-- Sidebar -->
      <aside class="fixed inset-y-0 left-0 z-40 w-64 bg-black text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col"
             [class.-translate-x-full]="!isSidebarOpen()"
             [class.translate-x-0]="isSidebarOpen()">
        
        <div class="h-20 flex items-center px-8 border-b border-gray-900 hidden md:flex">
           @if (settingsService.logo()) {
             <!-- Use invert to make dark logos white if necessary, assuming logo might be black -->
             <!-- Better: display raw image. If user uploads black logo on black bg, it's their choice. Assuming standard usage. -->
             <img [src]="settingsService.logo()" class="h-10 w-auto object-contain" alt="Logo">
           } @else {
             <span class="font-serif text-2xl font-bold tracking-tight">ONYX</span>
           }
        </div>
        
        <nav class="flex-1 px-4 py-8 space-y-2">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-white text-black" (click)="closeMobile()" class="text-gray-400 hover:bg-gray-900 hover:text-white group flex items-center px-4 py-3 text-sm font-bold tracking-wide rounded-sm transition-colors uppercase">
            <svg class="mr-4 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="bg-white text-black" (click)="closeMobile()" class="text-gray-400 hover:bg-gray-900 hover:text-white group flex items-center px-4 py-3 text-sm font-bold tracking-wide rounded-sm transition-colors uppercase">
            <svg class="mr-4 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            Products
          </a>
          <a routerLink="/admin/categories" routerLinkActive="bg-white text-black" (click)="closeMobile()" class="text-gray-400 hover:bg-gray-900 hover:text-white group flex items-center px-4 py-3 text-sm font-bold tracking-wide rounded-sm transition-colors uppercase">
            <svg class="mr-4 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            Categories
          </a>
          <a routerLink="/admin/orders" routerLinkActive="bg-white text-black" (click)="closeMobile()" class="text-gray-400 hover:bg-gray-900 hover:text-white group flex items-center px-4 py-3 text-sm font-bold tracking-wide rounded-sm transition-colors uppercase">
            <svg class="mr-4 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Orders
          </a>
          <a routerLink="/admin/users" routerLinkActive="bg-white text-black" (click)="closeMobile()" class="text-gray-400 hover:bg-gray-900 hover:text-white group flex items-center px-4 py-3 text-sm font-bold tracking-wide rounded-sm transition-colors uppercase">
            <svg class="mr-4 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Users
          </a>
          <a routerLink="/admin/payments" routerLinkActive="bg-white text-black" (click)="closeMobile()" class="text-gray-400 hover:bg-gray-900 hover:text-white group flex items-center px-4 py-3 text-sm font-bold tracking-wide rounded-sm transition-colors uppercase">
            <svg class="mr-4 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Payments
          </a>
          <a routerLink="/admin/promotions" routerLinkActive="bg-white text-black" (click)="closeMobile()" class="text-gray-400 hover:bg-gray-900 hover:text-white group flex items-center px-4 py-3 text-sm font-bold tracking-wide rounded-sm transition-colors uppercase">
            <svg class="mr-4 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            Promotions
          </a>
          <a routerLink="/admin/settings" routerLinkActive="bg-white text-black" (click)="closeMobile()" class="text-gray-400 hover:bg-gray-900 hover:text-white group flex items-center px-4 py-3 text-sm font-bold tracking-wide rounded-sm transition-colors uppercase">
            <svg class="mr-4 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </a>
        </nav>

        <div class="px-4 py-6 border-t border-gray-900">
           <button (click)="authService.logout()" class="w-full flex items-center px-4 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-900 rounded-sm transition-colors uppercase tracking-wide">
             <svg class="mr-4 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             Logout
           </button>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      @if (isSidebarOpen()) {
        <div class="fixed inset-0 bg-black/50 z-30 md:hidden" (click)="isSidebarOpen.set(false)"></div>
      }

      <!-- Content -->
      <main class="flex-1 p-6 md:p-10 overflow-x-hidden">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  settingsService = inject(SettingsService);
  isSidebarOpen = signal(false);

  closeMobile() {
    this.isSidebarOpen.set(false);
  }
}
