import { Product } from './product.model';

export interface Cart {
  cartId: number;
  product: Product;
  user: {
    userId: number;
    username: string;
    // Add other user fields as needed
  };
  quantity: number;
  createdAt: string;
  updatedAt: string;
} 