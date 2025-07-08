import { Component } from '@angular/core';
import { ProductService } from '../_services/product.service';
import { Cart } from '../_model/cart.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../_model/product.model';
import { CheckoutDataService } from '../_services/checkout-data.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {

  constructor(private productService: ProductService, private router: Router, private snackBar: MatSnackBar, private checkoutDataService: CheckoutDataService) {}

  carts: Cart[] = [];
  loading = false;
  error: string | null = null;

  displayedColumns: string[] = [
    'Name',
    'Description',
    'quantity',
    'Price',
    'totalPrice',
    'Remove',
    'Checkout',
  ];

  get cartTotal(): number {
    return this.carts.reduce((sum, item) => sum + ((item.product as Product).productDiscountedPrice ?? 0) * item.quantity, 0);
  }

  removeItem(cartId: number) {
    this.loading = true;
    this.productService.removeCartItem(cartId).subscribe({
      next: () => {
        this.getCartDetails();
        this.snackBar.open('Item removed from cart', 'Close', { duration: 2000 });
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to remove item', 'Close', { duration: 2000 });
        this.loading = false;
      }
    });
  }

  updateQuantity(cartId: number, quantity: number) {
    this.loading = true;
    this.productService.updateCartItemQuantity(cartId, +quantity).subscribe({
      next: () => {
        this.getCartDetails();
        this.snackBar.open('Quantity updated', 'Close', { duration: 2000 });
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to update quantity', 'Close', { duration: 2000 });
        this.loading = false;
      }
    });
  }

  clearCart() {
    if (this.carts.length === 0) {
      const snackBarRef = this.snackBar.open('Cart is already empty', 'Close', { duration: 2000 });
      setTimeout(() => snackBarRef.dismiss(), 2000);
      return;
    }
    this.loading = true;
    this.productService.clearCart().subscribe({
      next: () => {
        this.getCartDetails();
        const snackBarRef = this.snackBar.open('Cart cleared', 'Close', { duration: 2000 });
        setTimeout(() => snackBarRef.dismiss(), 2000);
        this.loading = false;
      },
      error: () => {
        const snackBarRef = this.snackBar.open('Failed to clear cart', 'Close', { duration: 2000 });
        setTimeout(() => snackBarRef.dismiss(), 2000);
        this.loading = false;
      }
    });
  }

  continueShopping() {
    this.router.navigate(['/']); // Navigates to HomeComponent
  }

  getCartDetails() {
    this.loading = true;
    this.productService.getCartDetails().subscribe((data: any) => {
      this.carts = data;
      this.loading = false;
      this.error = null;
    },
    (error: any) => {
      this.error = 'Failed to load cart details';
      this.loading = false;
    }
    );
  }

  checkoutSingleProduct(productId: number) {
    if (this.carts.length === 0) {
      const snackBarRef = this.snackBar.open('No products in cart to checkout', 'Close', { duration: 2000 });
      setTimeout(() => snackBarRef.dismiss(), 2000);
      return;
    }
   
    this.productService.getProductDetailsForCheckout(true, productId).subscribe(products => {
      console.log(products);
      this.router.navigate(['/buyProduct'], { queryParams: { isSingleProductCheckout: true, productId } });
      
      
    });
    
  }

  checkoutAllProducts() {
    if (this.carts.length === 0) {
      const snackBarRef = this.snackBar.open('No products in cart to checkout', 'Close', { duration: 2000 });
      setTimeout(() => snackBarRef.dismiss(), 2000);
      return;
    }
    // Set checkout items (productId and quantity) in the shared service
    const checkoutItems = this.carts.map(cart => ({
      productId: cart.product.productId!,
      quantity: cart.quantity
    }));
    this.checkoutDataService.setCheckoutItems(checkoutItems);
    this.productService.getProductDetailsForCheckout(false).subscribe(products => {
      this.router.navigate(['/buyProduct'], { queryParams: { isSingleProductCheckout: false, numberOfProducts: products.length } });
    });
  }

  ngOnInit(): void {
    this.getCartDetails();
  }
}
