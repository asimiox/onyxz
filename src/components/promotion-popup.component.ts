
import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PromotionService } from '../services/promotion.service';

@Component({
  selector: 'app-promotion-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isVisible() && activePopup(); as popup) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" (click)="close()"></div>
        
        <!-- Flyer Content -->
        <div class="relative bg-white w-full max-w-md md:max-w-lg rounded-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
           
           <button (click)="close()" class="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
              <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
           </button>

           <div class="relative aspect-[4/3]">
              <img [src]="popup.image" [alt]="popup.name" class="w-full h-full object-cover">
           </div>
           
           <div class="p-8 text-center">
              <h2 class="font-serif text-3xl font-bold text-black mb-3">{{ popup.name }}</h2>
              <p class="text-gray-600 mb-8 leading-relaxed">{{ popup.description }}</p>
              
              <button (click)="navigate(popup.buttonLink)" class="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
                 {{ popup.buttonText || 'Shop Now' }}
              </button>
           </div>
        </div>
      </div>
    }
  `
})
export class PromotionPopupComponent {
  promotionService = inject(PromotionService);
  router = inject(Router);
  
  activePopup = this.promotionService.getActivePopup;
  isVisible = signal(false);

  constructor() {
     // Effect to track changes in the active promotion
     effect(() => {
        const popup = this.activePopup();
        if (popup) {
           // If a popup is active, check if we've seen this specific ID in this session
           const hasSeen = sessionStorage.getItem(`seen_promo_${popup.id}`);
           
           // If we haven't seen it, show it.
           // Note: If admin changes the active popup to a new one (new ID), this will trigger.
           // If admin edits the current popup (same ID) while it is OPEN, the UI updates automatically due to signal binding.
           // If admin edits the current popup while it is CLOSED (seen=true), it remains closed to not annoy user.
           if (!hasSeen) {
              // Small delay to allow smoother entry animation if page just loaded
              setTimeout(() => {
                 this.isVisible.set(true);
                 sessionStorage.setItem(`seen_promo_${popup.id}`, 'true');
              }, 1000);
           }
        } else {
           // If no active popup, ensure it's closed
           this.isVisible.set(false);
        }
     });
  }

  close() {
    this.isVisible.set(false);
  }

  navigate(link?: string) {
    if (link) {
      this.router.navigateByUrl(link);
    }
    this.close();
  }
}
