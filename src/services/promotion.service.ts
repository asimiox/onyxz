
import { Injectable, signal, computed } from '@angular/core';
import { Promotion } from '../models/promotion';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  // Initial Mock Data
  private promotions = signal<Promotion[]>([
    {
      id: 1,
      type: 'coupon',
      name: 'Welcome Discount',
      active: true,
      code: 'WELCOME20',
      discountType: 'percentage',
      discountValue: 20
    },
    {
      id: 2,
      type: 'popup',
      name: 'Summer Sale Flyer',
      active: true,
      image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80',
      description: 'Get ready for the heat with our new summer collection.',
      buttonText: 'Shop Summer',
      buttonLink: '/shop?category=Women'
    }
  ]);

  getPromotions() {
    return this.promotions;
  }

  getActivePopup = computed(() => {
    // Return the first active popup
    return this.promotions().find(p => p.type === 'popup' && p.active);
  });

  addPromotion(promo: Promotion) {
    this.promotions.update(p => [promo, ...p]);
  }

  updatePromotion(promo: Promotion) {
    this.promotions.update(prev => prev.map(p => p.id === promo.id ? promo : p));
  }

  deletePromotion(id: number) {
    this.promotions.update(prev => prev.filter(p => p.id !== id));
  }

  toggleStatus(id: number) {
    this.promotions.update(prev => 
      prev.map(p => p.id === id ? { ...p, active: !p.active } : p)
    );
  }

  validateCoupon(code: string): Promotion | null {
    const promo = this.promotions().find(p => 
      p.type === 'coupon' && 
      p.active && 
      p.code?.toUpperCase() === code.toUpperCase()
    );
    return promo || null;
  }
}
