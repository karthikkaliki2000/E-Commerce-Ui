import { OrderProductQuantity } from './order-product-quantity.model';

export interface OrderDetails {
  fullName: string;
  fullAddress: string;
  contactNumber: string;
  alternativeContactNumber: string;
  email: string;
  transactionId:string;
  orderProductQuantities: OrderProductQuantity[];
} 