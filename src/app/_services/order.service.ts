import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductSummary {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
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

  getOrderHistory(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.API_URL}/history`);
  }

  getOrderById(orderId: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.API_URL}/${orderId}`);
  }
} 