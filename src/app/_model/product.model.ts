import { FileHandle } from './file-handle.model';

export interface Product {
  productId?: number; // optional since it's auto-generated on creation
  productName: string;
  productDescription: string;
  productDiscountedPrice: number;
  productActualPrice: number;
  createdAt?: string; // ISO string format; usually set by the backend
  updatedAt?: string; // same here
  productImages?: FileHandle[];
}
