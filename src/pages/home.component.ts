
import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { ToastService } from '../services/toast.service';
import { ProductCardComponent } from '../components/product-card.component';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, FormsModule, CommonModule, NgOptimizedImage],
  template: `
    <!-- Premium Hero Slider -->
    <section class="relative h-[600px] md:h-[750px] w-full overflow-hidden bg-slate-900">
      @for (slide of slides; track slide.id; let i = $index) {
        <div 
          class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          [class.opacity-100]="currentSlide() === i"
          [class.opacity-0]="currentSlide() !== i"
          [class.z-10]="currentSlide() === i"
          [class.z-0]="currentSlide() !== i">
          <img 
            [ngSrc]="slide.image" 
            [alt]="slide.title"
            fill
            [priority]="i <= 1"
            class="object-cover object-center opacity-70"
          >
          <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          <div class="absolute inset-0 flex items-center">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div class="max-w-2xl transform transition-all duration-700 delay-300"
                   [class.translate-y-0]="currentSlide() === i"
                   [class.opacity-100]="currentSlide() === i"
                   [class.translate-y-10]="currentSlide() !== i"
                   [class.opacity-0]="currentSlide() !== i">
                 <span class="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-[0.2em] mb-6 uppercase">
                   {{ slide.subtitle }}
                 </span>
                 <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] font-serif">
                   {{ slide.title }}
                 </h1>
                 <p class="text-slate-200 text-lg mb-10 leading-relaxed max-w-lg font-light">
                   {{ slide.description }}
                 </p>
                 <div class="flex flex-col sm:flex-row gap-4">
                   <a [routerLink]="slide.link" class="px-8 py-4 bg-white text-slate-900 rounded-sm font-bold hover:bg-slate-100 transition-colors shadow-lg uppercase tracking-widest text-sm flex items-center justify-center">
                     {{ slide.cta }}
                   </a>
                   <a routerLink="/lookbook" class="px-8 py-4 bg-transparent border border-white text-white rounded-sm font-bold hover:bg-white/10 transition-colors uppercase tracking-widest text-sm flex items-center justify-center">
                     View Lookbook
                   </a>
                 </div>
              </div>
            </div>
          </div>
        </div>
      }
      <div class="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
         @for (slide of slides; track slide.id; let i = $index) {
            <button 
              (click)="goToSlide(i)" 
              class="h-1 rounded-full transition-all duration-300"
              [class.w-8]="currentSlide() === i"
              [class.bg-white]="currentSlide() === i"
              [class.w-2]="currentSlide() !== i"
              [class.bg-white/40]="currentSlide() !== i">
            </button>
         }
      </div>
    </section>

    <!-- Curated Categories with Glassmorphism -->
    <section class="py-24 bg-white relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
         <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-50 blur-3xl"></div>
         <div class="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-pink-50 blur-3xl"></div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 class="text-4xl font-bold text-slate-900 mb-16 text-center font-serif tracking-tight">Curated Categories</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          @for (cat of productService.getCategoryConfigs()(); track cat.name) {
             <a [routerLink]="['/shop']" [queryParams]="{category: cat.name}" 
                class="group relative rounded-3xl overflow-hidden aspect-[3/4] shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer">
                
                <!-- Image -->
                <img [src]="cat.image" 
                     class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out" 
                     [alt]="cat.name">
                
                <!-- Glassmorphism Overlay (Full) - appears on hover -->
                <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[1px]"></div>

                <!-- Glass Label (Bottom) -->
                <div class="absolute inset-x-4 bottom-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center justify-center text-center group-hover:bg-white/20">
                   <h3 class="text-white font-bold text-lg tracking-widest uppercase font-serif drop-shadow-md">{{ cat.name }}</h3>
                   <span class="text-white/90 text-[10px] font-bold uppercase tracking-wider mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0 delay-100">
                      Explore
                   </span>
                </div>
             </a>
          }
        </div>
      </div>
    </section>

    <!-- Recently Viewed (Smart Personalization) -->
    @if (recentlyViewed().length > 0) {
      <section class="py-20 bg-white border-t border-gray-100 animate-in fade-in">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
               <span class="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">Welcome Back</span>
               <h2 class="text-3xl font-bold text-slate-900 font-serif mb-6">Recently Viewed</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            @for (product of recentlyViewed(); track product.id) {
               <app-product-card [product]="product"></app-product-card>
            }
          </div>
        </div>
      </section>
    }

    <!-- Featured/Bestsellers -->
    <section class="py-20 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
             <span class="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">Selected For You</span>
             <h2 class="text-3xl font-bold text-slate-900 font-serif mb-6">Trending Now</h2>
             <a routerLink="/shop" class="inline-flex items-center gap-2 text-black text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">
               View All Products 
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
             </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          @for (product of bestsellers(); track product.id) {
             <app-product-card [product]="product"></app-product-card>
          }
        </div>
      </div>
    </section>

    <!-- Editorial / Banner -->
    <section class="py-24 relative overflow-hidden">
       <div class="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop" class="w-full h-full object-cover" alt="Editorial">
          <div class="absolute inset-0 bg-black/40"></div>
       </div>
       <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span class="text-xs font-bold uppercase tracking-[0.3em] mb-4 block">New Season</span>
          <h2 class="text-4xl md:text-6xl font-bold font-serif mb-8">The Modern Minimalist</h2>
          <a routerLink="/lookbook" class="inline-block px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors">Explore Campaign</a>
       </div>
    </section>

    <!-- Newsletter -->
    <section class="py-24 bg-black text-white relative overflow-hidden">
       <div class="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 font-serif">Join the Mixtas Community</h2>
          <p class="text-slate-400 mb-10 max-w-xl mx-auto font-light">Subscribe to our newsletter to receive early access to new drops, exclusive offers, and style tips directly to your inbox.</p>
          <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
             <input type="email" placeholder="Enter your email address" class="flex-1 px-6 py-4 bg-white border border-white/20 text-black placeholder-black focus:outline-none focus:border-gray-200 transition-all text-sm">
             <button class="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">Subscribe</button>
          </div>
       </div>
    </section>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  productService = inject(ProductService);
  toastService = inject(ToastService);
  
  allProducts = this.productService.getAllProducts();
  
  bestsellers = computed(() => {
    return this.allProducts().slice(0, 4);
  });

  recentlyViewed = this.productService.getRecentlyViewedProducts();

  currentSlide = signal(0);
  private slideInterval: any;

  slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=2000&auto=format&fit=crop',
      subtitle: 'New Collection 2026',
      title: 'Redefine Urban Style',
      description: 'Discover the latest collection of premium streetwear, tailored for the modern individual.',
      link: '/shop',
      cta: 'Shop Collection'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop',
      subtitle: 'Premium Elegance',
      title: 'The Art of Layering',
      description: 'Sophisticated textures and timeless silhouettes for every occasion.',
      link: '/shop',
      cta: 'View Arrivals'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop',
      subtitle: 'Limited Edition',
      title: 'Summer Essentials',
      description: 'Bold colors and lightweight fabrics designed for the season ahead.',
      link: '/lookbook',
      cta: 'Explore Looks'
    }
  ];

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide() {
    this.currentSlide.update(curr => (curr + 1) % this.slides.length);
  }

  prevSlide() {
    this.currentSlide.update(curr => (curr - 1 + this.slides.length) % this.slides.length);
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}
