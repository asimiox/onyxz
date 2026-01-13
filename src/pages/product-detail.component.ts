
import { Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule, NgOptimizedImage, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';
import { WishlistService } from '../services/wishlist.service';
import { Product, Review } from '../models/product';
import { PricePipe } from '../pipes/price.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, PricePipe, RouterLink, NgOptimizedImage, FormsModule, DatePipe],
  template: `
    @if (product(); as p) {
      <div class="bg-white py-8 lg:py-16 pb-24 lg:pb-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="mb-8">
            <a routerLink="/shop" class="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Shop
            </a>
          </div>

          <div class="lg:grid lg:grid-cols-2 lg:gap-x-16 lg:items-start">
            
            <!-- Gallery Section -->
            <div class="mb-10 lg:mb-0 relative">
               <div class="group relative w-full aspect-[3/4] overflow-hidden bg-gray-100 rounded-2xl shadow-sm cursor-zoom-in">
                  <img 
                    [src]="activeImage()" 
                    [alt]="p.name" 
                    class="w-full h-full object-center object-cover transition-transform duration-700 ease-in-out group-hover:scale-125 origin-center animate-in fade-in"
                  >
                  <!-- Badge Overlay -->
                  <div class="absolute top-4 left-4 z-20">
                     @if(p.badge) {
                        <span class="text-white text-[12px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide"
                           [class.bg-red-600]="isRedBadge(p.badge!)"
                           [class.bg-green-600]="isGreenBadge(p.badge!)"
                           [class.bg-black]="!isRedBadge(p.badge!) && !isGreenBadge(p.badge!)">
                           {{ p.badge }}
                        </span>
                     }
                  </div>

                  <button 
                   (click)="toggleWishlist(p.id)"
                   class="absolute top-4 right-4 z-20 p-3 rounded-full bg-white/90 hover:bg-white shadow-md transition-all active:scale-95"
                   [class.text-red-500]="isWishlisted()"
                   [class.text-gray-400]="!isWishlisted()">
                   <svg class="w-6 h-6" [class.fill-current]="isWishlisted()" [class.fill-none]="!isWishlisted()" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </button>
               </div>

               @if (p.images && p.images.length > 1) {
                 <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-2 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg max-w-[90%] overflow-x-auto no-scrollbar z-20">
                    @for (img of p.images; track $index) {
                       <button 
                         (click)="setActiveImage(img)"
                         class="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 border-2"
                         [class.border-black]="activeImage() === img"
                         [class.scale-110]="activeImage() === img"
                         [class.border-transparent]="activeImage() !== img"
                         [class.opacity-70]="activeImage() !== img"
                         [class.hover:opacity-100]="activeImage() !== img">
                         <img [src]="img" class="w-full h-full object-cover">
                       </button>
                    }
                 </div>
               }
            </div>

            <!-- Info -->
            <div class="lg:sticky lg:top-24">
              <div class="mb-8 border-b border-gray-100 pb-8">
                <div class="flex justify-between items-start">
                  <h3 class="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase mb-3">{{ p.brand }}</h3>
                  
                  @if (p.stock < 5 && p.stock > 0) {
                     <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 animate-pulse">
                        🔥 Low Stock: {{ p.stock }} left
                     </span>
                  }
                  @if (p.stock === 0) {
                     <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-600">
                        Out of Stock
                     </span>
                  }
                </div>
                
                <h1 class="font-serif text-4xl font-bold text-black mb-4 leading-tight">{{ p.name }}</h1>
                
                <div class="flex items-center gap-4">
                  <div class="text-3xl font-medium text-black">{{ p.price | price }}</div>
                  @if (p.originalPrice && p.originalPrice > p.price) {
                     <span class="text-xl text-gray-400 line-through">{{ p.originalPrice | price }}</span>
                     <span class="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                        Save {{ discountPercentage() }}
                     </span>
                  }
                </div>
              </div>

              <!-- Reviews Summary -->
              <div class="flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80" (click)="scrollToReviews()">
                 <div class="flex text-yellow-400 text-sm">
                    @for(star of [1,2,3,4,5]; track star) {
                       <svg class="w-4 h-4" [class.fill-current]="star <= p.rating" [class.text-gray-300]="star > p.rating" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    }
                 </div>
                 <span class="text-sm font-bold text-gray-600 underline decoration-gray-300 underline-offset-4">{{ p.reviews }} Reviews</span>
              </div>

              <!-- Delivery Estimation (Enterprise Feature) -->
              <div class="mb-6 p-4 bg-gray-50 rounded border border-gray-100 flex items-center gap-3">
                 <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                 <div class="text-xs">
                    <p class="font-bold text-black uppercase tracking-wide">Estimated Delivery (Domestic)</p>
                    <p class="text-gray-500">4-6 Business Days (International times vary)</p>
                 </div>
              </div>

              <div class="mt-6">
                <div class="text-sm text-gray-600 space-y-6 leading-relaxed font-light">
                  <p>{{ p.description }}</p>
                </div>
              </div>

              <div class="mt-10 space-y-8">
                 @if (p.colors && p.colors.length > 0) {
                    <div>
                       <h3 class="text-xs font-bold text-black uppercase tracking-widest mb-4">Select Color</h3>
                       <div class="flex flex-wrap gap-3">
                          @for (color of p.colors; track color) {
                             <button 
                               (click)="selectedColor.set(color)"
                               class="px-4 py-2 border text-sm font-bold uppercase min-w-[3rem]"
                               [class.border-black]="selectedColor() === color"
                               [class.bg-black]="selectedColor() === color"
                               [class.text-white]="selectedColor() === color"
                               [class.text-black]="selectedColor() !== color"
                               [class.border-gray-200]="selectedColor() !== color"
                               [class.hover:border-gray-400]="selectedColor() !== color">
                               {{ color }}
                             </button>
                          }
                       </div>
                    </div>
                 }

                 <div>
                    <div class="flex items-center justify-between mb-4">
                       <h3 class="text-xs font-bold text-black uppercase tracking-widest">Select Size</h3>
                       <button class="text-xs font-bold text-gray-400 underline uppercase tracking-wide">Size Guide</button>
                    </div>

                    <div class="grid grid-cols-4 gap-4">
                       @for (size of p.sizes; track size) {
                          <button 
                            (click)="selectedSize.set(size)"
                            class="border py-3 px-4 flex items-center justify-center text-sm font-bold uppercase cursor-pointer transition-all duration-200 relative overflow-hidden"
                            [class.bg-black]="selectedSize() === size"
                            [class.text-white]="selectedSize() === size"
                            [class.border-black]="selectedSize() === size"
                            [class.bg-white]="selectedSize() !== size"
                            [class.text-black]="selectedSize() !== size"
                            [class.border-gray-200]="selectedSize() !== size"
                            [class.hover:border-black]="selectedSize() !== size"
                            [class.opacity-50]="p.stock === 0"
                            [class.cursor-not-allowed]="p.stock === 0">
                            {{ size }}
                          </button>
                       }
                    </div>
                 </div>
              </div>
              
              <div class="mt-8 hidden lg:block">
                @if (p.stock > 0) {
                   <button 
                     (click)="handleAddToCart(p)"
                     class="w-full bg-black border border-transparent py-5 px-8 flex items-center justify-center text-sm font-bold text-white hover:bg-gray-800 transition-all uppercase tracking-[0.2em] rounded-sm shadow-xl hover:shadow-2xl hover:-translate-y-1">
                     Add to Cart
                   </button>
                } @else {
                   <button 
                     (click)="notifyBackInStock(p)"
                     class="w-full bg-white border border-black py-5 px-8 flex items-center justify-center text-sm font-bold text-black hover:bg-gray-50 transition-all uppercase tracking-[0.2em] rounded-sm">
                     Notify When Available
                   </button>
                }
              </div>

            </div>
          </div>

          <!-- Product Reviews Section -->
          <div id="reviews-section" class="mt-24 border-t border-gray-100 pt-16">
             <h2 class="font-serif text-3xl font-bold text-black mb-10 text-center">Customer Reviews</h2>
             
             <div class="grid grid-cols-1 md:grid-cols-12 gap-10">
                <!-- Summary Column -->
                <div class="md:col-span-4 bg-gray-50 p-8 rounded-xl h-fit">
                   <div class="text-center mb-6">
                      <p class="text-5xl font-bold text-black">{{ p.rating }}</p>
                      <div class="flex justify-center text-yellow-400 my-2">
                         @for(star of [1,2,3,4,5]; track star) {
                            <svg class="w-5 h-5" [class.fill-current]="star <= p.rating" [class.text-gray-300]="star > p.rating" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                         }
                      </div>
                      <p class="text-sm text-gray-500">Based on {{ p.reviews }} reviews</p>
                   </div>

                   <!-- Write a Review -->
                   <div class="border-t border-gray-200 pt-6">
                      <h4 class="font-bold text-sm uppercase mb-4 text-center">Write a Review</h4>
                      
                      <form (ngSubmit)="submitReview(p.id)">
                         <!-- Name Field for Guests -->
                         @if (!authService.isAuthenticated()) {
                            <div class="mb-3">
                               <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Your Name</label>
                               <input [(ngModel)]="guestName" name="guestName" type="text" class="w-full border border-gray-300 p-2 text-sm rounded bg-white text-black placeholder-gray-400" placeholder="John Doe" required>
                            </div>
                         }

                         <div class="mb-3">
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Rating</label>
                            <select [(ngModel)]="newReviewRating" name="rating" class="w-full border border-gray-300 p-2 text-sm rounded bg-white text-black">
                               <option [value]="5">5 Stars</option>
                               <option [value]="4">4 Stars</option>
                               <option [value]="3">3 Stars</option>
                               <option [value]="2">2 Stars</option>
                               <option [value]="1">1 Star</option>
                            </select>
                         </div>
                         <!-- Sub Ratings -->
                         <div class="grid grid-cols-3 gap-2 mb-3">
                            <div>
                               <label class="block text-[10px] font-bold text-gray-500 uppercase">Quality</label>
                               <select [(ngModel)]="subRatings.quality" name="quality" class="w-full border p-1 text-xs bg-white text-black">
                                  <option [value]="5">5</option><option [value]="4">4</option><option [value]="3">3</option>
                               </select>
                            </div>
                            <div>
                               <label class="block text-[10px] font-bold text-gray-500 uppercase">Fit</label>
                               <select [(ngModel)]="subRatings.fit" name="fit" class="w-full border p-1 text-xs bg-white text-black">
                                  <option [value]="3">True</option><option [value]="1">Small</option><option [value]="5">Large</option>
                               </select>
                            </div>
                            <div>
                               <label class="block text-[10px] font-bold text-gray-500 uppercase">Value</label>
                               <select [(ngModel)]="subRatings.value" name="value" class="w-full border p-1 text-xs bg-white text-black">
                                  <option [value]="5">5</option><option [value]="4">4</option><option [value]="3">3</option>
                               </select>
                            </div>
                         </div>

                         <div class="mb-3">
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Comment</label>
                            <textarea [(ngModel)]="newReviewComment" name="comment" rows="3" class="w-full border border-gray-300 p-2 text-sm rounded bg-white text-black placeholder-black" placeholder="Your experience..."></textarea>
                         </div>
                         <button type="submit" [disabled]="!newReviewComment.trim()" class="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50">Submit Review</button>
                      </form>
                   </div>
                </div>

                <!-- Reviews List -->
                <div class="md:col-span-8 space-y-8">
                   @for (review of p.reviewsList; track review.id) {
                      <div class="border-b border-gray-100 pb-8 animate-in fade-in">
                         <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-3">
                               <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                                  {{ review.userName.charAt(0) }}
                               </div>
                               <div>
                                  <span class="font-bold text-sm block">{{ review.userName }}</span>
                                  @if(review.verified) {
                                     <span class="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                                        Verified Buyer
                                     </span>
                                  }
                               </div>
                            </div>
                            <span class="text-xs text-gray-400">{{ review.date | date:'mediumDate' }}</span>
                         </div>
                         <div class="flex text-yellow-400 text-xs mb-3">
                            @for(star of [1,2,3,4,5]; track star) {
                               <svg class="w-4 h-4" [class.fill-current]="star <= review.rating" [class.text-gray-200]="star > review.rating" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            }
                         </div>
                         <p class="text-gray-600 text-sm leading-relaxed">{{ review.comment }}</p>
                         
                         @if(review.subRatings) {
                            <div class="mt-3 flex gap-4 text-[10px] text-gray-500 uppercase tracking-wide">
                               <span>Quality: <b>{{review.subRatings.quality}}/5</b></span>
                               <span>Fit: <b>{{review.subRatings.fit === 3 ? 'True' : (review.subRatings.fit > 3 ? 'Large' : 'Small')}}</b></span>
                               <span>Value: <b>{{review.subRatings.value}}/5</b></span>
                            </div>
                         }
                      </div>
                   }
                </div>
             </div>
          </div>

        </div>

        <!-- Sticky Mobile Add to Cart Bar -->
        <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center gap-4">
           <div class="flex-1">
              <p class="text-sm font-bold text-gray-900 truncate">{{ p.name }}</p>
              <p class="text-xs text-gray-500">{{ p.price | price }}</p>
           </div>
           <button 
             (click)="handleAddToCart(p)"
             [disabled]="p.stock === 0"
             class="bg-black text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
             {{ p.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
           </button>
        </div>

      </div>
    } @else {
      <div class="h-96 flex items-center justify-center">
        <p class="text-gray-400 font-medium uppercase tracking-widest animate-pulse">Loading product...</p>
      </div>
    }
  `
})
export class ProductDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  productService = inject(ProductService);
  cartService = inject(CartService);
  toastService = inject(ToastService);
  authService = inject(AuthService);
  orderService = inject(OrderService);
  wishlistService = inject(WishlistService);

  product = signal<Product | undefined>(undefined);
  selectedSize = signal<string>('M');
  selectedColor = signal<string>('');
  activeImage = signal<string>('');

  newReviewRating = 5;
  newReviewComment = '';
  guestName = '';
  subRatings = { quality: 5, fit: 3, value: 5 };

  discountPercentage = computed(() => {
    const p = this.product();
    if (p && p.isSale && p.originalPrice && p.originalPrice > p.price) {
      const percent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
      return `${percent}%`;
    }
    return '';
  });

  isWishlisted = computed(() => {
    const p = this.product();
    return p ? this.wishlistService.isInWishlist(p.id) : false;
  });

  constructor() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        const p = this.productService.getProductById(id);
        if (p) {
          this.product.set(p);
          this.selectedSize.set(p.sizes[0]);
          if (p.colors && p.colors.length > 0) {
             this.selectedColor.set(p.colors[0]);
          }
          this.activeImage.set(p.image);
          this.productService.addToRecentlyViewed(p.id);
          window.scrollTo(0, 0);
        }
      }
    });
  }

  isRedBadge(badge: string): boolean {
    const upper = badge.toUpperCase();
    return upper.includes('HOT') || upper.includes('%') || upper.includes('SALE');
  }

  isGreenBadge(badge: string): boolean {
    const upper = badge.toUpperCase();
    return upper.includes('NEW');
  }

  setActiveImage(img: string) {
    this.activeImage.set(img);
  }

  toggleWishlist(productId: number) {
    this.wishlistService.toggleWishlist(productId);
    const status = this.wishlistService.isInWishlist(productId) ? 'added to' : 'removed from';
    this.toastService.show(`Product ${status} wishlist`, 'info');
  }

  scrollToReviews() {
    const el = document.getElementById('reviews-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  submitReview(productId: number) {
    const user = this.authService.currentUser();
    
    // Validate Guest Name
    if (!user && !this.guestName.trim()) {
       this.toastService.show('Please enter your name.', 'error');
       return;
    }

    const userName = user ? user.name : this.guestName.trim();
    
    // Only verified if user is logged in AND has purchased the product
    const isVerified = user ? this.orderService.hasPurchased(user.id, productId) : false;

    const newReview: Review = {
      id: Date.now(),
      userName: userName,
      date: new Date(),
      rating: Number(this.newReviewRating),
      comment: this.newReviewComment,
      verified: isVerified, 
      subRatings: { ...this.subRatings }
    };

    this.productService.addReview(productId, newReview);
    const updatedProduct = this.productService.getProductById(productId);
    this.product.set(updatedProduct);

    this.newReviewComment = '';
    this.newReviewRating = 5;
    this.guestName = '';
    this.toastService.show('Review submitted successfully!', 'success');
  }

  handleAddToCart(product: Product) {
    if (product.stock === 0) return;

    if (!this.authService.isAuthenticated()) {
      this.toastService.show('Please sign up or login to shop.', 'error');
      this.router.navigate(['/login']);
      return;
    }
    
    const color = product.colors && product.colors.length > 0 ? this.selectedColor() : undefined;
    
    this.cartService.addToCart(product, this.selectedSize(), 1, color);
    this.toastService.show(`Added ${product.name} to cart`, 'success');
  }

  notifyBackInStock(product: Product) {
     this.toastService.show(`We'll notify you when ${product.name} is back!`, 'success');
  }
}
