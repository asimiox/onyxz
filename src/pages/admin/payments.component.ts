
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { PaymentGateway, PaymentType } from '../../models/payment';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold text-black font-serif">Payment Methods</h1>
        <button (click)="openModal()" class="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto">
          Add Gateway
        </button>
      </div>

      <!-- Payment Methods Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (gateway of paymentService.getGateways()(); track gateway.id) {
           <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
              
              <!-- Status Toggle (Top Right) -->
              <div class="absolute top-3 right-3">
                 <button (click)="toggleStatus(gateway)" 
                    class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
                    [class.bg-green-500]="gateway.isEnabled"
                    [class.bg-gray-200]="!gateway.isEnabled">
                    <span class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                       [class.translate-x-5]="gateway.isEnabled"
                       [class.translate-x-0]="!gateway.isEnabled">
                    </span>
                 </button>
              </div>

              <div class="p-6">
                 <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
                         [class.bg-blue-600]="gateway.type === 'Bank Transfer'"
                         [class.bg-green-600]="gateway.type === 'Mobile Wallet'"
                         [class.bg-yellow-500]="gateway.type === 'Crypto'"
                         [class.bg-gray-800]="gateway.type === 'COD'"
                         [class.bg-purple-600]="gateway.type === 'Credit Card'"
                         [class.bg-indigo-500]="gateway.type === 'Other'">
                       {{ getInitials(gateway.type) }}
                    </div>
                    <div>
                       <h3 class="font-bold text-black text-lg">{{ gateway.name }}</h3>
                       <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ gateway.type }}</span>
                    </div>
                 </div>

                 @if (gateway.type !== 'COD') {
                    <div class="space-y-2 mb-4 bg-gray-50 p-3 rounded text-sm text-gray-600">
                       @if (gateway.accountTitle) {
                          <div class="flex justify-between">
                             <span class="font-bold text-xs uppercase text-gray-400">Title</span>
                             <span class="font-bold">{{ gateway.accountTitle }}</span>
                          </div>
                       }
                       @if (gateway.accountNumber) {
                          <div class="flex justify-between">
                             <span class="font-bold text-xs uppercase text-gray-400">Account / Addr</span>
                             <span class="font-mono">{{ gateway.accountNumber }}</span>
                          </div>
                       }
                    </div>
                 }

                 @if (gateway.instructions) {
                    <p class="text-xs text-gray-500 italic mb-4 border-l-2 border-gray-200 pl-2">"{{ gateway.instructions }}"</p>
                 }

                 <div class="border-t border-gray-100 pt-4 flex justify-end gap-3">
                    <button (click)="editGateway(gateway)" class="text-xs font-bold text-blue-600 uppercase hover:underline">Edit</button>
                    <button (click)="deleteGateway(gateway.id)" class="text-xs font-bold text-red-500 uppercase hover:underline">Delete</button>
                 </div>
              </div>
           </div>
        }
      </div>

      <!-- Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div class="fixed inset-0 bg-black/60 transition-opacity" (click)="closeModal()"></div>
            
            <div class="relative bg-white w-full max-w-lg rounded-sm shadow-xl overflow-hidden transform transition-all">
               <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
                  <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                     <h3 class="text-lg font-bold font-serif">{{ isEditing() ? 'Edit Gateway' : 'Add New Gateway' }}</h3>
                     <button type="button" (click)="closeModal()" class="text-gray-400 hover:text-black">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>
                  
                  <div class="p-6 space-y-5">
                     <!-- Type -->
                     <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Gateway Type</label>
                        <select formControlName="type" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black">
                           <option value="Mobile Wallet">Mobile Wallet (Easypaisa/Jazzcash)</option>
                           <option value="Bank Transfer">Bank Transfer</option>
                           <option value="Crypto">Crypto (USDT/BTC)</option>
                           <option value="COD">Cash on Delivery</option>
                           <option value="Credit Card">Credit Card (Manual/Link)</option>
                           <option value="Other">Other</option>
                        </select>
                     </div>

                     <!-- Name -->
                     <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Display Name</label>
                        <input type="text" formControlName="name" placeholder="e.g. Easypaisa" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black">
                     </div>

                     <!-- Dynamic Fields based on Type -->
                     @if (paymentForm.get('type')?.value !== 'COD') {
                        <div class="grid grid-cols-2 gap-4 animate-in fade-in">
                           <div>
                              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Account Title</label>
                              <input type="text" formControlName="accountTitle" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black">
                           </div>
                           <div>
                              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Account Number / IBAN</label>
                              <input type="text" formControlName="accountNumber" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black">
                           </div>
                        </div>
                     }

                     <!-- Instructions -->
                     <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Instructions for User</label>
                        <textarea formControlName="instructions" rows="3" class="block w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black rounded-none bg-white text-black placeholder-black" placeholder="e.g. Send screenshot to WhatsApp..."></textarea>
                     </div>

                     <!-- Enabled -->
                     <div class="flex items-center">
                        <input type="checkbox" formControlName="isEnabled" id="isEnabled" class="h-4 w-4 text-black focus:ring-black border-gray-300 rounded">
                        <label for="isEnabled" class="ml-2 block text-sm text-gray-900">Enable this payment method</label>
                     </div>
                  </div>

                  <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                     <button type="button" (click)="closeModal()" class="px-6 py-2 border border-gray-300 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Cancel</button>
                     <button type="submit" [disabled]="paymentForm.invalid" class="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {{ isEditing() ? 'Update' : 'Save' }}
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
export class AdminPaymentsComponent {
  paymentService = inject(PaymentService);
  toastService = inject(ToastService);
  fb = inject(FormBuilder);

  isModalOpen = signal(false);
  isEditing = signal(false);
  editingId: number | null = null;

  paymentForm = this.fb.group({
    name: ['', Validators.required],
    type: ['Mobile Wallet', Validators.required],
    accountTitle: [''],
    accountNumber: [''],
    instructions: [''],
    isEnabled: [true]
  });

  getInitials(type: string): string {
    if (type === 'Mobile Wallet') return 'MW';
    if (type === 'Bank Transfer') return 'BK';
    if (type === 'Crypto') return 'CR';
    if (type === 'COD') return 'CD';
    return 'PY';
  }

  openModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.paymentForm.reset({ type: 'Mobile Wallet', isEnabled: true });
    this.isModalOpen.set(true);
  }

  editGateway(gateway: PaymentGateway) {
    this.isEditing.set(true);
    this.editingId = gateway.id;
    this.paymentForm.patchValue({
      name: gateway.name,
      type: gateway.type,
      accountTitle: gateway.accountTitle,
      accountNumber: gateway.accountNumber,
      instructions: gateway.instructions,
      isEnabled: gateway.isEnabled
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  deleteGateway(id: number) {
    if (confirm('Are you sure you want to delete this payment method?')) {
      this.paymentService.deleteGateway(id);
      this.toastService.show('Payment method deleted', 'success');
    }
  }

  toggleStatus(gateway: PaymentGateway) {
    this.paymentService.toggleStatus(gateway.id);
    this.toastService.show(`Gateway ${gateway.isEnabled ? 'disabled' : 'enabled'}`, 'info');
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      const val = this.paymentForm.value;
      const gatewayData: PaymentGateway = {
        id: this.editingId || Date.now(),
        name: val.name!,
        type: val.type as PaymentType,
        accountTitle: val.accountTitle || undefined,
        accountNumber: val.accountNumber || undefined,
        instructions: val.instructions || undefined,
        isEnabled: val.isEnabled!
      };

      if (this.isEditing()) {
        this.paymentService.updateGateway(gatewayData);
        this.toastService.show('Payment method updated', 'success');
      } else {
        this.paymentService.addGateway(gatewayData);
        this.toastService.show('Payment method added', 'success');
      }
      this.closeModal();
    }
  }
}
