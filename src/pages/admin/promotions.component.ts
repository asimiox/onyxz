
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { PromotionService } from '../../services/promotion.service';
import { Promotion } from '../../models/promotion';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold text-black font-serif">Promotions & Coupons</h1>
        <button (click)="openModal()" class="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto">
          Create Promotion
        </button>
      </div>

      <!-- Filters/Tabs -->
      <div class="flex space-x-1 border-b border-gray-200 mb-6">
         <button (click)="filterType.set('all')" [class.border-black]="filterType() === 'all'" [class.text-black]="filterType() === 'all'" class="px-6 py-3 text-sm font-bold uppercase tracking-wide text-gray-500 border-b-2 border-transparent hover:text-black transition-colors">All</button>
         <button (click)="filterType.set('coupon')" [class.border-black]="filterType() === 'coupon'" [class.text-black]="filterType() === 'coupon'" class="px-6 py-3 text-sm font-bold uppercase tracking-wide text-gray-500 border-b-2 border-transparent hover:text-black transition-colors">Coupons</button>
         <button (click)="filterType.set('popup')" [class.border-black]="filterType() === 'popup'" [class.text-black]="filterType() === 'popup'" class="px-6 py-3 text-sm font-bold uppercase tracking-wide text-gray-500 border-b-2 border-transparent hover:text-black transition-colors">Flyers / Popups</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (promo of filteredPromotions(); track promo.id) {
           <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden group hover:shadow-md transition-shadow relative">
              
              <!-- Status Badge -->
              <div class="absolute top-3 right-3 z-10">
                 <button (click)="toggleStatus(promo)" class="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-colors bg-white shadow-sm"
                    [class.text-green-600]="promo.active" [class.border-green-200]="promo.active"
                    [class.text-gray-400]="!promo.active" [class.border-gray-200]="!promo.active">
                    {{ promo.active ? 'Active' : 'Inactive' }}
                 </button>
              </div>

              <!-- Card Content -->
              @if (promo.type === 'popup') {
                 <!-- Popup Preview Card -->
                 <div class="aspect-video relative bg-gray-100">
                    <img [src]="promo.image" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity">
                    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                       <p class="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Popup Ad</p>
                       <h3 class="font-bold truncate">{{ promo.name }}</h3>
                    </div>
                 </div>
                 <div class="p-4">
                    <p class="text-sm text-gray-600 line-clamp-2 mb-4 h-10">{{ promo.description }}</p>
                    <div class="flex items-center justify-between">
                       <span class="text-xs font-bold text-gray-400">Button: {{ promo.buttonText }}</span>
                       <button (click)="deletePromo(promo.id)" class="text-red-500 text-xs font-bold uppercase hover:underline">Delete</button>
                    </div>
                 </div>
              } @else {
                 <!-- Coupon Card -->
                 <div class="p-6 flex flex-col h-full">
                    <div class="flex items-center gap-3 mb-4">
                       <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                       </div>
                       <div>
                          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coupon</p>
                          <h3 class="font-bold text-black">{{ promo.name }}</h3>
                       </div>
                    </div>
                    
                    <div class="bg-gray-50 border border-gray-200 border-dashed rounded p-3 text-center mb-4">
                       <span class="font-mono font-bold text-lg tracking-wider">{{ promo.code }}</span>
                    </div>

                    <div class="mt-auto flex items-center justify-between">
                       <div class="text-sm font-bold text-green-600">
                          {{ promo.discountType === 'percentage' ? promo.discountValue + '%' : '$' + promo.discountValue }} OFF
                       </div>
                       <button (click)="deletePromo(promo.id)" class="text-red-500 text-xs font-bold uppercase hover:underline">Delete</button>
                    </div>
                 </div>
              }
           </div>
        }
      </div>

      <!-- Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="flex items-center justify-center min-h-screen px-4">
            <div class="fixed inset-0 bg-black/60 transition-opacity" (click)="isModalOpen.set(false)"></div>
            
            <div class="relative bg-white w-full max-w-lg rounded-sm shadow-xl overflow-hidden">
               <form [formGroup]="promoForm" (ngSubmit)="onSubmit()">
                  <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                     <h3 class="text-lg font-bold font-serif">Create Promotion</h3>
                     <button type="button" (click)="isModalOpen.set(false)" class="text-gray-400 hover:text-black">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>
                  
                  <div class="p-6 space-y-5">
                     <!-- Type Selection -->
                     <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Promotion Type</label>
                        <div class="grid grid-cols-2 gap-4">
                           <label class="cursor-pointer border-2 rounded p-3 text-center hover:border-black transition-all"
                                  [class.border-black]="promoForm.get('type')?.value === 'coupon'"
                                  [class.bg-gray-50]="promoForm.get('type')?.value === 'coupon'"
                                  [class.border-gray-200]="promoForm.get('type')?.value !== 'coupon'">
                              <input type="radio" formControlName="type" value="coupon" class="sr-only">
                              <span class="font-bold text-sm">Coupon Code</span>
                           </label>
                           <label class="cursor-pointer border-2 rounded p-3 text-center hover:border-black transition-all"
                                  [class.border-black]="promoForm.get('type')?.value === 'popup'"
                                  [class.bg-gray-50]="promoForm.get('type')?.value === 'popup'"
                                  [class.border-gray-200]="promoForm.get('type')?.value !== 'popup'">
                              <input type="radio" formControlName="type" value="popup" class="sr-only">
                              <span class="font-bold text-sm">Flyer / Popup</span>
                           </label>
                        </div>
                     </div>

                     <!-- Common Name -->
                     <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Campaign Name</label>
                        <input type="text" formControlName="name" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black">
                     </div>

                     <!-- Coupon Specific Fields -->
                     @if (promoForm.get('type')?.value === 'coupon') {
                        <div class="bg-blue-50 p-4 border border-blue-100 space-y-4 rounded-sm animate-in fade-in slide-in-from-top-2">
                           <div>
                              <label class="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Coupon Code</label>
                              <input type="text" formControlName="code" placeholder="e.g., SUMMER20" class="block w-full border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 uppercase font-mono bg-white text-black placeholder-black">
                           </div>
                           <div class="grid grid-cols-2 gap-4">
                              <div>
                                 <label class="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Discount Type</label>
                                 <select formControlName="discountType" class="block w-full border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black">
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount ($)</option>
                                 </select>
                              </div>
                              <div>
                                 <label class="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Value</label>
                                 <input type="number" formControlName="discountValue" class="block w-full border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black">
                              </div>
                           </div>
                        </div>
                     }

                     <!-- Popup Specific Fields -->
                     @if (promoForm.get('type')?.value === 'popup') {
                        <div class="bg-gray-50 p-4 border border-gray-200 space-y-4 rounded-sm animate-in fade-in slide-in-from-top-2">
                           
                           <!-- Image Input Section -->
                           <div>
                              <div class="flex justify-between items-center mb-1">
                                 <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide">Image</label>
                                 <div class="flex space-x-3">
                                   <button type="button" (click)="imageInputType.set('url')" [class.text-black]="imageInputType() === 'url'" [class.text-gray-400]="imageInputType() !== 'url'" class="text-[10px] font-bold uppercase hover:underline">URL Link</button>
                                   <span class="text-gray-300">|</span>
                                   <button type="button" (click)="imageInputType.set('file')" [class.text-black]="imageInputType() === 'file'" [class.text-gray-400]="imageInputType() !== 'file'" class="text-[10px] font-bold uppercase hover:underline">Upload File</button>
                                 </div>
                              </div>

                              @if (imageInputType() === 'url') {
                                 <input type="text" formControlName="image" placeholder="https://..." class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black">
                              } @else {
                                 <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-none hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input type="file" (change)="onFileSelected($event)" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                                    <div class="space-y-1 text-center">
                                       <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                       </svg>
                                       <div class="text-xs text-gray-600">
                                          <span class="font-bold text-black">Click to upload</span> or drag and drop
                                       </div>
                                       <p class="text-xs text-gray-500">PNG, JPG, GIF</p>
                                    </div>
                                 </div>
                              }
                              
                              <!-- Preview -->
                              @if (promoForm.get('image')?.value) {
                                 <div class="mt-3">
                                    <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Preview</p>
                                    <img [src]="promoForm.get('image')?.value" class="h-24 w-auto object-cover border border-gray-200" alt="Preview">
                                 </div>
                              }
                           </div>

                           <div>
                              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Description / Text</label>
                              <textarea formControlName="description" rows="2" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black bg-white text-black placeholder-black"></textarea>
                           </div>
                           <div class="grid grid-cols-2 gap-4">
                              <div>
                                 <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Button Text</label>
                                 <input type="text" formControlName="buttonText" placeholder="Shop Now" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black bg-white text-black placeholder-black">
                              </div>
                              <div>
                                 <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Link URL</label>
                                 <input type="text" formControlName="buttonLink" placeholder="/shop" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black bg-white text-black placeholder-black">
                              </div>
                           </div>
                        </div>
                     }

                  </div>

                  <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                     <button type="button" (click)="isModalOpen.set(false)" class="px-6 py-2 border border-gray-300 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Cancel</button>
                     <button type="submit" [disabled]="promoForm.invalid" class="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">Save Promotion</button>
                  </div>
               </form>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminPromotionsComponent {
  promotionService = inject(PromotionService);
  fb = inject(FormBuilder);

  isModalOpen = signal(false);
  filterType = signal<'all' | 'coupon' | 'popup'>('all');
  imageInputType = signal<'url' | 'file'>('url');

  promoForm = this.fb.group({
    type: ['coupon', Validators.required],
    name: ['', Validators.required],
    // Coupon fields
    code: [''],
    discountType: ['percentage'],
    discountValue: [0],
    // Popup fields
    image: [''],
    description: [''],
    buttonText: [''],
    buttonLink: ['']
  });

  filteredPromotions = computed(() => {
    const all = this.promotionService.getPromotions()();
    if (this.filterType() === 'all') return all;
    return all.filter(p => p.type === this.filterType());
  });

  openModal() {
    this.imageInputType.set('url');
    this.promoForm.reset({
      type: 'coupon',
      discountType: 'percentage',
      discountValue: 10,
      buttonText: 'Shop Now',
      buttonLink: '/shop'
    });
    this.isModalOpen.set(true);
  }

  toggleStatus(promo: Promotion) {
    this.promotionService.toggleStatus(promo.id);
  }

  deletePromo(id: number) {
    if (confirm('Are you sure you want to delete this promotion?')) {
      this.promotionService.deletePromotion(id);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.promoForm.patchValue({ image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.promoForm.valid) {
      const val = this.promoForm.value;
      
      const newPromo: Promotion = {
        id: Date.now(),
        active: true,
        type: val.type as 'coupon' | 'popup',
        name: val.name!,
        // Map fields based on type
        code: val.type === 'coupon' ? val.code! : undefined,
        discountType: val.type === 'coupon' ? (val.discountType as 'percentage' | 'fixed') : undefined,
        discountValue: val.type === 'coupon' ? val.discountValue! : undefined,
        
        image: val.type === 'popup' ? val.image! : undefined,
        description: val.type === 'popup' ? val.description! : undefined,
        buttonText: val.type === 'popup' ? val.buttonText! : undefined,
        buttonLink: val.type === 'popup' ? val.buttonLink! : undefined,
      };

      this.promotionService.addPromotion(newPromo);
      this.isModalOpen.set(false);
    }
  }
}
