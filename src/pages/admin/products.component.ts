
import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CurrencyService, CurrencyCode } from '../../services/currency.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Product } from '../../models/product';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, PricePipe],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold text-black font-serif">Products</h1>
        <button (click)="openModal()" class="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto">
          Add Product
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="mb-6">
         <div class="relative max-w-md">
            <input type="text" [(ngModel)]="searchTerm" placeholder="Search products by name or brand..." class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white text-black placeholder-black">
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
         </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest w-12">Status</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Product</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Stock (Inline)</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Price (USD)</th>
                <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (product of filteredProducts(); track product.id) {
                <tr class="hover:bg-gray-50 transition-colors group">
                  <!-- Status Toggle -->
                  <td class="px-6 py-4 whitespace-nowrap">
                     <button class="w-3 h-3 rounded-full transition-colors focus:outline-none ring-2 ring-offset-2"
                        [class.bg-green-500]="true" 
                        [class.ring-green-500]="true"
                        title="Published (Click to toggle - mock)">
                     </button>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-12 w-12 bg-gray-100 border border-gray-200 relative">
                        <img class="h-12 w-12 object-cover" [src]="product.image" alt="">
                        @if (product.badge) {
                          <span class="absolute top-0 right-0 -mt-1 -mr-1 bg-red-600 text-white text-[8px] px-1 rounded-sm">{{ product.badge }}</span>
                        }
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-bold text-gray-900 line-clamp-1 max-w-[200px]">{{ product.name }}</div>
                        <div class="text-xs text-gray-500 uppercase tracking-wide">{{ product.brand }}</div>
                      </div>
                    </div>
                  </td>
                  
                  <!-- Inline Stock Edit (Real) -->
                  <td class="px-6 py-4 whitespace-nowrap">
                     <div class="flex items-center">
                        <input type="number" [ngModel]="product.stock" (change)="updateStock(product, $event)" class="w-16 border border-transparent bg-transparent hover:bg-white hover:border-gray-300 focus:bg-white focus:border-black focus:ring-1 focus:ring-black rounded px-2 py-1 text-sm transition-all text-black" />
                        <span class="text-xs text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                     </div>
                  </td>

                  <!-- Inline Price Edit (Real) -->
                  <td class="px-6 py-4 whitespace-nowrap">
                     <div class="flex items-center">
                        <span class="text-sm text-gray-500 mr-1">$</span>
                        <input type="number" [ngModel]="product.price" (change)="updatePrice(product, $event)" class="w-20 border border-transparent bg-transparent hover:bg-white hover:border-gray-300 focus:bg-white focus:border-black focus:ring-1 focus:ring-black rounded px-2 py-1 text-sm font-bold text-gray-900 transition-all" />
                     </div>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button (click)="duplicateProduct(product)" class="text-blue-600 hover:text-blue-900 font-bold uppercase text-[10px] tracking-wider">Duplicate</button>
                    <span class="text-gray-300">|</span>
                    <button (click)="editProduct(product)" class="text-black hover:text-gray-600 font-bold uppercase text-[10px] tracking-wider">Edit</button>
                    <span class="text-gray-300">|</span>
                    <button (click)="deleteProduct(product.id)" class="text-gray-400 hover:text-red-600 font-bold uppercase text-[10px] tracking-wider">Delete</button>
                  </td>
                </tr>
              }
              @if (filteredProducts().length === 0) {
                 <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                       No products found matching "{{ searchTerm() }}".
                    </td>
                 </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Advanced Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-black/60 transition-opacity" (click)="closeModal()"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                  <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6 font-serif">{{ isEditing() ? 'Edit Product' : 'Add New Product' }}</h3>
                  
                  <div class="space-y-4">
                    <!-- Name -->
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Name</label>
                      <input type="text" formControlName="name" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black">
                    </div>

                    <!-- Brand & Category -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Brand</label>
                          <input type="text" formControlName="brand" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black">
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Category</label>
                          <select formControlName="category" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black">
                            @for (cat of productService.categories(); track cat) {
                               <option [value]="cat">{{ cat }}</option>
                            }
                          </select>
                        </div>
                    </div>
                    
                    <!-- Colors & Badge -->
                    <div class="grid grid-cols-2 gap-4">
                       <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Colors (Comma separated)</label>
                          <input type="text" formControlName="colors" placeholder="e.g. Red, Blue" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black">
                       </div>
                       <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Badge / Label</label>
                          <div class="flex gap-2 mb-1">
                             <button type="button" (click)="setBadge('SALE')" class="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">SALE</button>
                             <button type="button" (click)="setBadge('HOT')" class="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200">HOT</button>
                             <button type="button" (click)="setBadge('NEW')" class="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">NEW</button>
                             <button type="button" (click)="setBadge('50% OFF')" class="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">50%</button>
                          </div>
                          <input type="text" formControlName="badge" placeholder="e.g. 20% OFF" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black">
                       </div>
                    </div>

                    <!-- Price with Currency Selection -->
                    <div class="bg-gray-50 p-3 rounded-none border border-gray-200">
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Price Setup</label>
                      <div class="grid grid-cols-3 gap-2">
                        <div class="col-span-1">
                          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Currency</label>
                          <select formControlName="inputCurrency" class="block w-full border border-gray-300 px-2 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black">
                            <option value="USD">Dollar ($)</option>
                            <option value="PKR">PKR (Rs)</option>
                            <option value="INR">INR (₹)</option>
                          </select>
                        </div>
                        <div class="col-span-2">
                           <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Amount</label>
                           <input type="number" formControlName="price" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black">
                        </div>
                      </div>
                      <p class="text-[10px] text-gray-500 mt-2">
                         System will automatically convert <strong>{{ productForm.get('inputCurrency')?.value }} {{ productForm.get('price')?.value }}</strong> to USD for global storage.
                      </p>
                    </div>
                    
                    <!-- Stock -->
                    <div>
                       <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Initial Stock</label>
                       <input type="number" formControlName="stock" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black">
                    </div>

                    <!-- Image Management Section -->
                    <div class="border-t border-b border-gray-100 py-4">
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Product Gallery</label>
                      
                      <!-- Thumbnail (Main Image) -->
                      <div class="mb-4">
                         <div class="flex justify-between items-end mb-1">
                            <label class="block text-[10px] font-bold text-blue-600 uppercase tracking-wide">Main Thumbnail</label>
                            <button type="button" (click)="toggleThumbnailMode()" class="text-[10px] text-gray-500 hover:text-black underline">
                               Switch to {{ thumbnailMode() === 'url' ? 'Upload' : 'URL' }}
                            </button>
                         </div>
                         
                         <div class="flex gap-2 items-center">
                            @if (thumbnailMode() === 'url') {
                               <input type="text" formControlName="image" placeholder="https://example.com/main.jpg" class="block flex-1 border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black">
                            } @else {
                               <input type="file" (change)="onFileSelected($event, true)" accept="image/*" class="block flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200">
                            }

                            @if (productForm.get('image')?.value) {
                               <img [src]="productForm.get('image')?.value" class="h-10 w-10 object-cover border" alt="Thumb">
                            }
                         </div>
                      </div>

                      <!-- Gallery Images -->
                      <div class="space-y-2">
                         <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Additional Images</label>
                         
                         @for (img of galleryImages(); track $index) {
                            <div class="flex items-center gap-2">
                               <img [src]="img" class="h-9 w-9 object-cover border border-gray-200 bg-gray-50">
                               <input type="text" [value]="img.substring(0, 30) + '...'" readonly class="flex-1 bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-500">
                               <button type="button" (click)="removeGalleryImage($index)" class="p-2 text-red-500 hover:bg-red-50">
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                               </button>
                            </div>
                         }

                         <!-- Add New Image -->
                         <div class="flex gap-2 mt-2 items-center">
                            @if (galleryMode() === 'url') {
                               <input #newImgInput type="text" placeholder="Add image URL..." class="flex-1 border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black">
                               <button type="button" (click)="addGalleryImage(newImgInput.value); newImgInput.value=''" class="px-4 py-2 bg-gray-200 text-xs font-bold uppercase hover:bg-gray-300">Add URL</button>
                            } @else {
                               <input type="file" #fileInput (change)="onFileSelected($event, false)" accept="image/*" class="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200">
                            }
                            
                            <button type="button" (click)="toggleGalleryMode()" class="px-2 py-2 text-gray-500 hover:bg-gray-100" title="Switch Input Method">
                               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                            </button>
                         </div>
                      </div>
                    </div>

                    <!-- Description -->
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Description</label>
                      <textarea formControlName="description" rows="3" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black"></textarea>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                  <button type="submit" [disabled]="productForm.invalid" class="w-full inline-flex justify-center border border-transparent shadow-sm px-6 py-2 bg-black text-base font-bold text-white hover:bg-gray-800 sm:ml-3 sm:w-auto sm:text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isEditing() ? 'Update Product' : 'Create Product' }}
                  </button>
                  <button type="button" (click)="closeModal()" class="mt-3 w-full inline-flex justify-center border border-gray-300 shadow-sm px-6 py-2 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm uppercase tracking-wider">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminProductsComponent {
  productService = inject(ProductService);
  currencyService = inject(CurrencyService);
  private fb: FormBuilder = inject(FormBuilder);
  
  isModalOpen = signal(false);
  isEditing = signal(false);
  
  searchTerm = signal('');
  galleryImages = signal<string[]>([]);
  
  thumbnailMode = signal<'url' | 'file'>('url');
  galleryMode = signal<'url' | 'file'>('url');

  editingId: number | null = null;

  productForm = this.fb.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    inputCurrency: ['USD'], 
    category: ['', Validators.required],
    image: ['', Validators.required], // This is the Thumbnail
    description: ['', Validators.required],
    stock: [10, [Validators.required, Validators.min(0)]],
    colors: [''], // Comma separated string input
    badge: [''] // Custom label
  });
  
  filteredProducts = computed(() => {
     const term = this.searchTerm().toLowerCase();
     const products = this.productService.getAllProducts()();
     if (!term) return products;
     
     return products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.brand.toLowerCase().includes(term)
     );
  });

  setBadge(value: string) {
    this.productForm.patchValue({ badge: value });
  }

  openModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.galleryImages.set([]);
    this.thumbnailMode.set('url');
    // Default to first category if available
    const defaultCat = this.productService.categories().length > 0 ? this.productService.categories()[0] : '';
    this.productForm.reset({ category: defaultCat, price: 0, inputCurrency: 'USD', stock: 10, colors: '', badge: '' });
    this.isModalOpen.set(true);
  }

  editProduct(product: Product) {
    this.isEditing.set(true);
    this.editingId = product.id;
    
    const others = product.images.filter(img => img !== product.image);
    this.galleryImages.set(others);
    
    this.productForm.patchValue({
      name: product.name,
      brand: product.brand,
      price: product.price, // Loaded as USD
      inputCurrency: 'USD',
      category: product.category,
      image: product.image,
      description: product.description,
      stock: product.stock,
      colors: product.colors ? product.colors.join(', ') : '',
      badge: product.badge || ''
    });
    this.isModalOpen.set(true);
  }

  toggleThumbnailMode() {
    this.thumbnailMode.update(m => m === 'url' ? 'file' : 'url');
  }

  toggleGalleryMode() {
    this.galleryMode.update(m => m === 'url' ? 'file' : 'url');
  }

  onFileSelected(event: any, isThumbnail: boolean) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (isThumbnail) {
           this.productForm.patchValue({ image: result });
        } else {
           this.addGalleryImage(result);
           // Reset file input value so same file can be selected again if needed
           event.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  }

  addGalleryImage(url: string) {
    if (url && url.trim() !== '') {
      this.galleryImages.update(imgs => [...imgs, url.trim()]);
    }
  }

  removeGalleryImage(index: number) {
    this.galleryImages.update(imgs => imgs.filter((_, i) => i !== index));
  }

  duplicateProduct(product: Product) {
    const newProduct = { ...product, id: Math.floor(Math.random() * 100000), name: `${product.name} (Copy)` };
    this.productService.addProduct(newProduct);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  deleteProduct(id: number) {
    if(confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id);
    }
  }

  updateStock(product: Product, event: Event) {
    const newVal = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(newVal) && newVal >= 0) {
      this.productService.updateProductStock(product.id, newVal);
    }
  }

  updatePrice(product: Product, event: Event) {
    const newVal = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(newVal) && newVal >= 0) {
       // We update the product entirely for price
       const updated = { ...product, price: newVal };
       this.productService.updateProduct(updated);
    }
  }

  onSubmit() {
    if (this.productForm.valid) {
      const val = this.productForm.value;
      
      const inputCurrency = val.inputCurrency as CurrencyCode;
      const inputPrice = val.price || 0;
      const exchangeRate = this.currencyService.rates[inputCurrency];
      
      const usdPrice = parseFloat((inputPrice / exchangeRate).toFixed(2));

      // Construct images array: Main Thumbnail + Gallery Images
      const allImages = [val.image, ...this.galleryImages()];

      // Parse colors
      let parsedColors: string[] = [];
      if (val.colors && typeof val.colors === 'string') {
         parsedColors = val.colors.split(',').map(c => c.trim()).filter(c => c !== '');
      }

      const productData: any = {
        name: val.name,
        brand: val.brand,
        price: usdPrice,
        category: val.category,
        image: val.image, // Main thumbnail
        images: allImages, // All images for slider
        description: val.description,
        rating: 0,
        reviews: 0,
        stock: val.stock,
        colors: parsedColors,
        badge: val.badge
      };

      if (this.isEditing() && this.editingId) {
        // Maintain existing ID, rating, reviews if editing
        const original = this.productService.getProductById(this.editingId);
        productData.id = this.editingId;
        productData.rating = original?.rating || 0;
        productData.reviews = original?.reviews || 0;
        productData.reviewsList = original?.reviewsList || [];
        productData.sizes = original?.sizes || ['S', 'M', 'L'];
        
        this.productService.updateProduct(productData);
      } else {
        productData.id = Math.floor(Math.random() * 100000);
        productData.sizes = ['S', 'M', 'L'];
        this.productService.addProduct(productData);
      }
      this.closeModal();
    }
  }
}
