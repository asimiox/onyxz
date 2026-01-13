
import { Injectable, signal } from '@angular/core';
import { Order, OrderStatus } from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders = signal<Order[]>([]);

  getOrders() {
    return this.orders;
  }

  createOrder(order: Order) {
    // Enterprise: Initialize timeline
    order.timeline = [
      { status: 'Pending', date: new Date() }
    ];
    this.orders.update(prev => [order, ...prev]);
  }

  updateStatus(id: string, status: OrderStatus) {
    this.orders.update(prev => 
      prev.map(o => {
        if (o.id === id) {
           const timeline = o.timeline || [];
           // Add to timeline if status changes
           if (o.status !== status) {
              timeline.push({ status, date: new Date() });
           }
           return { ...o, status, timeline };
        }
        return o;
      })
    );
  }

  updateAdminNotes(id: string, notes: string) {
    this.orders.update(prev => 
      prev.map(o => o.id === id ? { ...o, adminNotes: notes } : o)
    );
  }

  getOrdersByUserId(userId: number) {
    return this.orders().filter(o => o.userId === userId); 
  }

  // Enterprise Trust: Verified Purchase Logic
  hasPurchased(userId: number, productId: number): boolean {
    const userOrders = this.getOrdersByUserId(userId);
    return userOrders.some(order => 
      order.status === 'Delivered' && 
      order.items.some(item => item.product.id === productId)
    );
  }
}
