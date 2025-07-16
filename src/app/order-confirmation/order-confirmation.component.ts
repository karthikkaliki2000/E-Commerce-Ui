import { Component, OnInit } from '@angular/core';
import { CheckoutDataService } from '../_services/checkout-data.service';
import { OrderDetails } from '../_model/order-details.model';
import { Product } from '../_model/product.model';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../_services/order.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  orderDetails?: OrderDetails;
  productDetails: Product[] = [];
  orderId?: number;
  isMobile = false;

  constructor(private checkoutDataService: CheckoutDataService, private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    this.checkScreen();
    console.log('OrderConfirmationComponent ngOnInit called');
    const param = this.route.snapshot.queryParams['orderId'];
    this.orderId = param ? +param : undefined;
    console.log('orderId from query params:', this.orderId);

    const confirmation = this.checkoutDataService.getOrderConfirmationDetails();
    console.log('confirmation from service:', confirmation);
    if (confirmation) {
      this.orderDetails = confirmation.orderDetails;
      this.productDetails = confirmation.productDetails;
      console.log("Order Details", this.orderDetails, "====== product details->", this.productDetails, "<-kjhkhnl");
    } else if (this.orderId) {
      // Fallback: fetch from backend
      this.orderService.getOrderDetailsById(this.orderId).subscribe(order => {
        this.orderDetails = {
          fullName: order.fullName,
          fullAddress: order.fullAddress,
          contactNumber: order.contactNumber,
          alternativeContactNumber: order.alternativeContactNumber,
          email: order.email,
          transactionId: '', // Add this line to fix the error
          orderProductQuantities: order.products.map(p => ({ productId: p.productId, quantity: p.quantity }))
        };
        this.productDetails = order.products.map(p => ({
          productId: p.productId,
          productName: p.productName,
          productDescription: '', // Not available in summary, leave blank
          productDiscountedPrice: p.unitPrice,
          productActualPrice: p.unitPrice,
          productImages: []
        }));
        console.log("Order Details", this.orderDetails, "====== product details->", this.productDetails, "<-kjhkhnl");
      });
    }
  }

  @HostListener('window:resize')
  checkScreen() {
    this.isMobile = window.innerWidth <= 600;
  }

  getProductName(productId: number): string {
    return this.productDetails.find(p => p.productId === productId)?.productName ?? `Product #${productId}`;
  }

  getProductPrice(productId: number): number {
    return this.productDetails.find(p => p.productId === productId)?.productDiscountedPrice ?? 0;
  }

  getTotalAmount(): number {
    return this.orderDetails?.orderProductQuantities.reduce(
      (sum, item) => sum + this.getProductPrice(item.productId) * item.quantity,
      0
    ) ?? 0;
  }
}
