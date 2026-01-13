
export type PaymentType = 'Bank Transfer' | 'Mobile Wallet' | 'Crypto' | 'Credit Card' | 'COD' | 'Other';

export interface PaymentGateway {
  id: number;
  name: string; // e.g., "Easypaisa", "Jazzcash", "Mezan Bank"
  type: PaymentType;
  accountTitle?: string;
  accountNumber?: string; // Wallet Number, IBAN, or Crypto Address
  instructions?: string; // Specific instructions for the user
  isEnabled: boolean;
}
