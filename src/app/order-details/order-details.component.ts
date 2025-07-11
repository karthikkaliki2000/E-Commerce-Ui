import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService, OrderResponse } from '../_services/order.service';
import { ProductService } from '../_services/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ImageProcessingService } from '../_services/image-processing.service';
import { SafeUrl } from '@angular/platform-browser';
import { Product } from '../_model/product.model';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: OrderResponse | null = null;
  loading = true;
  error: string | null = null;

  // Order status steps for timeline (match backend strings)
  orderStatusSteps: string[] = ['Order Placed', 'Order Shipped', 'Order Delivered', 'Order Cancelled'];

  getStatusStepIndex(status: string): number {
    // If cancelled, show last step
    if (status === 'Order Cancelled') return this.orderStatusSteps.length - 1;
    return this.orderStatusSteps.indexOf(status);
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'Order Placed': return 'Order Placed';
      case 'Order Shipped': return 'Order Shipped';
      case 'Order Delivered': return 'Order Delivered';
      case 'Order Cancelled': return 'Order Cancelled';
      default: return status;
    }
  }

  // Mask sensitive info for privacy
  maskAddress(address: string): string {
    if (!address) return '';
    // Show only the first 8 chars, mask the rest
    return address.length > 8 ? address.substring(0, 8) + '****' : '****';
  }

  maskPhone(phone: string): string {
    if (!phone) return '';
    // Show only last 2 digits, mask the rest
    return phone.replace(/.(?=..)/g, '*');
  }

  canCancelOrder(status: string | undefined | null): boolean {
    return typeof status === 'string' && status.trim().toLowerCase() === 'order placed';
  }

  imageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/no-image.png';
  }

  isMobile = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private imageProcessingService: ImageProcessingService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.orderService.getOrderDetailsById(+orderId).subscribe({
        next: (data) => {
          // Handle both array and object responses
          this.order = Array.isArray(data) ? data[0] : data;
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
    this.checkScreen();
  }

  @HostListener('window:resize')
  checkScreen() {
    this.isMobile = window.innerWidth <= 600;
  }

  reorder() {
    if (!this.order || !this.order.products) {
      console.log('Reorder called, but order or products is missing:', this.order);
      return;
    }
    if (this.order.products.length === 0) {
      console.log('Reorder called, but products array is empty:', this.order.products);
      this.snackBar.open('No products to reorder.', 'Close', { duration: 2500 });
      return;
    }
    // Place a new order immediately
    const orderProductQuantities = this.order.products.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    const orderDetails = {
      fullName: this.order.fullName,
      fullAddress: this.order.fullAddress,
      contactNumber: this.order.contactNumber,
      alternativeContactNumber: this.order.alternativeContactNumber,
      email: this.order.email,
      orderProductQuantities
    };
    this.productService.placeOrder(orderDetails, false).subscribe({
      next: (response: any) => {
        this.snackBar.open('Order placed successfully!', 'Close', { duration: 2000 });
        setTimeout(() => {
          this.router.navigate(['/order-history']);
        }, 1200);
      },
      error: (err) => {
        this.snackBar.open('Failed to reorder: ' + (err?.error?.message || err.message || 'Unknown error'), 'Close', { duration: 3000 });
      }
    });
  }

  cancelOrder() {
    if (!this.order || this.order.orderStatus !== 'Order Placed') return;
    const confirmed = confirm('Are you sure you want to cancel this order?');
    if (!confirmed) return;
    this.orderService.cancelOrder(this.order.orderId).subscribe({
      next: () => {
        this.snackBar.open('Order cancelled successfully.', 'Close', { duration: 2500 });
        // Refresh order details
        this.ngOnInit();
      },
      error: (err) => {
        this.snackBar.open('Failed to cancel order.', 'Close', { duration: 2500 });
      }
    });
  }

  // getProductImageUrl(product: any): SafeUrl | string {
  //   const processed = this.imageProcessingService.createImages(product);
  //   return processed.productImages?.[0]?.url || 'assets/no-image.png';
  // }
} 