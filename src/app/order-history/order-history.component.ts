import { Component, OnInit } from '@angular/core';
import { OrderService, OrderResponse } from '../_services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: OrderResponse[] = [];
  loading = true;
  error: string | null = null;

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.orderService.getOrderHistory().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load order history.';
        this.loading = false;
      }
    });
  }

  viewOrder(orderId: number) {
    this.router.navigate(['/order-details', orderId]);
  }
} 