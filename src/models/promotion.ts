
export type PromotionType = 'coupon' | 'popup';
export type DiscountType = 'percentage' | 'fixed';

export interface Promotion {
  id: number;
  type: PromotionType;
  name: string;
  active: boolean;
  
  // Coupon specific
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  
  // Popup/Flyer specific
  image?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}
