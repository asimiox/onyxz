
import { Component, OnInit, ElementRef, viewChild, inject, computed, signal, effect } from '@angular/core';
import { DecimalPipe, DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { select, max, scaleBand, scaleLinear, axisBottom, axisLeft } from 'd3';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { ProductService } from '../../services/product.service';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DecimalPipe, PricePipe, DatePipe, RouterLink, CommonModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-black font-serif">Overview</h1>
        <div class="flex items-center gap-2">
           <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
           <span class="text-sm font-bold text-gray-500 uppercase tracking-widest">System Operational</span>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div class="bg-white border border-gray-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow">
          <dt class="text-xs font-bold text-gray-500 uppercase tracking-widest truncate">Total Revenue</dt>
          <dd class="mt-2 text-3xl font-serif font-bold text-black">{{ totalRevenue() | price }}</dd>
        </div>
        <div class="bg-white border border-gray-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow">
          <dt class="text-xs font-bold text-gray-500 uppercase tracking-widest truncate">Total Orders</dt>
          <dd class="mt-2 text-3xl font-serif font-bold text-black">{{ totalOrders() | number }}</dd>
        </div>
        <div class="bg-white border border-gray-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow">
          <dt class="text-xs font-bold text-gray-500 uppercase tracking-widest truncate">Registered Users</dt>
          <dd class="mt-2 text-3xl font-serif font-bold text-black">{{ totalUsers() | number }}</dd>
        </div>
        <div class="bg-white border border-gray-200 p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow">
          <dt class="text-xs font-bold text-gray-500 uppercase tracking-widest truncate">Profit Margin</dt>
          <dd class="mt-2 text-3xl font-serif font-bold text-green-600">{{ estimatedMargin() | price }}</dd>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
         <!-- Charts -->
         <div class="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
           <h3 class="text-lg font-bold text-black mb-6 uppercase tracking-wider text-xs">Revenue Analytics (Last 7 Days)</h3>
           @if(totalOrders() === 0) {
              <div class="h-80 flex items-center justify-center border-2 border-dashed border-gray-100 rounded">
                 <p class="text-gray-400 font-medium">No order data available yet.</p>
              </div>
           } @else {
              <div #chart class="w-full h-80"></div>
           }
         </div>

         <!-- Actionable Insights: Low Stock & Dead Stock -->
         <div class="space-y-6">
            <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-[200px]">
                <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                   <div class="flex items-center gap-2">
                     <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                     <h3 class="text-xs font-bold text-red-700 uppercase tracking-wider">Low Stock Alert</h3>
                   </div>
                </div>
                <div class="flex-1 overflow-auto p-4">
                   @if(lowStockProducts().length === 0) {
                      <p class="text-gray-400 text-xs">All stock levels healthy.</p>
                   } @else {
                      <ul class="space-y-2">
                        @for(product of lowStockProducts(); track product.id) {
                           <li class="flex justify-between text-xs">
                              <span class="font-bold truncate w-32">{{ product.name }}</span>
                              <span class="text-red-600 font-bold">{{ product.stock }} Left</span>
                           </li>
                        }
                      </ul>
                   }
                </div>
            </div>

            <!-- Dead Stock (No sales inference) -->
            <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-[200px]">
                <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-yellow-50">
                   <div class="flex items-center gap-2">
                     <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     <h3 class="text-xs font-bold text-yellow-700 uppercase tracking-wider">Potential Dead Stock</h3>
                   </div>
                </div>
                <div class="flex-1 overflow-auto p-4">
                   <p class="text-[10px] text-gray-400 mb-2">High stock, low view count.</p>
                   <ul class="space-y-2">
                      <li class="flex justify-between text-xs">
                         <span class="font-bold truncate w-32">Winter Coat XL</span>
                         <span class="text-gray-600">50 in stock</span>
                      </li>
                      <li class="flex justify-between text-xs">
                         <span class="font-bold truncate w-32">Red Scarf</span>
                         <span class="text-gray-600">42 in stock</span>
                      </li>
                   </ul>
                </div>
            </div>
         </div>
      </div>
      
      <!-- Bottom Row: Recent Orders & Top Selling -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Recent Orders -->
        <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 class="text-lg font-bold text-black uppercase tracking-wider text-xs">Recent Orders</h3>
               <a routerLink="/admin/orders" class="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest">View All</a>
            </div>
            <div class="flex-1 overflow-auto">
               @if(recentOrders().length === 0) {
                  <div class="p-8 text-center text-gray-400 text-sm">No recent orders found.</div>
               } @else {
                  <table class="min-w-full divide-y divide-gray-100">
                     <tbody class="divide-y divide-gray-100">
                        @for(order of recentOrders(); track order.id) {
                           <tr class="hover:bg-gray-50 transition-colors">
                              <td class="px-6 py-4">
                                 <div class="text-sm font-bold text-black">{{ order.customerName }}</div>
                                 <div class="text-xs text-gray-500">{{ order.id }}</div>
                              </td>
                              <td class="px-6 py-4 text-right">
                                 <div class="text-sm font-bold text-black">{{ order.total | price }}</div>
                                 <div class="text-xs text-gray-500">{{ order.date | date:'shortDate' }}</div>
                              </td>
                           </tr>
                        }
                     </tbody>
                  </table>
               }
            </div>
        </div>

        <!-- Top Selling Products -->
        <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 class="text-lg font-bold text-black uppercase tracking-wider text-xs">Top Selling Products</h3>
            </div>
            <div class="flex-1 overflow-auto">
               @if(topSellingProducts().length === 0) {
                 <div class="p-8 text-center text-gray-400 text-sm">No sales data recorded yet.</div>
               } @else {
                 <table class="min-w-full divide-y divide-gray-100">
                    <tbody class="divide-y divide-gray-100">
                       @for(item of topSellingProducts(); track item.product.id) {
                          <tr class="hover:bg-gray-50 transition-colors">
                             <td class="px-6 py-4 flex items-center gap-3">
                                <img [src]="item.product.image" class="w-10 h-10 object-cover rounded" alt="">
                                <div class="text-sm font-bold text-black truncate max-w-[200px]">{{ item.product.name }}</div>
                             </td>
                             <td class="px-6 py-4 text-right">
                                <div class="text-sm font-bold text-green-600">{{ item.sold }} Sold</div>
                             </td>
                          </tr>
                       }
                    </tbody>
                 </table>
               }
            </div>
        </div>

      </div>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  orderService = inject(OrderService);
  userService = inject(UserService);
  productService = inject(ProductService);
  
  chartContainer = viewChild<ElementRef>('chart');
  
  totalRevenue = computed(() => {
    return this.orderService.getOrders()().reduce((sum, order) => sum + order.total, 0);
  });
  
  // Enterprise Profit Calculation
  estimatedMargin = computed(() => {
     // Mock calculation: 40% margin on revenue for demo purposes if cost data missing
     // Real implementation would sum (Item Price - Item Cost)
     return this.totalRevenue() * 0.4;
  });
  
  totalOrders = computed(() => {
    return this.orderService.getOrders()().length;
  });
  
  totalUsers = computed(() => {
    return this.userService.getUsers()().length;
  });
  
  avgOrderValue = computed(() => {
    const orders = this.totalOrders();
    return orders > 0 ? this.totalRevenue() / orders : 0;
  });

  recentOrders = computed(() => {
     return this.orderService.getOrders()().slice(0, 5);
  });

  lowStockProducts = computed(() => {
    return this.productService.getAllProducts()().filter(p => p.stock < 10); 
  });

  topSellingProducts = computed(() => {
     const orders = this.orderService.getOrders()();
     const salesMap = new Map<number, number>(); 

     orders.forEach(o => {
       o.items.forEach(item => {
         const current = salesMap.get(item.product.id) || 0;
         salesMap.set(item.product.id, current + item.quantity);
       });
     });

     const sortedSales = Array.from(salesMap.entries())
       .sort((a, b) => b[1] - a[1])
       .slice(0, 5);
     
     return sortedSales.map(([id, qty]) => {
       const product = this.productService.getProductById(id);
       return product ? { product, sold: qty } : null;
     }).filter(item => item !== null);
  });

  constructor() {
    effect(() => {
      if (this.totalOrders() > 0) {
        setTimeout(() => this.createChart(), 0);
      }
    });
  }

  ngOnInit() {
    setTimeout(() => this.createChart(), 0);
  }

  getChartData() {
    const orders = this.orderService.getOrders()();
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return last7Days.map(date => {
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' }); 
      const dateStr = date.toDateString(); 
      
      const dailyTotal = orders
        .filter(o => new Date(o.date).toDateString() === dateStr)
        .reduce((sum, o) => sum + o.total, 0);

      return { day: dayStr, value: dailyTotal };
    });
  }

  createChart() {
    const element = this.chartContainer()?.nativeElement;
    if (!element) return;

    select(element).selectAll('*').remove();

    const data = this.getChartData();
    const maxValue = max(data, d => d.value) || 100;

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    const svg = select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = scaleBand().range([0, width]).padding(0.2);
    const y = scaleLinear().range([height, 0]);

    x.domain(data.map(d => d.day));
    y.domain([0, maxValue * 1.1]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(axisBottom(x).tickSize(0))
      .selectAll('text')
      .attr('dy', '15')
      .style('font-family', 'DM Sans, sans-serif')
      .style('color', '#6b7280');
    
    svg.select('.domain').remove();

    svg.append('g')
      .call(axisLeft(y).ticks(5).tickSize(-width))
      .select('.domain').remove();
    
    svg.selectAll('.tick line').attr('stroke', '#e5e7eb');
    svg.selectAll('.tick text').style('font-family', 'DM Sans, sans-serif').style('color', '#6b7280');

    svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.day)!)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))
      .attr('fill', '#0f172a');
  }
}
