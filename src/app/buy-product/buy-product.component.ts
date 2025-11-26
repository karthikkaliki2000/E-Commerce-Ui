import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { OrderDetails } from '../_model/order-details.model';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../_model/product.model';
import { ProductService } from '../_services/product.service';
import { Router } from '@angular/router';
import { CheckoutDataService } from '../_services/checkout-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddressService } from '../_services/address.service';
// import * as Razorpay from 'razorpay'; // Remove this line

declare var Razorpay: any; // Add this line for Razorpay global

export interface OrderProductQuantity {
  productId: number;
  quantity: number;
}

// Add type for Razorpay handler response
interface RazorpayPaymentResponse {
  razorpay_payment_id?: string;
  [key: string]: any;
}

// Add type for backend transaction response (customize as needed)
interface TransactionResponse {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  [key: string]: any;
}

@Component({
  selector: 'app-buy-product',
  templateUrl: './buy-product.component.html',
  styleUrls: ['./buy-product.component.css']
})
export class BuyProductComponent implements OnInit{

  defaultAddress: string = '';
  isAddressEditable: boolean = false;

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
      if (checkoutItems && checkoutItems.length > 0) {
        // Filter productDetails to only include selected products
        this.productDetails = this.productDetails.filter(product =>
          checkoutItems.some(item => item.productId === product.productId)
        );
        // Set quantities for orderDetails
        this.orderDetails.orderProductQuantities = checkoutItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }));
      } else {
        // Fallback: show all products (should not happen in normal flow)
        this.productDetails.forEach(product => {
          this.orderDetails.orderProductQuantities.push({
            productId: product.productId!,
            quantity: 1
          });
        });
      }

    }
    console.log('orderDetails:', this.orderDetails);



    //address default fetching
    this.addressService.getDefault().subscribe({
  next: (addr) => {
    this.defaultAddress = `${addr.label}: ${addr.street}, ${addr.city}, ${addr.state} - ${addr.postalCode}, ${addr.country}`;
    if (!this.orderDetails.fullAddress) {
      this.orderDetails.fullAddress = this.defaultAddress;
    }
  },
  error: (err) => {
    console.error('Failed to fetch default address', err);
  }
});

  }

  productDetails: Product[] = [];
  isSingleProductCheckout: boolean = false;
  isProcessing: boolean = false; // To disable order button during processing

  constructor(public addressService:AddressService,private activatedRoute: ActivatedRoute, private productService: ProductService, private router: Router, private checkoutDataService: CheckoutDataService, private snackBar: MatSnackBar) { }
  orderDetails: OrderDetails = {
    fullName: '',
    fullAddress: '',
    contactNumber: '',
    alternativeContactNumber: '',
    email: '',
    transactionId: '',
    orderProductQuantities: []
  };

  // Add validation for orderDetails before payment
  isOrderDetailsValid(): boolean {
    const od = this.orderDetails;
    return !!(
      od.fullName &&
      od.fullAddress &&
      od.contactNumber &&
      od.email &&
      od.orderProductQuantities.length > 0 &&
      !this.hasInvalidQuantities()
    );
  }

  placeOrder(form: NgForm): void {
    if (!this.isOrderDetailsValid()) {
      this.snackBar.open('Please fill all required fields correctly.', 'Close', { duration: 2000 });
      return;
    }
    if (form.valid) {
      this.isProcessing = true;
      // Pass true for cart checkout, false for single product checkout
      this.productService.placeOrder(this.orderDetails, !this.isSingleProductCheckout).subscribe({
        next: (response: any) => {
          this.isProcessing = false;
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
          this.isProcessing = false;
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
      transactionId: '',
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


    createTransactionAndPlaceOrder(orderForm: NgForm) {
      if (!this.isOrderDetailsValid()) {
        this.snackBar.open('Please fill all required fields correctly.', 'Close', { duration: 2000 });
        return;
      }
      this.isProcessing = true;
      this.productService.createTransaction(this.getTotalAmountForAllProducts()).subscribe(
        (response: any) => {
          console.log(response);
          this.openTransactionModal(response, orderForm);
        },
        (error: any) => {
          this.isProcessing = false;
          console.log(error);
          this.snackBar.open('Transaction creation failed: ' + (error?.error?.message || error.message || 'Unknown error'), 'Close', { duration: 3000 });
        }
      );
    }


    openTransactionModal(response: TransactionResponse, orderForm: NgForm) {
      const options = {
        key: response.key,
        amount: response.amount,
        currency: response.currency,
        order_id: response.orderId,
        handler: (rzpResponse: RazorpayPaymentResponse) => {
          if (rzpResponse && rzpResponse.razorpay_payment_id) {
            this.processResponse(rzpResponse, orderForm);
          } else {
            this.isProcessing = false;
            this.snackBar.open('Payment failed or cancelled.', 'Close', { duration: 3000 });
          }
        },
        prefill: {
          name: this.orderDetails.fullName,
          email: this.orderDetails.email,
          contact: this.orderDetails.contactNumber
        },
        notes: {
          address: this.orderDetails.fullAddress
        },
        theme: {
          color: '#F37254'
        }
      };
      try {
        const razorPayObject = new Razorpay(options);
        razorPayObject.open();
      } catch (e) {
        this.isProcessing = false;
        this.snackBar.open('Failed to open payment modal.', 'Close', { duration: 3000 });
        console.error('Razorpay error:', e);
      }
    }

    processResponse(resp: RazorpayPaymentResponse, orderForm: NgForm) {
      console.log(resp);
      this.orderDetails.transactionId = resp.razorpay_payment_id || '';
      this.placeOrder(orderForm);
    }



  }

