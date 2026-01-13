
import { Injectable, signal, computed } from '@angular/core';

export type CurrencyCode = 'USD' | 'PKR' | 'INR';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  currentCurrency = signal<CurrencyCode>('USD');
  
  // Changed from private to public so Admin component can use rates for reverse calculation
  public rates: Record<CurrencyCode, number> = {
    USD: 1,
    PKR: 280.10,
    INR: 90
  };

  symbol = computed(() => {
    switch (this.currentCurrency()) {
      case 'PKR': return 'Rs.';
      case 'INR': return '₹';
      default: return '$';
    }
  });

  setCurrency(code: CurrencyCode) {
    this.currentCurrency.set(code);
  }

  convert(amount: number): number {
    return amount * this.rates[this.currentCurrency()];
  }
}
