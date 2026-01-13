
import { Injectable, signal } from '@angular/core';
import { PaymentGateway } from '../models/payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private gateways = signal<PaymentGateway[]>([
    {
      id: 1,
      name: 'Cash on Delivery',
      type: 'COD',
      isEnabled: true,
      instructions: 'Pay cash upon delivery at your doorstep.'
    },
    {
      id: 2,
      name: 'Easypaisa',
      type: 'Mobile Wallet',
      accountTitle: 'Asim Nawaz',
      accountNumber: '0312-7655369',
      instructions: 'Send screenshot of payment to +92322-8033682 via WhatsApp to confirm your order.',
      isEnabled: true
    },
    {
      id: 3,
      name: 'Jazzcash',
      type: 'Mobile Wallet',
      accountTitle: 'Mixtas Business',
      accountNumber: '0300-1234567',
      instructions: 'Send payment and keep the Transaction ID (TID) safe.',
      isEnabled: false
    },
    {
      id: 4,
      name: 'USDT (TRC20)',
      type: 'Crypto',
      accountNumber: 'TX8...jLk2',
      instructions: 'Transfer exact amount. Order will be processed after 1 network confirmation.',
      isEnabled: false
    }
  ]);

  getGateways() {
    return this.gateways;
  }

  getActiveGateways() {
    return this.gateways().filter(g => g.isEnabled);
  }

  addGateway(gateway: PaymentGateway) {
    this.gateways.update(g => [...g, gateway]);
  }

  updateGateway(gateway: PaymentGateway) {
    this.gateways.update(g => g.map(x => x.id === gateway.id ? gateway : x));
  }

  deleteGateway(id: number) {
    this.gateways.update(g => g.filter(x => x.id !== id));
  }

  toggleStatus(id: number) {
    this.gateways.update(g => g.map(x => x.id === id ? { ...x, isEnabled: !x.isEnabled } : x));
  }
}
