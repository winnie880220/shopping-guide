export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  image: string;
  details: string[];
  specs: { label: string; value: string }[];
  stock: {
    location: string;
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
    placementArea?: string;
  }[];
  tags: string[];
  sizeDisplay: string;
  material: string;
  aiReason?: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type ViewState = 
  | { type: 'HOME' }
  | { type: 'SEARCH'; query?: string; returnTo?: ViewState }
  | { type: 'CATEGORY_LIST' }
  | { type: 'CATEGORY'; categoryId: string }
  | {
      type: 'PRODUCT_LIST';
      categoryId: string;
      filters?: {
        minPrice?: number;
        maxPrice?: number;
        size?: string;
        keywords?: string[];
      };
      aiSummary?: string;
      autoFilled?: string[];
      searchQuery?: string;
    }
  | { type: 'PRODUCT_DETAIL'; productId: string }
  | { type: 'CART'; returnTo?: ViewState }
  | { type: 'CHECKOUT'; returnTo?: ViewState };
