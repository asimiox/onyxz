
import { Component, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product';
import { PricePipe } from '../pipes/price.pipe';
import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, PricePipe, CommonModule],
  template: `
    <div class="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      
      <!-- Image Container -->
      <div class="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
        <img 
          [src]="product().image" 
          [alt]="product().name"
          class="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        <!-- Wishlist Button -->
        <button 
          (click)="toggleWishlist($event)"
          class="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all active:scale-95"
          [class.text-red-500]="isWishlisted()"
          [class.text-gray-400]="!isWishlisted()">
          <svg class="w-5 h-5" [class.fill-current]="isWishlisted()" [class.fill-none]="!isWishlisted()" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </button>

        <!-- Quick Action Overlay -->
        <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
            <a [routerLink]="['/product', product().id]" class="bg-white text-slate-900 px-6 py-3 rounded-full font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-slate-50 pointer-events-auto">
              View Product
            </a>
        </div>

        <!-- Badges -->
        <div class="absolute top-3 left-3 flex flex-col gap-2 z-10">
          @if(product().badge) {
             <span class="text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wide"
               [class.bg-red-600]="isRedBadge(product().badge!)"
               [class.bg-green-600]="isGreenBadge(product().badge!)"
               [class.bg-black]="!isRedBadge(product().badge!) && !isGreenBadge(product().badge!)">
               {{ product().badge }}
             </span>
          } @else {
             <!-- Fallback automated badges -->
             @if(product().isNew) {
               <span class="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wide">✨ NEW</span>
             }
             @if(product().isSale) {
               <span class="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wide">
                 {{ discountPercentage() }}
               </span>
             }
          }
        </div>
      </div>

      <!-- Info -->
      <div class="p-4 flex flex-col flex-grow">
        <p class="text-xs text-slate-500 mb-1 font-medium">{{ product().brand }}</p>
        <h3 class="text-sm font-bold text-slate-900 mb-2 line-clamp-1">
          <a [routerLink]="['/product', product().id]" class="hover:text-blue-600 transition-colors">
            {{ product().name }}
          </a>
        </h3>
        <div class="mt-auto flex items-center justify-between">
           <div class="flex items-center gap-2">
             <span class="font-bold text-slate-900">{{ product().price | price }}</span>
             @if (product().originalPrice) {
               <span class="text-xs text-slate-400 line-through">{{ product().originalPrice | price }}</span>
             }
           </div>
           <div class="flex items-center gap-1 text-yellow-400 text-xs">
             <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
             <span class="text-slate-400 font-medium ml-0.5">{{ product().rating }}</span>
           </div>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  product = input.required<Product>();
  wishlistService = inject(WishlistService);

  isWishlisted = computed(() => this.wishlistService.isInWishlist(this.product().id));

  discountPercentage = computed(() => {
    const p = this.product();
    if (p.isSale && p.originalPrice && p.originalPrice > p.price) {
      const percent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
      return `🔴 -${percent}%`;
    }
    return '🔴 SALE';
  });

  isRedBadge(badge: string): boolean {
    const upper = badge.toUpperCase();
    return upper.includes('HOT') || upper.includes('%') || upper.includes('SALE');
  }

  isGreenBadge(badge: string): boolean {
    const upper = badge.toUpperCase();
    return upper.includes('NEW');
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistService.toggleWishlist(this.product().id);
  }
}
