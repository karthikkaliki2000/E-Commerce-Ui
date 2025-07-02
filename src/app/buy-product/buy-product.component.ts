import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { OrderDetails } from '../_model/order-details.model';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../_model/product.model';
import { ProductService } from '../_services/product.service';
import { Router } from '@angular/router';

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
  this.productDetails= this.activatedRoute.snapshot.data['productDetails'];
  this.productDetails.forEach(product => {
    this.orderDetails.orderProductQuantities.push({
      productId: product.productId!,
      quantity: 1
    });
  });
  console.log(this.orderDetails);
  console.log(this.productDetails);
  }

  productDetails: Product[] = [];

  constructor(private activatedRoute: ActivatedRoute, private productService: ProductService, private router: Router) { }
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
      // TODO: Implement order submission logic
      console.log('Order placed:', this.orderDetails);
      this.productService.placeOrder(this.orderDetails).subscribe({
        next: (response: any) => {
          console.log("Order placed successfully---->", response);
          this.router.navigate(['/orderConfirmation']);
        },
        error: (err) => {
          console.error("Order placement failed", err);
          alert("Order placement failed: " + (err?.error?.message || err.message || 'Unknown error'));
        }
      });
    } else {
      console.log('Form is invalid');
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
    
    
  }

