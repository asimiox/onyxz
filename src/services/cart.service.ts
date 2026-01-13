
import { Injectable, signal, computed } from '@angular/core';
import { Product, CartItem } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([]);
  savedItems = signal<CartItem[]>([]); // Advanced Product Experience
  shippingCountry = signal<string>('Pakistan');

  totalItems = computed(() => 
    this.cartItems().reduce((total, item) => total + item.quantity, 0)
  );

  subtotal = computed(() => 
    this.cartItems().reduce((total, item) => total + (item.product.price * item.quantity), 0)
  );

  shippingCost = computed(() => {
    const country = this.shippingCountry();
    const sub = this.subtotal();

    if (country === 'Pakistan') {
      return sub >= 50 ? 0 : 5;
    }
    const regionalCountries = ['India', 'China', 'Bangladesh', 'UAE', 'Saudi Arabia', 'Qatar', 'Turkey', 'Thailand', 'Malaysia'];
    if (regionalCountries.includes(country)) {
      return 15;
    }
    const europeCountries = ['UK', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden'];
    if (europeCountries.includes(country)) {
      return 25;
    }
    const northAmerica = ['USA', 'Canada'];
    if (northAmerica.includes(country)) {
      return 30;
    }
    return 35; 
  });

  setShippingCountry(country: string) {
    this.shippingCountry.set(country);
  }

  addToCart(product: Product, selectedSize: string, quantity: number, selectedColor?: string) {
    this.cartItems.update(items => {
      const existingItem = items.find(item => 
         item.product.id === product.id && 
         item.selectedSize === selectedSize && 
         item.selectedColor === selectedColor
      );

      if (existingItem) {
        return items.map(item => 
          (item.product.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...items, { product, quantity, selectedSize, selectedColor }];
    });
  }

  removeFromCart(productId: number, size: string, color?: string) {
    this.cartItems.update(items => 
      items.filter(item => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color))
    );
  }

  // --- Save For Later Logic ---
  saveForLater(item: CartItem) {
    this.removeFromCart(item.product.id, item.selectedSize, item.selectedColor);
    this.savedItems.update(items => [...items, item]);
  }

  moveToCart(item: CartItem) {
    this.savedItems.update(items => items.filter(i => i !== item)); // Simple ref check works here
    this.addToCart(item.product, item.selectedSize, item.quantity, item.selectedColor);
  }

  removeSavedItem(item: CartItem) {
    this.savedItems.update(items => items.filter(i => i !== item));
  }

  updateQuantity(productId: number, size: string, quantity: number, color?: string) {
    if (quantity <= 0) {
      this.removeFromCart(productId, size, color);
      return;
    }
    this.cartItems.update(items => 
      items.map(item => 
        (item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
          ? { ...item, quantity }
          : item
      )
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
