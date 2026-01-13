
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';
import { ProductCardComponent } from '../components/product-card.component';
import { Category } from '../models/product';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <div class="bg-white min-h-screen py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header (Centered) -->
        <div class="text-center mb-16 pb-8 border-b border-gray-100">
             <span class="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] block mb-3">Collection 2026</span>
             <h1 class="font-serif text-5xl font-bold text-black mb-6">The Catalog</h1>
           
           <div class="flex justify-center items-center gap-2">
             <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">
               {{ displayedProducts().length }} Items
             </span>
             @if (selectedCategory()) {
                <span class="text-gray-300">|</span>
                <span class="text-xs font-bold text-black uppercase tracking-widest">{{ selectedCategory() }}</span>
             }
           </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-12">
          <!-- Sidebar Filters -->
          <div class="w-full lg:w-64 flex-shrink-0">
             <div class="sticky top-24 space-y-10">
                
                <!-- Category Filter -->
                <div>
                   <h3 class="text-xs font-bold text-black uppercase tracking-[0.2em] mb-4 pb-2 border-b border-gray-100">Category</h3>
                   <div class="space-y-2">
                      <label class="flex items-center cursor-pointer group">
                         <input type="radio" name="category" [checked]="selectedCategory() === null" (change)="setCategory(null)" class="sr-only">
                         <span class="w-4 h-4 border border-gray-300 rounded-full mr-3 flex items-center justify-center group-hover:border-black transition-colors" [class.border-black]="selectedCategory() === null">
                            @if(selectedCategory() === null) { <span class="w-2 h-2 bg-black rounded-full"></span> }
                         </span>
                         <span class="text-sm text-gray-600 group-hover:text-black uppercase tracking-wide transition-colors" [class.font-bold]="selectedCategory() === null" [class.text-black]="selectedCategory() === null">All Categories</span>
                      </label>
                      @for (cat of productService.categories(); track cat) {
                        <label class="flex items-center cursor-pointer group">
                           <input type="radio" name="category" [checked]="selectedCategory() === cat" (change)="setCategory(cat)" class="sr-only">
                           <span class="w-4 h-4 border border-gray-300 rounded-full mr-3 flex items-center justify-center group-hover:border-black transition-colors" [class.border-black]="selectedCategory() === cat">
                              @if(selectedCategory() === cat) { <span class="w-2 h-2 bg-black rounded-full"></span> }
                           </span>
                           <span class="text-sm text-gray-600 group-hover:text-black uppercase tracking-wide transition-colors" [class.font-bold]="selectedCategory() === cat" [class.text-black]="selectedCategory() === cat">{{ cat }}</span>
                        </label>
                      }
                   </div>
                </div>

                <!-- Price Filter -->
                <div>
                   <h3 class="text-xs font-bold text-black uppercase tracking-[0.2em] mb-4 pb-2 border-b border-gray-100">Price Range</h3>
                   <div class="space-y-2">
                      <label class="flex items-center cursor-pointer group">
                         <input type="radio" name="price" [checked]="maxPrice() === null" (change)="setMaxPrice(null)" class="sr-only">
                         <span class="w-4 h-4 border border-gray-300 rounded-full mr-3 flex items-center justify-center group-hover:border-black transition-colors" [class.border-black]="maxPrice() === null">
                             @if(maxPrice() === null) { <span class="w-2 h-2 bg-black rounded-full"></span> }
                         </span>
                         <span class="text-sm text-gray-600 group-hover:text-black uppercase tracking-wide transition-colors" [class.font-bold]="maxPrice() === null" [class.text-black]="maxPrice() === null">All Prices</span>
                      </label>
                      
                      <label class="flex items-center cursor-pointer group">
                         <input type="radio" name="price" [checked]="maxPrice() === 100" (change)="setMaxPrice(100)" class="sr-only">
                         <span class="w-4 h-4 border border-gray-300 rounded-full mr-3 flex items-center justify-center group-hover:border-black transition-colors" [class.border-black]="maxPrice() === 100">
                             @if(maxPrice() === 100) { <span class="w-2 h-2 bg-black rounded-full"></span> }
                         </span>
                         <span class="text-sm text-gray-600 group-hover:text-black uppercase tracking-wide transition-colors" [class.font-bold]="maxPrice() === 100" [class.text-black]="maxPrice() === 100">Under $100</span>
                      </label>

                      <label class="flex items-center cursor-pointer group">
                         <input type="radio" name="price" [checked]="maxPrice() === 200" (change)="setMaxPrice(200)" class="sr-only">
                         <span class="w-4 h-4 border border-gray-300 rounded-full mr-3 flex items-center justify-center group-hover:border-black transition-colors" [class.border-black]="maxPrice() === 200">
                             @if(maxPrice() === 200) { <span class="w-2 h-2 bg-black rounded-full"></span> }
                         </span>
                         <span class="text-sm text-gray-600 group-hover:text-black uppercase tracking-wide transition-colors" [class.font-bold]="maxPrice() === 200" [class.text-black]="maxPrice() === 200">$100 - $200</span>
                      </label>

                      <label class="flex items-center cursor-pointer group">
                         <input type="radio" name="price" [checked]="maxPrice() === 300" (change)="setMaxPrice(300)" class="sr-only">
                         <span class="w-4 h-4 border border-gray-300 rounded-full mr-3 flex items-center justify-center group-hover:border-black transition-colors" [class.border-black]="maxPrice() === 300">
                             @if(maxPrice() === 300) { <span class="w-2 h-2 bg-black rounded-full"></span> }
                         </span>
                         <span class="text-sm text-gray-600 group-hover:text-black uppercase tracking-wide transition-colors" [class.font-bold]="maxPrice() === 300" [class.text-black]="maxPrice() === 300">$200+</span>
                      </label>
                   </div>
                </div>

             </div>
          </div>

          <!-- Product Grid -->
          <div class="flex-1">
             @if (displayedProducts().length > 0) {
               <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                 @for (product of displayedProducts(); track product.id) {
                   <app-product-card [product]="product"></app-product-card>
                 }
               </div>
               
               <!-- Load More -->
               @if (displayedProducts().length < filteredProducts().length) {
                 <div class="mt-24 flex justify-center">
                    <button (click)="loadMore()" class="px-10 py-4 bg-black text-white text-xs font-bold hover:bg-gray-800 uppercase tracking-[0.2em] transition-all">
                      Load More
                    </button>
                 </div>
               }
             } @else {
               <div class="py-20 text-center border border-gray-100 rounded-2xl bg-gray-50">
                  <p class="text-gray-500 mb-4">No products found matching your filters.</p>
                  <button (click)="resetFilters()" class="text-xs font-bold uppercase tracking-widest text-black underline">Reset Filters</button>
               </div>
             }
          </div>
        </div>

      </div>
    </div>
  `
})
export class ShopComponent implements OnInit {
  productService = inject(ProductService);
  route = inject(ActivatedRoute);
  
  selectedCategory = signal<Category | null>(null);
  maxPrice = signal<number | null>(null);
  
  itemsToShow = signal<number>(9);

  allProducts = this.productService.getAllProducts();
  
  filteredProducts = computed(() => {
    let products = this.allProducts();
    
    // AND Logic: Apply category filter
    const cat = this.selectedCategory();
    if (cat) {
      products = products.filter(p => p.category === cat);
    }
    
    // AND Logic: Apply price filter
    const price = this.maxPrice();
    if (price) {
      if (price === 300) {
         products = products.filter(p => p.price >= 200);
      } else if (price === 200) {
         products = products.filter(p => p.price >= 100 && p.price < 200);
      } else {
         products = products.filter(p => p.price < 100);
      }
    }

    return products;
  });

  displayedProducts = computed(() => {
    return this.filteredProducts().slice(0, this.itemsToShow());
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const cat = params['category'];
      const validCategories = this.productService.categories();
      if (cat && validCategories.includes(cat)) {
        this.setCategory(cat);
      } else {
        // If deep linked to just /shop, clear filters
        if (Object.keys(params).length === 0) {
           this.selectedCategory.set(null);
        }
      }
    });
  }

  setCategory(cat: Category | null) {
    this.selectedCategory.set(cat);
    this.itemsToShow.set(9);
  }

  setMaxPrice(price: number | null) {
    this.maxPrice.set(price);
    this.itemsToShow.set(9);
  }

  resetFilters() {
    this.selectedCategory.set(null);
    this.maxPrice.set(null);
    this.itemsToShow.set(9);
  }

  loadMore() {
    this.itemsToShow.update(current => current + 9);
  }
}
