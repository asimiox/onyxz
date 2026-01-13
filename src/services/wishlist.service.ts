
import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  // Stores array of product IDs
  wishlist = signal<number[]>([]);

  constructor() {
    // Load from localStorage
    const saved = localStorage.getItem('mixtas_wishlist');
    if (saved) {
      try {
        this.wishlist.set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load wishlist');
      }
    }

    // Save to localStorage whenever it changes
    effect(() => {
      localStorage.setItem('mixtas_wishlist', JSON.stringify(this.wishlist()));
    });
  }

  toggleWishlist(productId: number) {
    this.wishlist.update(current => {
      if (current.includes(productId)) {
        return current.filter(id => id !== productId);
      } else {
        return [...current, productId];
      }
    });
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist().includes(productId);
  }
}
