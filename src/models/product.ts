
export type Category = string;

export interface CategoryConfig {
  name: string;
  image: string;
}

export interface Review {
  id: number;
  userName: string;
  date: Date;
  rating: number;
  comment: string;
  verified: boolean; // Enterprise Trust
  photos?: string[]; // Enterprise Content
  subRatings?: {
    quality: number;
    fit: number; // 1 = small, 3 = true to size, 5 = large
    value: number;
  };
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  costPrice?: number; // Enterprise Intelligence (Profit Margin)
  category: Category;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  reviewsList?: Review[]; 
  description: string;
  sizes: string[];
  colors?: string[]; 
  isNew?: boolean;
  isSale?: boolean;
  badge?: string; 
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
}
