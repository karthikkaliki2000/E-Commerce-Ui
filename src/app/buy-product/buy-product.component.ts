import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { OrderDetails } from '../_model/order-details.model';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../_model/product.model';
import { ProductService } from '../_services/product.service';

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

  constructor(private activatedRoute: ActivatedRoute, private productService: ProductService) { }
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
      this.productService.placeOrder(this.orderDetails).subscribe((response:any)=>{
        console.log(response);
       
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
}
