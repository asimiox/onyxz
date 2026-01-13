
import { Injectable, signal, computed } from '@angular/core';
import { Product, Category, Review, CategoryConfig } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products = signal<Product[]>(this.generateProducts());
  private recentlyViewedIds = signal<number[]>([]);
  
  private categoryConfigs = signal<CategoryConfig[]>([
    { name: 'Women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Men', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80' },
    { name: 'Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80' },
    { name: 'Bags', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&w=600&q=80' }
  ]);

  categories = computed(() => this.categoryConfigs().map(c => c.name));

  getAllProducts() {
    return this.products;
  }

  getProductById(id: number) {
    return this.products().find(p => p.id === id);
  }

  addToRecentlyViewed(id: number) {
    this.recentlyViewedIds.update(ids => {
      const filtered = ids.filter(x => x !== id);
      return [id, ...filtered].slice(0, 8); 
    });
  }

  getRecentlyViewedProducts() {
    return computed(() => {
      const ids = this.recentlyViewedIds();
      const all = this.products();
      return ids.map(id => all.find(p => p.id === id)).filter(p => !!p) as Product[];
    });
  }

  addProduct(product: Product) {
    this.products.update(p => [product, ...p]);
  }

  updateProduct(product: Product) {
    this.products.update(prev => 
      prev.map(p => p.id === product.id ? product : p)
    );
  }

  updateProductStock(id: number, newStock: number) {
    this.products.update(prev => 
      prev.map(p => p.id === id ? { ...p, stock: newStock } : p)
    );
  }

  deleteProduct(id: number) {
    this.products.update(prev => prev.filter(p => p.id !== id));
  }

  getCategoryConfigs() {
    return this.categoryConfigs;
  }

  addCategory(name: string, image: string) {
    if (!this.categoryConfigs().some(c => c.name === name)) {
      this.categoryConfigs.update(c => [...c, { name, image }]);
    }
  }

  updateCategory(oldName: string, newName: string, newImage?: string) {
    this.categoryConfigs.update(c => c.map(cat => {
      if (cat.name === oldName) {
        return { name: newName, image: newImage || cat.image };
      }
      return cat;
    }));
    
    if (oldName !== newName) {
      this.products.update(p => p.map(prod => 
        prod.category === oldName ? { ...prod, category: newName } : prod
      ));
    }
  }

  deleteCategory(name: string) {
    this.categoryConfigs.update(c => c.filter(cat => cat.name !== name));
    this.products.update(p => p.filter(prod => prod.category !== name));
  }

  addReview(productId: number, review: Review) {
    this.products.update(prev => 
      prev.map(p => {
        if (p.id === productId) {
          const updatedReviews = [review, ...(p.reviewsList || [])];
          const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
          const newRating = parseFloat((totalRating / updatedReviews.length).toFixed(1));
          
          return {
            ...p,
            reviewsList: updatedReviews,
            reviews: updatedReviews.length,
            rating: newRating
          };
        }
        return p;
      })
    );
  }

  private generateProducts(): Product[] {
    const categories: Category[] = ['Women', 'Men', 'Shoes', 'Bags', 'Accessories'];
    
    const productNames: Record<Category, string[]> = {
      'Women': [
        'Silk Chiffon Maxi Dress', 'Oversized Wool Blend Coat', 'High-Waist Pleated Trousers', 
        'Ribbed Knit Turtleneck', 'Floral Satin Midi Skirt', 'Double-Breasted Blazer',
        'Bohemian Wrap Dress', 'Cashmere Crewneck Sweater', 'Structured Denim Jacket', 'Linen Wide-Leg Pants'
      ],
      'Men': [
        'Slim-Fit Oxford Shirt', 'Heavyweight Cotton Hoodie', 'Tapered Cargo Pants',
        'Classic Denim Jacket', 'Merino Wool Pullover', 'Tech-Fleece Joggers',
        'Vintage Wash Jeans', 'Structured Overcoat', 'Graphic Print Tee', 'Linen Summer Shirt'
      ],
      'Shoes': [
        'Leather Chelsea Boots', 'Minimalist Low-Top Sneakers', 'Chunky Sole Loafers',
        'Suede Desert Boots', 'Strappy High Heels', 'Running Performance Trainers',
        'Classic Canvas Slip-Ons', 'Leather Oxford Shoes', 'Platform Sandals', 'High-Top Basketball Sneakers'
      ],
      'Bags': [
        'Structured Leather Tote', 'Canvas Weekend Duffle', 'Quilted Crossbody Bag',
        'Minimalist Flap Backpack', 'Woven Straw Beach Bag', 'Leather Messenger Bag',
        'Compact Chain Wallet', 'Nylon Travel Backpack', 'Vintage Saddle Bag', 'Clutch Evening Bag'
      ],
      'Accessories': [
        'Gold Plated Chain Necklace', 'Tortoise Shell Sunglasses', 'Silk Patterned Scarf',
        'Minimalist Leather Belt', 'Silver Hoop Earrings', 'Classic Fedora Hat',
        'Stainless Steel Watch', 'Beaded Bracelet Set', 'Wool Beanie Hat', 'Signet Ring'
      ]
    };

    const products: Product[] = [];
    let idCounter = 1000;

    const imageIds: Record<Category, string[]> = {
      'Women': ['1515886657613-9f3515b0c78f', '1529139574466-a302c27e3844', '1503342217505-b0a15ec3261c', '1550614000-4b9519e02054', '1552874863-12e530854d64', '1554568118-6469b9e5603a'],
      'Men': ['1480455624313-e29b44bbfde1', '1516257984-b1b4d8c92d51', '1487222477894-8943e31ef7b2', '1552374196-1ab2a1c593e8', '1617137968427-85924c809a22', '1504194944401-d23e29570c80'],
      'Shoes': ['1549298916-b41d501d3772', '1560769629-975ec94e6a86', '1595950653106-6c9ebd614d3a', '1542291026-7eec264c27ff', '1515347619252-60a6bf4fffce', '1606107557195-0e29a4b5b4aa'],
      'Bags': ['1584917865442-de89df76afd3', '1591561954557-26941169b49e', '1590874103328-eac38a683ce7', '1548036328-c9fa89d128fa', '1566150905458-1bf1fc113f0d', '1553062407-98eeb64c6a62'],
      'Accessories': ['1576053139778-7e32f2ae3cfd', '1511499767150-a48a237f0083', '1599643478518-17488fbbcd75', '1611591437281-460bfbe1220a', '1551488852-d814c9e892c1', '1509941323715-d156d419f002']
    };

    categories.forEach(category => {
      const catImages = imageIds[category];
      const catNames = productNames[category];

      for (let i = 0; i < 40; i++) {
        idCounter++;
        const imageIndex = i % catImages.length;
        const nameIndex = i % catNames.length;
        
        const imageId = catImages[imageIndex];
        const image = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=600&q=80`;
        
        const price = 45 + (i * 12) % 250;
        
        // NO DUMMY REVIEWS. Real reviews only come from actual user submissions.
        const reviewsList: Review[] = [];
        const avgRating = 0;
        const numReviews = 0;

        // Logic Check: Badges & Stock
        let badge: string | undefined = undefined;
        let isNew = false;
        let isSale = false;
        let originalPrice: number | undefined = undefined;
        let stock = 50; // Default high stock

        if (i < 4) {
           // New Products are always fully stocked
           badge = '✨ NEW';
           isNew = true;
           stock = 100; 
        } else if (i % 7 === 0) {
           badge = '🔥 HOT';
           // Hot items might be selling fast, but shouldn't be 0 if labeled HOT unless specified
           stock = 25; 
        } else if (i % 5 === 0) {
           const discount = [10, 20, 30, 50][i % 4];
           badge = `🔴 ${discount}% OFF`;
           isSale = true;
           originalPrice = Math.floor(price * (1 + discount/100));
           stock = 15; // Sale items might be lower stock
        } else {
           // Regular items
           stock = 40 + (i % 20);
        }

        products.push({
          id: idCounter,
          name: catNames[nameIndex], 
          brand: ['ONYX', 'Urban', 'Noir', 'Essence'][i % 4], // Rebranded dummy brands
          price: price,
          originalPrice: originalPrice,
          costPrice: Math.floor(price * 0.4),
          category: category,
          image: image,
          images: [image],
          rating: avgRating,
          reviews: numReviews,
          reviewsList: reviewsList,
          description: `Experience luxury with the ${catNames[nameIndex]}. Crafted from premium materials designed for longevity and style. Perfect for the modern individual seeking elegance and comfort.`,
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          colors: ['Black', 'White', 'Navy', 'Beige'],
          isNew: isNew,
          isSale: isSale,
          badge: badge,
          stock: stock
        });
      }
    });

    return products;
  }
}
