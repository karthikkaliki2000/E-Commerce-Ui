import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductSummary {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  productImageUrl?: string; // for frontend image binding
}

export interface OrderResponse {
  orderId: number;
  fullName: string;
  fullAddress: string;
  contactNumber: string;
  alternativeContactNumber: string;
  email: string;
  orderStatus: string;
  totalPrice: number;
  orderDate: string;
  products: ProductSummary[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private API_URL = 'http://localhost:9090/order';

  constructor(private http: HttpClient) {}

  // Use /myOrders for user order history
  getMyOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.API_URL}/myOrders`);
  }

  // Use /getOrderDetails/{orderId} for order details
  getOrderDetailsById(orderId: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.API_URL}/getOrderDetails/${orderId}`);
  }

  cancelOrder(orderId: number) {
    return this.http.post(`${this.API_URL}/cancelOrder/${orderId}`, null);
  }

  // Get all orders for admin
  getAllOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.API_URL}/allOrders`);
  }

  // Mark order as delivered (admin)
  markOrderAsDelivered(orderId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/markOrderAsDelivered/${orderId}`);
  }

  // Mark order as shipped (admin)
  markOrderAsShipped(orderId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/markOrderAsShipped/${orderId}`);
  }
} 