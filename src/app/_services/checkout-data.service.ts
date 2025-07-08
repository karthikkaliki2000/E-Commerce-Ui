import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CheckoutDataService {
  private checkoutItems: { productId: number, quantity: number }[] = [];
  private orderConfirmationDetails: any = null;

  setCheckoutItems(items: { productId: number, quantity: number }[]) {
    this.checkoutItems = items;
  }

  getCheckoutItems(): { productId: number, quantity: number }[] {
    return this.checkoutItems;
  }

  clearCheckoutItems() {
    this.checkoutItems = [];
  }

  setOrderConfirmationDetails(details: any) {
    this.orderConfirmationDetails = details;
  }

  getOrderConfirmationDetails(): any {
    return this.orderConfirmationDetails;
  }

  clearOrderConfirmationDetails() {
    this.orderConfirmationDetails = null;
  }
} 