import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService, OrderResponse } from '../_services/order.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: OrderResponse | null = null;
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.orderService.getOrderById(+orderId).subscribe({
        next: (data) => {
          this.order = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load order details.';
          this.loading = false;
        }
      });
    } else {
      this.error = 'No order ID provided.';
      this.loading = false;
    }
  }
} 