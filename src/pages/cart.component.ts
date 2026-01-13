
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { PromotionService } from '../services/promotion.service';
import { PaymentService } from '../services/payment.service';
import { Order } from '../models/order';
import { PricePipe } from '../pipes/price.pipe';
import { Promotion } from '../models/promotion';
import { ProductCardComponent } from '../components/product-card.component';
import { CartItem } from '../models/product';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, PricePipe, FormsModule, ProductCardComponent],
  template: `
    <div class="bg-white min-h-screen py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 class="font-serif text-4xl font-bold text-black mb-12 border-b border-gray-100 pb-6">
          {{ checkoutStep() === 'cart' ? 'Shopping Cart' : 'Checkout Details' }}
        </h1>

        @if (cartItems().length === 0 && checkoutStep() === 'cart' && savedItems().length === 0) {
          <div class="text-center py-20">
             <p class="text-gray-500 mb-8 font-light text-lg">Your cart is currently empty.</p>
             <div>
               <a routerLink="/shop" class="inline-flex items-center px-10 py-4 border border-black text-xs font-bold text-black hover:bg-black hover:text-white transition-all uppercase tracking-[0.2em]">
                 Continue Shopping
               </a>
             </div>
          </div>
        } @else {
          <div class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            
            <!-- Left Column -->
            <section class="lg:col-span-8">
              
              <!-- Step 1: Cart Items -->
              @if (checkoutStep() === 'cart') {
                @if(cartItems().length > 0) {
                   <ul class="divide-y divide-gray-100 border-t border-gray-100">
                     @for (item of cartItems(); track item.product.id + item.selectedSize + item.selectedColor) {
                       <li class="flex py-8 animate-in slide-in-from-left duration-300">
                         <div class="flex-shrink-0 w-24 h-32 bg-gray-100 overflow-hidden">
                           <img [src]="item.product.image" [alt]="item.product.name" class="w-full h-full object-center object-cover">
                         </div>

                         <div class="ml-6 flex-1 flex flex-col justify-between">
                           <div class="flex justify-between">
                             <div>
                               <h3 class="text-sm font-bold text-black uppercase tracking-wide">
                                 <a [routerLink]="['/product', item.product.id]">{{ item.product.name }}</a>
                               </h3>
                               <p class="mt-1 text-xs text-gray-500 uppercase tracking-widest">{{ item.product.brand }}</p>
                               
                               <div class="flex gap-4 mt-1">
                                  <p class="text-xs text-gray-500">Size: <span class="font-bold">{{ item.selectedSize }}</span></p>
                                  @if (item.selectedColor) {
                                     <p class="text-xs text-gray-500">Color: <span class="font-bold">{{ item.selectedColor }}</span></p>
                                  }
                               </div>
                             </div>
                             <p class="text-sm font-medium text-black">{{ item.product.price | price }}</p>
                           </div>

                           <div class="flex items-center justify-between mt-4">
                              <div class="flex items-center border border-gray-300">
                                 <button (click)="decreaseQty(item)" class="px-3 py-1 text-gray-600 hover:text-black hover:bg-gray-50">-</button>
                                 <span class="px-3 py-1 text-sm font-medium text-black border-l border-r border-gray-300">{{ item.quantity }}</span>
                                 <button (click)="increaseQty(item)" class="px-3 py-1 text-gray-600 hover:text-black hover:bg-gray-50">+</button>
                              </div>
                              <div class="flex gap-4">
                                 <button (click)="saveForLater(item)" class="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest">Save for Later</button>
                                 <button (click)="removeItem(item)" class="text-xs font-bold text-gray-400 hover:text-red-600 uppercase tracking-widest">Remove</button>
                              </div>
                           </div>
                         </div>
                       </li>
                     }
                   </ul>
                }

                <!-- Saved For Later Section -->
                @if (savedItems().length > 0) {
                   <div class="mt-12 border-t border-gray-100 pt-8">
                      <h2 class="text-sm font-bold text-black uppercase tracking-widest mb-6">Saved for Later ({{ savedItems().length }})</h2>
                      <ul class="divide-y divide-gray-100">
                         @for (item of savedItems(); track item.product.id) {
                            <li class="flex py-6 opacity-80 hover:opacity-100 transition-opacity">
                               <div class="flex-shrink-0 w-16 h-20 bg-gray-100 overflow-hidden">
                                  <img [src]="item.product.image" class="w-full h-full object-center object-cover">
                               </div>
                               <div class="ml-4 flex-1">
                                  <div class="flex justify-between">
                                     <h3 class="text-sm font-bold">{{ item.product.name }}</h3>
                                     <p class="text-sm">{{ item.product.price | price }}</p>
                                  </div>
                                  <p class="text-xs text-gray-500 mb-2">{{ item.selectedSize }} / {{ item.selectedColor }}</p>
                                  <div class="flex gap-4">
                                     <button (click)="moveToCart(item)" class="text-xs font-bold text-black underline">Move to Cart</button>
                                     <button (click)="removeSaved(item)" class="text-xs text-gray-400 hover:text-red-500">Remove</button>
                                  </div>
                               </div>
                            </li>
                         }
                      </ul>
                   </div>
                }
              }

              <!-- Step 2: Shipping & Payment -->
              @if (checkoutStep() === 'details') {
                <form [formGroup]="checkoutForm" class="space-y-8 animate-in slide-in-from-right duration-300">
                   
                   <!-- Shipping Info -->
                   <div class="bg-gray-50 p-6 rounded-sm">
                      <h3 class="font-bold text-black uppercase tracking-widest mb-4">Shipping Information</h3>
                      <div class="space-y-4">
                        <div>
                           <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Country / Region</label>
                           <select formControlName="country" class="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none bg-white text-black cursor-pointer">
                              <option value="" disabled>Select Country</option>
                              @for (c of countries; track c.name) {
                                <option [value]="c.name">{{ c.name }}</option>
                              }
                           </select>
                        </div>

                        <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Full Address</label>
                          <textarea formControlName="address" rows="3" class="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none bg-white text-black placeholder-black" placeholder="House #, Street, City..."></textarea>
                          @if(checkoutForm.get('address')?.touched && checkoutForm.get('address')?.invalid) {
                            <p class="text-red-500 text-xs mt-1">Address is required.</p>
                          }
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                          <div class="flex items-start">
                             <!-- Country Code Display -->
                             <div class="w-20 bg-gray-200 border border-gray-300 border-r-0 p-3 text-sm text-gray-600 font-bold text-center flex-shrink-0 cursor-not-allowed">
                                {{ getSelectedCountry()?.dial_code }}
                             </div>
                             <!-- Local Number Input -->
                             <input 
                               type="text" 
                               formControlName="localPhone" 
                               (keypress)="allowOnlyNumbers($event)"
                               [maxlength]="getSelectedCountry()?.length"
                               class="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none bg-white text-black placeholder-gray-400" 
                               [placeholder]="getSelectedCountry()?.placeholder || '1234567890'">
                          </div>
                          <p class="text-[10px] text-gray-500 mt-1">
                             Enter exactly {{ getSelectedCountry()?.length }} digits (excluding {{ getSelectedCountry()?.dial_code }}).
                          </p>
                          @if(checkoutForm.get('localPhone')?.touched && checkoutForm.get('localPhone')?.invalid) {
                            @if(checkoutForm.get('localPhone')?.hasError('required')) {
                               <p class="text-red-500 text-xs mt-1">Phone number is required.</p>
                            }
                            @else {
                               <p class="text-red-500 text-xs mt-1">
                                  Invalid length. Required: {{ getSelectedCountry()?.length }} digits.
                               </p>
                            }
                          }
                        </div>
                      </div>
                   </div>

                   <!-- Payment Method Dynamic Section -->
                   <div class="bg-gray-50 p-6 rounded-sm">
                      <h3 class="font-bold text-black uppercase tracking-widest mb-4">Payment Method</h3>
                      <div class="space-y-3">
                         
                         @for (gateway of activeGateways(); track gateway.id) {
                            <label class="flex items-start cursor-pointer border p-4 transition-all hover:bg-white" 
                                   [class.border-black]="checkoutForm.get('paymentMethod')?.value === gateway.name"
                                   [class.bg-white]="checkoutForm.get('paymentMethod')?.value === gateway.name"
                                   [class.border-gray-200]="checkoutForm.get('paymentMethod')?.value !== gateway.name">
                               
                               <input type="radio" formControlName="paymentMethod" [value]="gateway.name" class="sr-only">
                               
                               <div class="flex items-center h-5 mt-0.5">
                                  <div class="w-4 h-4 border rounded-full flex items-center justify-center transition-all" 
                                       [class.border-black]="checkoutForm.get('paymentMethod')?.value === gateway.name">
                                     @if(checkoutForm.get('paymentMethod')?.value === gateway.name) { 
                                        <div class="w-2 h-2 bg-black rounded-full"></div> 
                                     }
                                  </div>
                               </div>
                               
                               <div class="ml-3 w-full">
                                  <div class="flex justify-between items-center w-full">
                                     <span class="block text-sm font-bold text-black">{{ gateway.name }}</span>
                                     @if (gateway.type !== 'COD') {
                                        <span class="text-[10px] uppercase font-bold text-gray-400 border border-gray-200 px-2 py-0.5 rounded">{{ gateway.type }}</span>
                                     }
                                  </div>
                                  
                                  <!-- Payment Details Expansion -->
                                  @if(checkoutForm.get('paymentMethod')?.value === gateway.name) {
                                     <div class="mt-3 text-sm text-gray-600 bg-gray-100 p-4 rounded space-y-2 animate-in fade-in slide-in-from-top-2">
                                        
                                        @if (gateway.accountTitle) {
                                           <p class="flex justify-between border-b border-gray-200 pb-1">
                                              <span>Account Title:</span>
                                              <span class="font-bold">{{ gateway.accountTitle }}</span>
                                           </p>
                                        }
                                        
                                        @if (gateway.accountNumber) {
                                           <p class="flex justify-between border-b border-gray-200 pb-1">
                                              <span>Account Number:</span>
                                              <span class="font-bold font-mono">{{ gateway.accountNumber }}</span>
                                           </p>
                                        }

                                        @if (gateway.instructions) {
                                           <p class="text-xs text-black font-medium mt-2 pt-1">
                                              <span class="font-bold text-red-600">Note:</span> {{ gateway.instructions }}
                                           </p>
                                        }
                                     </div>
                                  }
                               </div>
                            </label>
                         }

                      </div>
                   </div>

                </form>
              }
            </section>

            <!-- Order Summary -->
            <section class="mt-16 lg:mt-0 lg:col-span-4 bg-gray-50 p-8 sticky top-24">
              <h2 class="text-lg font-bold text-black mb-6 uppercase tracking-widest">Order Summary</h2>

              <dl class="space-y-4">
                <div class="flex items-center justify-between text-sm">
                  <dt class="text-gray-600">Subtotal</dt>
                  <dd class="font-medium text-black">{{ subtotal() | price }}</dd>
                </div>
                
                <!-- Tier Reward -->
                @if (activeTierDiscount()) {
                  <div class="flex items-center justify-between text-sm text-green-700 bg-green-50 p-2 rounded">
                    <dt class="font-bold flex flex-col">
                       <span>{{ activeTierDiscount()?.name }}</span>
                       <span class="text-[10px] font-normal uppercase">Membership Reward</span>
                    </dt>
                    <dd class="font-bold">-{{ tierDiscountAmount() | price }}</dd>
                  </div>
                }

                <!-- Coupon Section -->
                @if (appliedCoupon()) {
                  <div class="flex items-center justify-between text-sm text-blue-700 bg-blue-50 p-2 rounded relative group">
                    <dt class="font-bold flex flex-col">
                       <span>Coupon: {{ appliedCoupon()?.code }}</span>
                       <span class="text-[10px] font-normal uppercase">{{ appliedCoupon()?.name }}</span>
                    </dt>
                    <dd class="font-bold">-{{ couponDiscountAmount() | price }}</dd>
                    <button (click)="removeCoupon()" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                } @else if (checkoutStep() === 'cart') {
                   <div class="pt-2 pb-2">
                     <div class="flex gap-2">
                        <input type="text" [(ngModel)]="couponCodeInput" placeholder="Coupon Code" class="flex-1 border border-gray-300 px-3 py-2 text-xs focus:border-black focus:outline-none uppercase font-mono bg-white text-black placeholder-black">
                        <button (click)="applyCoupon()" class="bg-gray-900 text-white text-xs font-bold px-4 py-2 hover:bg-black">APPLY</button>
                     </div>
                   </div>
                }

                <div class="flex items-center justify-between text-sm">
                  <dt class="text-gray-600">Shipping</dt>
                  @if (shippingCost() === 0) {
                     <dd class="font-bold text-green-600">Free</dd>
                  } @else {
                     <dd class="font-medium text-black">{{ shippingCost() | price }}</dd>
                  }
                </div>
                
                @if(checkoutStep() === 'details') {
                   <div class="text-xs text-gray-400 mt-1 italic text-right">
                      Rate for: {{ this.checkoutForm.get('country')?.value }}
                   </div>
                   <!-- Dynamic Delivery Date -->
                   <div class="text-xs text-blue-600 mt-1 font-bold text-right flex justify-end items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Est. Delivery: {{ deliveryDate() }}
                   </div>
                }
                
                @if(shippingCost() > 0 && this.checkoutForm.get('country')?.value === 'Pakistan') {
                   <div class="text-xs text-gray-400 mt-1">
                      Spend {{ (50 - subtotal()) | price }} more for free domestic shipping.
                   </div>
                }

                <div class="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt class="text-base font-bold text-black uppercase tracking-wide">Total</dt>
                  <dd class="text-base font-bold text-black">{{ finalTotal() | price }}</dd>
                </div>
              </dl>
              
              <div class="mt-6 text-xs text-gray-500">
                <p>Points to earn: <span class="font-bold text-black">{{ finalTotal() | number:'1.0-0' }}</span></p>
              </div>

              <div class="mt-8">
                @if (checkoutStep() === 'cart') {
                   <button (click)="proceedToDetails()" [disabled]="cartItems().length === 0" type="button" class="w-full bg-black border border-transparent py-4 px-4 text-sm font-bold text-white hover:bg-gray-800 focus:outline-none uppercase tracking-[0.2em] transition-all disabled:opacity-50">
                     Proceed to Checkout
                   </button>
                } @else {
                   <div class="flex flex-col gap-3">
                     <button (click)="confirmOrder()" [disabled]="checkoutForm.invalid" type="button" class="w-full bg-black border border-transparent py-4 px-4 text-sm font-bold text-white hover:bg-gray-800 focus:outline-none uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                       Confirm Order
                     </button>
                     <button (click)="checkoutStep.set('cart')" type="button" class="w-full bg-transparent border border-gray-300 py-3 px-4 text-xs font-bold text-black hover:bg-white uppercase tracking-widest transition-all">
                       Back to Cart
                     </button>
                   </div>
                }
              </div>
            </section>
          </div>

          <!-- Recommendations Section -->
          @if (recommendations().length > 0) {
            <section class="mt-24 border-t border-gray-100 pt-16 animate-in fade-in duration-500">
               <div class="text-center mb-12">
                  <h2 class="font-serif text-3xl font-bold text-black mb-2">You May Also Like</h2>
                  <p class="text-gray-500 text-sm">Curated picks based on your bag.</p>
               </div>
               
               <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  @for (product of recommendations(); track product.id) {
                     <app-product-card [product]="product"></app-product-card>
                  }
               </div>
            </section>
          }
        }
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  toastService = inject(ToastService);
  orderService = inject(OrderService);
  authService = inject(AuthService);
  productService = inject(ProductService);
  promotionService = inject(PromotionService);
  paymentService = inject(PaymentService); 
  router = inject(Router);
  fb = inject(FormBuilder);

  cartItems = this.cartService.cartItems;
  savedItems = this.cartService.savedItems; // New
  subtotal = this.cartService.subtotal;
  shippingCost = this.cartService.shippingCost;
  
  checkoutStep = signal<'cart' | 'details'>('cart');
  activeGateways = computed(() => this.paymentService.getActiveGateways());

  couponCodeInput = '';
  appliedCoupon = signal<Promotion | null>(null);

  // Strict format data
  countries = [
    { name: 'Pakistan', code: 'PK', dial_code: '+92', length: 10, placeholder: '3001234567' },
    { name: 'India', code: 'IN', dial_code: '+91', length: 10, placeholder: '9876543210' },
    { name: 'China', code: 'CN', dial_code: '+86', length: 11, placeholder: '13800138000' },
    { name: 'UAE', code: 'AE', dial_code: '+971', length: 9, placeholder: '501234567' },
    { name: 'Saudi Arabia', code: 'SA', dial_code: '+966', length: 9, placeholder: '501234567' },
    { name: 'UK', code: 'GB', dial_code: '+44', length: 10, placeholder: '7700900000' },
    { name: 'USA', code: 'US', dial_code: '+1', length: 10, placeholder: '2025550123' },
    { name: 'Canada', code: 'CA', dial_code: '+1', length: 10, placeholder: '4165550123' },
    { name: 'Germany', code: 'DE', dial_code: '+49', length: 11, placeholder: '15112345678' },
    { name: 'Australia', code: 'AU', dial_code: '+61', length: 9, placeholder: '400123456' },
    { name: 'Qatar', code: 'QA', dial_code: '+974', length: 8, placeholder: '33123456' },
    { name: 'Turkey', code: 'TR', dial_code: '+90', length: 10, placeholder: '5012345678' },
    { name: 'Malaysia', code: 'MY', dial_code: '+60', length: 9, placeholder: '123456789' },
    { name: 'France', code: 'FR', dial_code: '+33', length: 9, placeholder: '612345678' },
    { name: 'Italy', code: 'IT', dial_code: '+39', length: 10, placeholder: '3001234567' },
    { name: 'Spain', code: 'ES', dial_code: '+34', length: 9, placeholder: '600123456' },
    { name: 'Netherlands', code: 'NL', dial_code: '+31', length: 9, placeholder: '612345678' },
    { name: 'Sweden', code: 'SE', dial_code: '+46', length: 9, placeholder: '701234567' },
    { name: 'Bangladesh', code: 'BD', dial_code: '+880', length: 10, placeholder: '1712345678' }
  ];

  checkoutForm = this.fb.group({
    country: ['Pakistan', Validators.required],
    address: ['', Validators.required],
    localPhone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    paymentMethod: ['Cash on Delivery', Validators.required]
  });

  ngOnInit() {
    this.checkoutForm.get('country')?.valueChanges.subscribe(countryName => {
      if (countryName) {
        this.cartService.setShippingCountry(countryName);
        this.updatePhoneValidators(countryName);
      }
    });

    // Initial validation setup for default country (Pakistan)
    this.updatePhoneValidators('Pakistan');
  }

  updatePhoneValidators(countryName: string) {
    const country = this.countries.find(c => c.name === countryName);
    const phoneControl = this.checkoutForm.get('localPhone');
    
    if (country && phoneControl) {
      // Clear previous value if length is vastly different to prevent confusion, 
      // or keep it but it will be invalid. Let's keep it.
      phoneControl.setValidators([
        Validators.required, 
        Validators.pattern('^[0-9]*$'), // Strictly numbers
        Validators.minLength(country.length), 
        Validators.maxLength(country.length)
      ]);
      phoneControl.updateValueAndValidity();
    }
  }

  getSelectedCountry() {
    const name = this.checkoutForm.get('country')?.value;
    return this.countries.find(c => c.name === name);
  }

  // Prevent typing of non-numeric chars
  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  recommendations = computed(() => {
    const items = this.cartItems();
    if (items.length === 0) return [];
    const allProducts = this.productService.getAllProducts()();
    const cartProductIds = new Set(items.map(i => i.product.id));
    const cartCategories = new Set(items.map(i => i.product.category));
    let relevantProducts = allProducts.filter(p => 
      cartCategories.has(p.category) && !cartProductIds.has(p.id)
    );
    return relevantProducts.sort(() => 0.5 - Math.random()).slice(0, 4);
  });

  activeTierDiscount = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return null;
    if (user.tier === 'Diamond' && !user.rewardsUsage.Diamond) return { name: 'Diamond Reward (100% OFF)', percent: 1.0, tier: 'Diamond' as const };
    if (user.tier === 'Gold' && !user.rewardsUsage.Gold) return { name: 'Gold Reward (70% OFF)', percent: 0.7, tier: 'Gold' as const };
    if (user.tier === 'Silver' && !user.rewardsUsage.Silver) return { name: 'Silver Reward (40% OFF)', percent: 0.4, tier: 'Silver' as const };
    return null;
  });

  tierDiscountAmount = computed(() => {
    const discount = this.activeTierDiscount();
    if (!discount) return 0;
    return this.subtotal() * discount.percent;
  });

  deliveryDate = computed(() => {
     const country = this.cartService.shippingCountry();
     const today = new Date();
     let minDays = 4;
     let maxDays = 6;

     if (country === 'Pakistan') {
        minDays = 4;
        maxDays = 6;
     } else if (['UAE', 'Saudi Arabia', 'China', 'India'].includes(country)) {
        minDays = 7;
        maxDays = 10;
     } else {
        minDays = 10;
        maxDays = 15;
     }

     const startDate = new Date(today);
     startDate.setDate(today.getDate() + minDays);
     
     const endDate = new Date(today);
     endDate.setDate(today.getDate() + maxDays);

     const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
     return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  });

  applyCoupon() {
    if (!this.couponCodeInput.trim()) return;
    const promo = this.promotionService.validateCoupon(this.couponCodeInput);
    if (promo) {
      this.appliedCoupon.set(promo);
      this.toastService.show('Coupon applied successfully', 'success');
      this.couponCodeInput = '';
    } else {
      this.toastService.show('Invalid or expired coupon code', 'error');
    }
  }

  removeCoupon() {
    this.appliedCoupon.set(null);
  }

  couponDiscountAmount = computed(() => {
    const coupon = this.appliedCoupon();
    if (!coupon) return 0;
    const remainingSubtotal = Math.max(0, this.subtotal() - this.tierDiscountAmount());
    if (coupon.discountType === 'fixed') {
       return Math.min(remainingSubtotal, coupon.discountValue || 0);
    } else {
       return remainingSubtotal * ((coupon.discountValue || 0) / 100);
    }
  });

  finalTotal = computed(() => {
    const totalDiscount = this.tierDiscountAmount() + this.couponDiscountAmount();
    return Math.max(0, (this.subtotal() - totalDiscount) + this.shippingCost());
  });

  increaseQty(item: CartItem) {
    this.cartService.updateQuantity(item.product.id, item.selectedSize, item.quantity + 1, item.selectedColor);
  }

  decreaseQty(item: CartItem) {
    this.cartService.updateQuantity(item.product.id, item.selectedSize, item.quantity - 1, item.selectedColor);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.product.id, item.selectedSize, item.selectedColor);
    this.toastService.show('Item removed from cart', 'info');
  }

  saveForLater(item: CartItem) {
    this.cartService.saveForLater(item);
    this.toastService.show('Saved for later', 'info');
  }

  moveToCart(item: CartItem) {
    this.cartService.moveToCart(item);
    this.toastService.show('Moved back to cart', 'success');
  }

  removeSaved(item: CartItem) {
    this.cartService.removeSavedItem(item);
  }
  
  proceedToDetails() {
    this.checkoutStep.set('details');
  }

  confirmOrder() {
    if (this.checkoutForm.invalid) {
      this.toastService.show('Please fill in all delivery details', 'error');
      return;
    }

    const formVal = this.checkoutForm.value;
    const currentUser = this.authService.currentUser();
    const orderTotal = this.finalTotal();
    
    // Construct full phone number with dial code
    const country = this.countries.find(c => c.name === formVal.country);
    const fullPhone = `${country?.dial_code} ${formVal.localPhone}`;

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser ? currentUser.id : 999,
      customerName: currentUser ? currentUser.name : 'Guest User',
      date: new Date(),
      status: 'Processing',
      total: orderTotal,
      country: formVal.country!,
      shippingAddress: formVal.address!,
      phone: fullPhone, // Store the combined number
      paymentMethod: formVal.paymentMethod!, 
      items: [...this.cartItems()],
      timeline: [{ status: 'Processing', date: new Date() }]
    };

    this.orderService.createOrder(newOrder);
    
    newOrder.items.forEach(item => {
      const currentProduct = this.productService.getProductById(item.product.id);
      if (currentProduct) {
        const newStock = Math.max(0, currentProduct.stock - item.quantity);
        this.productService.updateProductStock(item.product.id, newStock);
      }
    });

    if (currentUser) {
       const discount = this.activeTierDiscount();
       if (discount) {
          this.authService.markRewardUsed(discount.tier);
       }
       this.authService.addPoints(orderTotal);
    }

    this.toastService.show('Order placed successfully', 'success');

    this.cartService.clearCart();
    this.appliedCoupon.set(null);
    
    if (this.authService.isAdmin()) {
       setTimeout(() => this.router.navigate(['/admin/dashboard']), 1000);
    } else {
       setTimeout(() => this.router.navigate(['/profile']), 1000);
    }
  }
}
