import { Component, OnInit } from '@angular/core';
import { CheckoutDataService } from '../_services/checkout-data.service';
import { OrderDetails } from '../_model/order-details.model';
import { Product } from '../_model/product.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  orderDetails: OrderDetails | null = null;
  productDetails: Product[] = [];
  orderId: number | null = null;

  constructor(private checkoutDataService: CheckoutDataService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.orderId = +this.route.snapshot.queryParams['orderId'] || null;
    const confirmation = this.checkoutDataService.getOrderConfirmationDetails();
    if (confirmation) {
      this.orderDetails = confirmation.orderDetails;
      this.productDetails = confirmation.productDetails;
    }
  }

  getProductName(productId: number): string {
    const product = this.productDetails.find(p => p.productId === productId);
    return product ? product.productName : 'Product #' + productId;
  }

  getProductPrice(productId: number): number {
    const product = this.productDetails.find(p => p.productId === productId);
    return product ? product.productDiscountedPrice : 0;
  }

  getTotalAmount(): number {
    if (!this.orderDetails) return 0;
    return this.orderDetails.orderProductQuantities.reduce((sum, item) => sum + this.getProductPrice(item.productId) * item.quantity, 0);
  }
}
