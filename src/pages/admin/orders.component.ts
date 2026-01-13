
import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { AuditService } from '../../services/audit.service';
import { OrderStatus } from '../../models/order';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [DatePipe, PricePipe, FormsModule, CommonModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-black mb-8 font-serif">Order Management</h1>

      <!-- Filters -->
      <div class="mb-6 flex items-center gap-4">
         <div class="relative w-64">
            <select [(ngModel)]="statusFilter" class="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer bg-white text-black">
               <option value="All">All Statuses</option>
               <option value="Pending">Pending</option>
               <option value="Processing">Processing</option>
               <option value="Shipped">Shipped</option>
               <option value="Delivered">Delivered</option>
               <option value="Cancelled">Cancelled</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
         </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Order ID</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Total</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Admin Notes</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (order of filteredOrders(); track order.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">{{ order.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     {{ order.customerName }}<br/>
                     <span class="text-xs text-gray-400">{{ order.date | date:'short' }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold uppercase tracking-wide border"
                      [class.bg-gray-900]="order.status === 'Delivered'"
                      [class.text-white]="order.status === 'Delivered'"
                      [class.border-gray-900]="order.status === 'Delivered'"
                      [class.bg-white]="order.status !== 'Delivered'"
                      [class.text-gray-900]="order.status !== 'Delivered'"
                      [class.border-gray-200]="order.status !== 'Delivered'">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ order.total | price }}</td>
                  
                  <!-- Admin Notes (Enterprise) -->
                  <td class="px-6 py-4 whitespace-nowrap">
                     <input 
                        type="text" 
                        [value]="order.adminNotes || ''" 
                        (change)="updateNotes(order.id, $event)"
                        placeholder="Internal Note" 
                        class="border border-gray-200 text-xs p-2 rounded w-full bg-white text-black placeholder-gray-400 focus:border-black focus:ring-0">
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select (change)="updateStatus(order.id, $event)" class="bg-white text-black text-xs font-bold uppercase border border-gray-300 rounded px-3 py-2 focus:border-black focus:ring-black cursor-pointer shadow-sm">
                      <option [selected]="order.status === 'Pending'" value="Pending">Pending</option>
                      <option [selected]="order.status === 'Processing'" value="Processing">Processing</option>
                      <option [selected]="order.status === 'Shipped'" value="Shipped">Shipped</option>
                      <option [selected]="order.status === 'Delivered'" value="Delivered">Delivered</option>
                      <option [selected]="order.status === 'Cancelled'" value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              }
              @if (filteredOrders().length === 0) {
                 <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                       No orders found.
                    </td>
                 </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersComponent {
  orderService = inject(OrderService);
  auditService = inject(AuditService);

  statusFilter = signal<string>('All');

  filteredOrders = computed(() => {
     const status = this.statusFilter();
     const orders = this.orderService.getOrders()();

     if (status === 'All') return orders;
     return orders.filter(o => o.status === status);
  });

  updateStatus(id: string, event: Event) {
    const status = (event.target as HTMLSelectElement).value as OrderStatus;
    this.orderService.updateStatus(id, status);
    this.auditService.logAction('Admin', 'Order Update', `Updated order ${id} status to ${status}`);
  }

  updateNotes(id: string, event: Event) {
     const notes = (event.target as HTMLInputElement).value;
     this.orderService.updateAdminNotes(id, notes);
     // Debouncing would be ideal here in real app, logging every blur for now
     this.auditService.logAction('Admin', 'Note Update', `Updated note for order ${id}`);
  }
}
