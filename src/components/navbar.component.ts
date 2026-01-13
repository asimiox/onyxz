
import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { CurrencyService } from '../services/currency.service';
import { ProductService } from '../services/product.service';
import { SettingsService } from '../services/settings.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { PricePipe } from '../pipes/price.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, CommonModule, NgOptimizedImage, PricePipe],
  template: `
    <!-- Top Bar -->
    <div class="bg-slate-900 text-white text-xs py-2 px-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <p class="hidden sm:block text-slate-300">Free Worldwide Shipping on orders over $50</p>
        <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
           <!-- Currency -->
           <select 
              [ngModel]="currencyService.currentCurrency()" 
              (ngModelChange)="currencyService.setCurrency($event)"
              class="bg-slate-900 text-slate-300 border-none text-xs focus:ring-0 cursor-pointer p-0">
              <option value="USD">USD ($)</option>
              <option value="PKR">PKR (Rs)</option>
              <option value="INR">INR (₹)</option>
            </select>

            <div class="flex items-center gap-3">
              @if (authService.isAuthenticated()) {
                <a routerLink="/profile" class="hover:text-white transition-colors">Account</a>
              } @else {
                <a routerLink="/login" class="hover:text-white transition-colors">Sign In</a>
                <span class="text-slate-600">|</span>
                <a routerLink="/signup" class="hover:text-white transition-colors">Register</a>
              }
            </div>
        </div>
      </div>
    </div>

    <!-- Main Navbar -->
    <nav class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center gap-8">
          
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <a routerLink="/" class="group flex items-center gap-2">
              @if (settingsService.logo()) {
                 <img [src]="settingsService.logo()" class="h-10 w-auto object-contain" alt="Logo">
              } @else {
                 <!-- Default ONYX Brand -->
                 <svg class="h-8 w-8 text-slate-900 group-hover:text-slate-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 12l-2.5-2.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
                 </svg>
                 <span class="font-serif text-2xl font-bold tracking-tight text-slate-900">
                   ONYX
                 </span>
              }
            </a>
          </div>

          <!-- Desktop Nav -->
          <div class="hidden md:flex space-x-8 flex-shrink-0">
            <a routerLink="/" routerLinkActive="text-blue-600" [routerLinkActiveOptions]="{exact: true}" class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Home</a>
            <a routerLink="/shop" routerLinkActive="text-blue-600" class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Shop</a>
            <a [routerLink]="['/shop']" [queryParams]="{category: 'Men'}" class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Men</a>
            <a [routerLink]="['/shop']" [queryParams]="{category: 'Women'}" class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Women</a>
            <a routerLink="/lookbook" routerLinkActive="text-blue-600" class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Lookbook</a>
          </div>

          <!-- Search Bar (Center/Right) -->
          <div class="flex-1 max-w-md hidden md:block relative">
             <div class="relative">
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery"
                  (focus)="isSearchFocused.set(true)"
                  (blur)="onSearchBlur()"
                  placeholder="Search products..." 
                  class="w-full bg-white border border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-black placeholder-black"
                >
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
             </div>

             <!-- Instant Results Dropdown -->
             @if (searchQuery() && isSearchFocused()) {
                <div class="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                   @if (searchResults().length > 0) {
                      <div class="max-h-80 overflow-y-auto py-2">
                         <div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Products</div>
                         @for (product of searchResults(); track product.id) {
                            <a [routerLink]="['/product', product.id]" (click)="searchQuery.set('')" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                               <img [src]="product.image" class="w-10 h-12 object-cover rounded" [alt]="product.name">
                               <div class="flex-1 min-w-0">
                                  <p class="text-sm font-bold text-gray-900 truncate">{{ product.name }}</p>
                                  <p class="text-xs text-gray-500">{{ product.brand }}</p>
                               </div>
                               <span class="text-sm font-bold text-black">{{ product.price | price }}</span>
                            </a>
                         }
                      </div>
                   } @else {
                      <div class="p-6 text-center">
                         <p class="text-gray-500 text-sm mb-2">No results for "{{ searchQuery() }}"</p>
                         <p class="text-xs text-gray-400 uppercase tracking-wide font-bold">Try Searching For:</p>
                         <div class="flex flex-wrap justify-center gap-2 mt-2">
                            <button (click)="searchQuery.set('Shoes')" class="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Shoes</button>
                            <button (click)="searchQuery.set('Denim')" class="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Denim</button>
                            <button (click)="searchQuery.set('Bag')" class="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Bags</button>
                         </div>
                      </div>
                   }
                </div>
             }
          </div>

          <!-- Icons -->
          <div class="flex items-center gap-4 flex-shrink-0">
            <a routerLink="/cart" class="group flex items-center p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              @if (cartCount() > 0) {
                <span class="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">{{ cartCount() }}</span>
              }
            </a>

            <!-- Mobile Menu Button -->
            <button (click)="isMobileMenuOpen.set(!isMobileMenuOpen())" class="md:hidden p-2 text-slate-400 hover:text-slate-600">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Search (Visible only on mobile) -->
      <div class="md:hidden px-4 pb-4">
         <div class="relative">
             <input type="text" [(ngModel)]="searchQuery" placeholder="Search products..." class="w-full bg-white border border-gray-200 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-black text-black placeholder-black">
             <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </div>
         </div>
          <!-- Instant Results Dropdown Mobile -->
          @if (searchQuery()) {
            <div class="mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
               @if (searchResults().length > 0) {
                  <div class="max-h-60 overflow-y-auto">
                     @for (product of searchResults(); track product.id) {
                        <a [routerLink]="['/product', product.id]" (click)="searchQuery.set('')" class="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                           <img [src]="product.image" class="w-10 h-12 object-cover rounded" [alt]="product.name">
                           <div class="flex-1 min-w-0">
                              <p class="text-sm font-bold text-gray-900 truncate">{{ product.name }}</p>
                              <span class="text-xs font-bold text-blue-600">{{ product.price | price }}</span>
                           </div>
                        </a>
                     }
                  </div>
               }
            </div>
          }
      </div>

      <!-- Mobile Menu -->
      @if (isMobileMenuOpen()) {
        <div class="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top-5 duration-200">
           <div class="px-4 pt-4 pb-6 space-y-2">
             <a (click)="isMobileMenuOpen.set(false)" routerLink="/" class="block px-3 py-3 rounded-lg text-base font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50">Home</a>
             <a (click)="isMobileMenuOpen.set(false)" routerLink="/shop" class="block px-3 py-3 rounded-lg text-base font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50">Shop</a>
             <a (click)="isMobileMenuOpen.set(false)" [routerLink]="['/shop']" [queryParams]="{category: 'Men'}" class="block px-3 py-3 rounded-lg text-base font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50">Men</a>
             <a (click)="isMobileMenuOpen.set(false)" [routerLink]="['/shop']" [queryParams]="{category: 'Women'}" class="block px-3 py-3 rounded-lg text-base font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50">Women</a>
             <a (click)="isMobileMenuOpen.set(false)" routerLink="/lookbook" class="block px-3 py-3 rounded-lg text-base font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50">Lookbook</a>
           </div>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  currencyService = inject(CurrencyService);
  productService = inject(ProductService);
  settingsService = inject(SettingsService);
  router = inject(Router);
  
  cartCount = this.cartService.totalItems;
  isMobileMenuOpen = signal(false);
  
  // Search Logic
  searchQuery = signal('');
  isSearchFocused = signal(false);
  
  allProducts = this.productService.getAllProducts();

  searchResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    
    return this.allProducts()
      .filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query))
      .slice(0, 5); // Limit to 5 instant results
  });

  onSearchBlur() {
    // Delay hiding to allow click event on result to register
    setTimeout(() => {
      this.isSearchFocused.set(false);
    }, 200);
  }
}
