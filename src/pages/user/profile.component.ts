import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service'; 
import { WishlistService } from '../../services/wishlist.service';
import { ProductService } from '../../services/product.service';
import { PricePipe } from '../../pipes/price.pipe';
import { ToastService } from '../../services/toast.service';
import { OrderStatus } from '../../models/order';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule, PricePipe, ReactiveFormsModule],
  template: `
    <div class="bg-gray-50 min-h-screen">
      
      <!-- Top Banner Profile Header -->
      <div class="bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
           <div class="flex items-center gap-6">
              <div class="h-20 w-20 rounded-full border-2 border-white/20 p-1 relative">
                 <img [src]="authService.currentUser()?.avatar" class="h-full w-full rounded-full object-cover grayscale" alt="Profile">
                 <div class="absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold"
                      [class.bg-orange-700]="authService.currentUser()?.tier === 'Bronze'"
                      [class.bg-gray-300]="authService.currentUser()?.tier === 'Silver'"
                      [class.bg-yellow-500]="authService.currentUser()?.tier === 'Gold'"
                      [class.bg-cyan-400]="authService.currentUser()?.tier === 'Diamond'">
                    {{ authService.currentUser()?.tier?.[0] }}
                 </div>
              </div>
              <div>
                <div class="flex items-center gap-2">
                   <h1 class="font-serif text-3xl font-bold tracking-tight">{{ authService.currentUser()?.name }}</h1>
                   <!-- Verification Badges -->
                   @if(authService.currentUser()?.tier === 'Gold') {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wide gap-1">
                         <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 01-2.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                         Verified
                      </span>
                   }
                   @if(authService.currentUser()?.tier === 'Diamond') {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white uppercase tracking-wide gap-1">
                         <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                         Premium User
                      </span>
                   }
                </div>
                <div class="flex items-center gap-2 mt-1">
                   <p class="text-sm uppercase tracking-widest font-bold"
                      [class.text-orange-400]="authService.currentUser()?.tier === 'Bronze'"
                      [class.text-gray-300]="authService.currentUser()?.tier === 'Silver'"
                      [class.text-yellow-400]="authService.currentUser()?.tier === 'Gold'"
                      [class.text-cyan-400]="authService.currentUser()?.tier === 'Diamond'">
                      {{ authService.currentUser()?.tier }} Member
                   </p>
                   <span class="text-gray-500">•</span>
                   <p class="text-gray-400 text-sm">{{ authService.currentUser()?.points }} Points</p>
                </div>
              </div>
           </div>
           
           <div class="flex gap-4">
             <button (click)="currentTab.set('account')" class="px-6 py-2 border border-white/30 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">Edit Profile</button>
           </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div class="lg:grid lg:grid-cols-12 lg:gap-8">
          
          <!-- Sidebar Navigation -->
          <div class="lg:col-span-3 mb-8 lg:mb-0">
            <div class="bg-white shadow-sm p-4 sticky top-24 rounded-sm">
               <nav class="space-y-1">
                 @for (tab of tabs; track tab.id) {
                   <button 
                    (click)="currentTab.set(tab.id)"
                    class="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-between group"
                    [class.bg-black]="currentTab() === tab.id"
                    [class.text-white]="currentTab() === tab.id"
                    [class.text-gray-500]="currentTab() !== tab.id"
                    [class.hover:bg-gray-100]="currentTab() !== tab.id"
                    [class.hover:text-black]="currentTab() !== tab.id">
                    {{ tab.label }}
                    @if (currentTab() === tab.id) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    }
                   </button>
                 }
                 <div class="border-t border-gray-100 my-2 pt-2">
                   <button (click)="authService.logout()" class="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">Log Out</button>
                 </div>
               </nav>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="lg:col-span-9 space-y-8">
            
            @if (currentTab() === 'dashboard') {
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Active Reward Card -->
                <div class="bg-white p-6 shadow-sm border-l-4 border-green-500 group hover:-translate-y-1 transition-transform duration-300">
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Reward</p>
                  <p class="text-xl font-serif font-bold text-green-600 mt-2 truncate">{{ activeRewardLabel() }}</p>
                  <p class="text-[10px] text-gray-500 mt-1">Available for next purchase.</p>
                </div>
                
                <!-- Points Card -->
                <div class="bg-white p-6 shadow-sm border-l-4 border-black group hover:-translate-y-1 transition-transform duration-300">
                   <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Points</p>
                   <p class="text-3xl font-serif font-bold text-black mt-2">{{ authService.currentUser()?.points }}</p>
                   <div class="w-full bg-gray-100 h-1.5 mt-3 rounded-full overflow-hidden">
                      <div class="bg-black h-full" [style.width]="progressToNextTier() + '%'"></div>
                   </div>
                   <p class="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wide">
                     {{ nextTierMessage() }}
                   </p>
                </div>

                <div class="bg-white p-6 shadow-sm border-l-4 border-black group hover:-translate-y-1 transition-transform duration-300">
                   <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Tier</p>
                   <p class="text-3xl font-serif font-bold text-black mt-2">{{ authService.currentUser()?.tier }}</p>
                </div>
              </div>
            }

            @if (currentTab() === 'orders') {
               <div class="space-y-8">
                 <h2 class="font-serif text-2xl font-bold text-black mb-6">Order History</h2>
                 
                 @for (order of myOrders(); track order.id) {
                   <div class="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <!-- Order Header -->
                      <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                         <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Placed</p>
                            <p class="text-sm font-bold text-black">{{ order.date | date:'longDate' }}</p>
                         </div>
                         <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                            <p class="text-sm font-bold text-black font-mono">{{ order.id }}</p>
                         </div>
                         <div class="sm:text-right">
                             <button (click)="downloadInvoice(order)" class="text-xs font-bold text-blue-600 uppercase underline tracking-wider mb-1 hover:text-blue-800">Download Invoice</button>
                             <p class="text-sm font-bold text-black">{{ order.total | price }}</p>
                         </div>
                      </div>
                      
                      <!-- Visual Timeline (Enterprise) -->
                      <div class="px-6 py-6 border-b border-gray-100 bg-white">
                         <div class="flex items-center justify-between relative">
                            <!-- Progress Bar -->
                            <div class="absolute left-0 right-0 top-1/2 h-1 bg-gray-100 -z-10"></div>
                            <div class="absolute left-0 top-1/2 h-1 bg-green-500 -z-10 transition-all duration-1000" [style.width]="getTimelineProgress(order.status) + '%'"></div>
                            
                            <!-- Steps -->
                            <div class="flex flex-col items-center">
                               <div class="w-3 h-3 rounded-full bg-green-500 border-2 border-white ring-2 ring-green-500"></div>
                               <span class="text-[10px] mt-2 font-bold uppercase text-gray-500">Pending</span>
                            </div>
                            <div class="flex flex-col items-center">
                               <div class="w-3 h-3 rounded-full border-2 border-white ring-2" [class.bg-green-500]="isStepActive(order.status, 'Processing')" [class.ring-green-500]="isStepActive(order.status, 'Processing')" [class.bg-gray-200]="!isStepActive(order.status, 'Processing')" [class.ring-gray-200]="!isStepActive(order.status, 'Processing')"></div>
                               <span class="text-[10px] mt-2 font-bold uppercase text-gray-500">Processing</span>
                            </div>
                            <div class="flex flex-col items-center">
                               <div class="w-3 h-3 rounded-full border-2 border-white ring-2" [class.bg-green-500]="isStepActive(order.status, 'Shipped')" [class.ring-green-500]="isStepActive(order.status, 'Shipped')" [class.bg-gray-200]="!isStepActive(order.status, 'Shipped')" [class.ring-gray-200]="!isStepActive(order.status, 'Shipped')"></div>
                               <span class="text-[10px] mt-2 font-bold uppercase text-gray-500">Shipped</span>
                            </div>
                            <div class="flex flex-col items-center">
                               <div class="w-3 h-3 rounded-full border-2 border-white ring-2" [class.bg-green-500]="order.status === 'Delivered'" [class.ring-green-500]="order.status === 'Delivered'" [class.bg-gray-200]="order.status !== 'Delivered'" [class.ring-gray-200]="order.status !== 'Delivered'"></div>
                               <span class="text-[10px] mt-2 font-bold uppercase text-gray-500">Delivered</span>
                            </div>
                         </div>
                      </div>

                      <div class="p-6">
                        <div class="space-y-4 max-h-40 overflow-y-auto">
                           @for (item of order.items; track item.product.id) {
                              <div class="flex items-center gap-4">
                                 <img [src]="item.product.image" class="w-10 h-10 object-cover rounded border border-gray-200">
                                 <div class="flex-1">
                                    <p class="text-sm font-bold text-black truncate">{{ item.product.name }}</p>
                                    <p class="text-xs text-gray-500">Qty: {{ item.quantity }} x {{ item.product.price | price }}</p>
                                 </div>
                                 <button *ngIf="order.status === 'Delivered'" [routerLink]="['/product', item.product.id]" class="text-[10px] font-bold bg-gray-100 px-3 py-1 uppercase rounded hover:bg-gray-200">Review</button>
                              </div>
                           }
                        </div>
                      </div>
                   </div>
                 }
                 
                 @if (myOrders().length === 0) {
                    <div class="text-center py-20 bg-white border border-gray-200 rounded-sm">
                       <p class="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                       <a routerLink="/shop" class="inline-block px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Start Shopping</a>
                    </div>
                 }
               </div>
            }

            @if (currentTab() === 'wishlist') {
              <div class="space-y-6">
                <h2 class="font-serif text-2xl font-bold text-black mb-6">My Wishlist</h2>
                @if (wishlistProducts().length > 0) {
                   <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      @for (product of wishlistProducts(); track product.id) {
                         <div class="bg-white p-4 rounded-sm shadow-sm border border-gray-100 flex flex-col group relative">
                            <!-- Sale Alerts -->
                            @if(product.originalPrice && product.price < product.originalPrice) {
                               <span class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10 animate-pulse">Price Drop!</span>
                            }
                            @if(product.stock < 5 && product.stock > 0) {
                               <span class="absolute top-8 left-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">Low Stock</span>
                            }

                            <button (click)="removeFromWishlist(product.id)" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 z-10">
                               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <img [src]="product.image" class="w-full aspect-square object-cover mb-4 rounded-sm grayscale group-hover:grayscale-0 transition-all">
                            <h3 class="text-sm font-bold text-black truncate">{{ product.name }}</h3>
                            <p class="text-xs text-gray-500 mb-2">{{ product.brand }}</p>
                            <div class="mt-auto flex items-center justify-between">
                               <span class="font-bold text-sm">{{ product.price | price }}</span>
                               <a [routerLink]="['/product', product.id]" class="text-xs font-bold uppercase tracking-wide underline">View</a>
                            </div>
                         </div>
                      }
                   </div>
                } @else {
                   <div class="text-center py-20 bg-white border border-gray-200 rounded-sm">
                       <p class="text-gray-500 mb-6">Your wishlist is empty.</p>
                       <a routerLink="/shop" class="inline-block px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Browse Products</a>
                    </div>
                }
              </div>
            }

            @if (currentTab() === 'account') {
               <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="bg-white p-8 shadow-sm">
                    <h2 class="font-serif text-xl font-bold text-black mb-6">Personal Info</h2>
                    <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-6">
                      <div>
                        <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                        <input type="text" formControlName="name" class="block w-full border border-gray-200 bg-white p-3 text-sm focus:border-black focus:ring-0 transition-colors outline-none text-black placeholder-black">
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                        <input type="email" formControlName="email" class="block w-full border border-gray-200 bg-white p-3 text-sm focus:border-black focus:ring-0 transition-colors outline-none text-black placeholder-black">
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                        <input type="tel" formControlName="phone" class="block w-full border border-gray-200 bg-white p-3 text-sm focus:border-black focus:ring-0 transition-colors outline-none text-black placeholder-black" placeholder="+1 (555) 000-0000">
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Address</label>
                        <textarea rows="3" formControlName="address" class="block w-full border border-gray-200 bg-white p-3 text-sm focus:border-black focus:ring-0 transition-colors outline-none text-black placeholder-black"></textarea>
                      </div>
                      <div class="pt-2">
                        <button type="submit" [disabled]="profileForm.invalid" class="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">Save Details</button>
                      </div>
                    </form>
                  </div>
               </div>
            }

            @if (currentTab() === 'security') {
              <div class="bg-white p-8 shadow-sm max-w-lg">
                <h2 class="font-serif text-xl font-bold text-black mb-6">Security Settings</h2>
                <form [formGroup]="passwordForm" (ngSubmit)="updatePassword()" class="space-y-6">
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Username</label>
                    <input type="text" formControlName="username" class="block w-full border border-gray-200 bg-white p-3 text-sm focus:border-black focus:ring-0 transition-colors outline-none text-black placeholder-black">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Old Password</label>
                    <input type="password" formControlName="oldPassword" class="block w-full border border-gray-200 bg-white p-3 text-sm focus:border-black focus:ring-0 transition-colors outline-none text-black placeholder-black">
                  </div>
                  <div>
                     <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">New Password</label>
                     <input type="password" formControlName="newPassword" class="block w-full border border-gray-200 bg-white p-3 text-sm focus:border-black focus:ring-0 transition-colors outline-none text-black placeholder-black">
                  </div>
                  <div class="pt-4">
                     <button type="submit" [disabled]="passwordForm.invalid" class="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">Update Password</button>
                  </div>
                </form>
              </div>
            }

          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  orderService = inject(OrderService);
  toastService = inject(ToastService);
  cartService = inject(CartService); 
  wishlistService = inject(WishlistService);
  productService = inject(ProductService);
  fb = inject(FormBuilder);
  
  currentTab = signal<'dashboard' | 'orders' | 'wishlist' | 'account' | 'security'>('dashboard');
  
  tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'My Orders' },
    { id: 'wishlist', label: 'My Wishlist' },
    { id: 'account', label: 'Account Settings' },
    { id: 'security', label: 'Security' }
  ] as const;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit() {
    const user = this.authService.currentUser();
    this.profileForm = this.fb.group({
      name: [user?.name || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: [user?.phone || ''],
      address: [user?.address || '']
    });

    this.passwordForm = this.fb.group({
      username: ['', Validators.required],
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  saveProfile() {
    if (this.profileForm.valid) {
      const val = this.profileForm.value;
      this.authService.updateProfile(val.name, val.email, val.phone, val.address);
      this.toastService.show('Profile updated successfully', 'success');
    }
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      const { username, oldPassword, newPassword } = this.passwordForm.value;
      const result = this.authService.changePassword(username, oldPassword, newPassword);
      if (result.success) {
        this.toastService.show(result.message, 'success');
        this.passwordForm.reset();
      } else {
        this.toastService.show(result.message, 'error');
      }
    }
  }

  myOrders = computed(() => {
    const user = this.authService.currentUser();
    const orders = user ? this.orderService.getOrdersByUserId(user.id) : [];
    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  wishlistProducts = computed(() => {
    const ids = this.wishlistService.wishlist();
    const all = this.productService.getAllProducts()();
    return all.filter(p => ids.includes(p.id));
  });

  removeFromWishlist(id: number) {
    this.wishlistService.toggleWishlist(id);
    this.toastService.show('Removed from wishlist', 'info');
  }

  progressToNextTier = computed(() => {
    const points = this.authService.currentUser()?.points || 0;
    if (points >= 500) return 100;
    if (points >= 300) return ((points - 300) / 200) * 100;
    if (points >= 150) return ((points - 150) / 150) * 100;
    return (points / 150) * 100;
  });

  nextTierMessage = computed(() => {
    const points = this.authService.currentUser()?.points || 0;
    if (points >= 500) return 'Max Tier Reached';
    if (points >= 300) return `${500 - points} Points to Diamond`;
    if (points >= 150) return `${300 - points} Points to Gold`;
    return `${150 - points} Points to Silver`;
  });

  activeRewardLabel = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'None';
    if (user.tier === 'Diamond' && !user.rewardsUsage.Diamond) return '100% OFF';
    if (user.tier === 'Gold' && !user.rewardsUsage.Gold) return '70% OFF';
    if (user.tier === 'Silver' && !user.rewardsUsage.Silver) return '40% OFF';
    return 'None';
  });

  // Timeline Utils
  getTimelineProgress(status: OrderStatus): number {
     if (status === 'Delivered') return 100;
     if (status === 'Shipped') return 66;
     if (status === 'Processing') return 33;
     return 0; // Pending
  }

  isStepActive(currentStatus: OrderStatus, step: OrderStatus): boolean {
     const order = ['Pending', 'Processing', 'Shipped', 'Delivered'];
     const idxCurrent = order.indexOf(currentStatus);
     const idxStep = order.indexOf(step);
     return idxCurrent >= idxStep;
  }

  downloadInvoice(order: any) {
     this.toastService.show(`Preparing invoice for Order #${order.id}...`, 'info');
     
     // Generate robust HTML content for the invoice
     const invoiceContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
           <meta charset="UTF-8">
           <title>Mixtas Invoice #${order.id}</title>
           <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; }
              .logo { font-size: 32px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; }
              .sub-logo { font-size: 14px; text-transform: uppercase; color: #666; letter-spacing: 1px; }
              .invoice-details { display: flex; justify-content: space-between; margin-bottom: 40px; }
              .col { width: 48%; }
              h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; font-weight: bold; }
              p { margin: 5px 0; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { text-align: left; padding: 12px 10px; border-bottom: 2px solid #000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
              td { padding: 15px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
              .total-section { text-align: right; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
              .total-row { display: flex; justify-content: flex-end; margin: 5px 0; font-size: 14px; }
              .total-row span:first-child { margin-right: 20px; font-weight: bold; color: #666; }
              .grand-total { font-size: 18px; font-weight: bold; margin-top: 15px; border-top: 2px solid #000; padding-top: 15px; }
              .grand-total span:first-child { color: #000; }
              .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
           </style>
        </head>
        <body>
           <div class="header">
              <div class="logo">Mixtas</div>
              <div class="sub-logo">Premium Urban Fashion</div>
           </div>
           
           <div class="invoice-details">
              <div class="col">
                 <h3>Billed To</h3>
                 <p><strong>${order.customerName}</strong></p>
                 <p>${order.phone}</p>
                 <p>${order.shippingAddress.replace(/\n/g, '<br>')}</p>
                 <p>${order.country}</p>
              </div>
              <div class="col" style="text-align: right;">
                 <h3>Order Details</h3>
                 <p>Order ID: <strong>${order.id}</strong></p>
                 <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                 <p>Payment Method: ${order.paymentMethod}</p>
                 <p>Order Status: ${order.status}</p>
              </div>
           </div>

           <table>
              <thead>
                 <tr>
                    <th>Item</th>
                    <th>Details</th>
                    <th>Qty</th>
                    <th style="text-align: right;">Total</th>
                 </tr>
              </thead>
              <tbody>
                 ${order.items.map((item: any) => `
                    <tr>
                       <td>${item.product.name}</td>
                       <td>Size: ${item.selectedSize} ${item.selectedColor ? '<br>Color: ' + item.selectedColor : ''}</td>
                       <td>${item.quantity}</td>
                       <td style="text-align: right;">$${(item.product.price * item.quantity).toFixed(2)}</td>
                    </tr>
                 `).join('')}
              </tbody>
           </table>

           <div class="total-section">
              <div class="total-row"><span>Subtotal:</span> <span>$${order.total.toFixed(2)}</span></div>
              <div class="total-row"><span>Shipping:</span> <span>Included</span></div>
              <div class="total-row grand-total"><span>Total:</span> <span>$${order.total.toFixed(2)}</span></div>
           </div>

           <div class="footer">
              <p>Thank you for shopping with Mixtas.</p>
              <p>For support, contact us at support@mixtas.com or visit our website.</p>
              <p>This is a computer-generated invoice.</p>
           </div>
        </body>
        </html>
     `;

     // Create Blob and Trigger Download using standard anchor method
     try {
       const blob = new Blob([invoiceContent], { type: 'text/html;charset=utf-8' });
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.style.display = 'none';
       a.href = url;
       a.download = `Mixtas-Invoice-${order.id}.html`;
       document.body.appendChild(a);
       a.click();
       
       // Cleanup
       setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.toastService.show('Invoice downloaded successfully', 'success');
       }, 100);
     } catch (e) {
       console.error('Download failed', e);
       this.toastService.show('Failed to download invoice. Please try again.', 'error');
     }
  }
  }
