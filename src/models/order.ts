
import { CartItem } from './product';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = string;

export interface Order {
  id: string;
  userId: number;
  customerName: string;
  date: Date;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  country: string;
  shippingAddress: string;
  phone: string;
  paymentMethod: PaymentMethod;
  adminNotes?: string; // Enterprise Management
  timeline?: { status: OrderStatus; date: Date }[]; // Enterprise Tracking
}
