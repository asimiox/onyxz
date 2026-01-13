
import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { OrderService } from '../../services/order.service';
import { DatePipe, CommonModule } from '@angular/common';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe, PricePipe, CommonModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-black mb-8 font-serif">User Management</h1>

      <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">User</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Lifetime Value (LTV)</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Last Login</th>
                <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (user of userService.getUsers()(); track user.id) {
                <tr class="hover:bg-gray-50 transition-colors group">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full grayscale object-cover" [src]="user.avatar" alt="">
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-bold text-gray-900">{{ user.name }}</div>
                        <div class="text-xs text-gray-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{{ user.role }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.joinedDate | date:'mediumDate' }}</td>
                  
                  <!-- LTV Calculation -->
                  <td class="px-6 py-4 whitespace-nowrap">
                     <div class="text-sm font-bold text-green-600">{{ calculateLTV(user.id) | price }}</div>
                     <div class="text-xs text-gray-400">{{ orderService.getOrdersByUserId(user.id).length }} Orders</div>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {{ getLastLogin(user.id) }}
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-gray-400 hover:text-red-600 font-bold uppercase text-xs tracking-wider border border-gray-200 px-3 py-1 rounded hover:border-red-600 transition-colors">Disable</button>
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
export class AdminUsersComponent {
  userService = inject(UserService);
  orderService = inject(OrderService);

  calculateLTV(userId: number): number {
    const orders = this.orderService.getOrdersByUserId(userId);
    return orders.reduce((sum, order) => sum + order.total, 0);
  }

  getLastLogin(userId: number): string {
    // Mock logic since we don't track session history in this demo
    return '2 hours ago'; 
  }
}
