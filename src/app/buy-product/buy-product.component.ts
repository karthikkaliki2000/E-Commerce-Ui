import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { OrderDetails } from '../_model/order-details.model';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../_model/product.model';
import { ProductService } from '../_services/product.service';
import { Router } from '@angular/router';
import { CheckoutDataService } from '../_services/checkout-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface OrderProductQuantity {
  productId: number;
  quantity: number;
}

@Component({
  selector: 'app-buy-product',
  templateUrl: './buy-product.component.html',
  styleUrls: ['./buy-product.component.css']
})
export class BuyProductComponent implements OnInit{
  ngOnInit(): void {
    this.productDetails = this.activatedRoute.snapshot.data['productDetails'];
    // Support both query and matrix params
    const isSingle = this.activatedRoute.snapshot.queryParams['isSingleProductCheckout'] || this.activatedRoute.snapshot.params['isSingleProductCheckout'];
    const productId = this.activatedRoute.snapshot.queryParams['productId'] || this.activatedRoute.snapshot.params['productId'];
    this.isSingleProductCheckout = isSingle === 'true' || isSingle === true;
    console.log('productDetails:', this.productDetails);
    console.log('isSingleProductCheckout:', this.isSingleProductCheckout);
    console.log('productId:', productId);
    if (this.isSingleProductCheckout && productId) {
      // If productDetails is empty, fetch the product by productId
      if (!this.productDetails || this.productDetails.length === 0) {
        this.productService.getProductById(+productId).subscribe(product => {
          this.productDetails = [product];
          this.orderDetails.orderProductQuantities = [{ productId: +productId, quantity: 1 }];
          console.log('Fetched product for Buy Now:', product);
        });
      } else {
        this.orderDetails.orderProductQuantities = [{ productId: +productId, quantity: 1 }];
      }
    } else {
      // Existing logic for cart/partial checkout
      const checkoutItems = this.checkoutDataService.getCheckoutItems();
      this.productDetails.forEach(product => {
        const found = checkoutItems.find(item => item.productId === product.productId);
        this.orderDetails.orderProductQuantities.push({
          productId: product.productId!,
          quantity: found ? found.quantity : 1
        });
      });
    }
    console.log('orderDetails:', this.orderDetails);
  }

  productDetails: Product[] = [];
  isSingleProductCheckout: boolean = false;

  constructor(private activatedRoute: ActivatedRoute, private productService: ProductService, private router: Router, private checkoutDataService: CheckoutDataService, private snackBar: MatSnackBar) { }
  orderDetails: OrderDetails = {
    fullName: '',
    fullAddress: '',
    contactNumber: '',
    alternativeContactNumber: '',
    email: '',
    orderProductQuantities: []
  };

  placeOrder(form: NgForm): void {
    if (form.valid) {
      // Pass true for cart checkout, false for single product checkout
      this.productService.placeOrder(this.orderDetails, !this.isSingleProductCheckout).subscribe({
        next: (response: any) => {
          console.log('Order placement response:', response); // Debug log
          this.snackBar.open('Order placed successfully!', 'Close', { duration: 2000 });
          // Set confirmation details in the service
          this.checkoutDataService.setOrderConfirmationDetails({
            orderDetails: this.orderDetails,
            productDetails: this.productDetails
          });
          // Navigate with orderId in query params if available
          const orderId = response?.orderId || response?.id || response?.data?.orderId;
          if (orderId) {
            this.router.navigate(['/orderConfirmation'], { queryParams: { orderId } });
          } else {
            this.router.navigate(['/orderConfirmation']);
          }
        },
        error: (err) => {
          this.snackBar.open('Order placement failed: ' + (err?.error?.message || err.message || 'Unknown error'), 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Please fill all required fields correctly.', 'Close', { duration: 2000 });
    }
  }

  onReset(): void {
    this.orderDetails = {
      fullName: '',
      fullAddress: '',
      contactNumber: '',
      alternativeContactNumber: '',
      email: '',
      orderProductQuantities: []
    };
  }

  getQuantityForProduct(productId: number): number {
    const quantity = this.orderDetails.orderProductQuantities.find(
      (item) => item.productId === productId
    )?.quantity;
    return quantity || 1;
  }

  getTotalAmountForProduct(productId: number, productDiscountedPrice: number): number {
    const quantity = this.getQuantityForProduct(productId);
    return quantity * productDiscountedPrice;
  }

    onQuantityChange(productId: number, qValue: any): void {
      const item = this.orderDetails.orderProductQuantities.find(orderProduct => orderProduct.productId === productId);
      if (item) {
        item.quantity = Number(qValue);
      }
    }   


    getTotalAmountForAllProducts(): number {
      let totalAmount = 0;
      this.orderDetails.orderProductQuantities.forEach(orderProduct => {
       const price=this.productDetails.find(product => product.productId === orderProduct.productId)?.productDiscountedPrice || 0;
       totalAmount += orderProduct.quantity * price;
      }); 
      return totalAmount; 
    }
    
    hasInvalidQuantities(): boolean {
      return this.orderDetails.orderProductQuantities.some(q => !q.quantity || q.quantity <= 0);
    }
  }

