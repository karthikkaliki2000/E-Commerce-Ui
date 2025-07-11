import { Component, OnInit, HostListener } from '@angular/core';
import { ProductService } from '../_services/product.service';
import { Cart } from '../_model/cart.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../_model/product.model';
import { CheckoutDataService } from '../_services/checkout-data.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

// Extend Cart type for UI selection
interface CartWithSelection extends Cart {
  selected?: boolean;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  constructor(
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar,
    private checkoutDataService: CheckoutDataService,
    private dialog: MatDialog
  ) {}

  carts: CartWithSelection[] = [];
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

  mobileColumns: string[] = [
    'Name',
    'Description',
    'quantity',
    'Price',
    'Remove',
    'Checkout',
  ];

  isMobile = false;
  expandedDescription: { [cartId: number]: boolean } = {};

  get cartTotal(): number {
    return this.carts.reduce((sum, item) => sum + ((item.product as Product).productDiscountedPrice ?? 0) * item.quantity, 0);
  }

  get selectedCount(): number {
    return this.carts.filter(i => i.selected).length;
  }

  selectAll() {
    this.carts.forEach(item => item.selected = true);
  }

  deselectAll() {
    this.carts.forEach(item => item.selected = false);
  }

  get selectedTotal(): number {
    return this.carts
      .filter(item => item.selected)
      .reduce((sum, item) => sum + ((item.product as Product).productDiscountedPrice ?? 0) * item.quantity, 0);
  }

  get allSelected(): boolean {
    return this.carts.length > 0 && this.carts.every(item => item.selected);
  }

  get someSelected(): boolean {
    return this.carts.some(item => item.selected) && !this.allSelected;
  }

  toggleSelectAll(event: any) {
    const checked = event.checked;
    this.carts.forEach(item => item.selected = checked);
  }

  removeItem(cartId: number) {
    this.loading = true;
    this.productService.removeCartItem(cartId).subscribe({
      next: () => {
        this.getCartDetails();
        this.snackBar.open('Item removed from cart', 'Close', { duration: 2000 });
        // this.loading = false; // moved to getCartDetails
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
        // this.loading = false; // moved to getCartDetails
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
        // this.loading = false; // moved to getCartDetails
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
    this.productService.getCartDetails().subscribe({
      next: (data: any) => {
        // Defensive: if data is null/undefined, use empty array
        this.carts = (data ? data : []).map((item: any) => ({ ...item, selected: false }));
        this.loading = false;
        this.error = null;
      },
      error: (error: any) => {
        this.carts = [];
        this.error = 'Failed to load cart details';
        this.loading = false;
      }
    });
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

  checkoutSelectedProducts() {
    if (this.selectedCount === 0) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Checkout',
        message: `Are you sure you want to checkout ${this.selectedCount} item(s)?`
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const selectedItems = this.carts.filter(item => item.selected);
        if (selectedItems.length === 0) {
          this.snackBar.open('Please select at least one item to checkout.', 'Close', { duration: 2000 });
          return;
        }
        const checkoutItems = selectedItems.map(cart => ({
          productId: cart.product.productId!,
          quantity: cart.quantity
        }));
        this.checkoutDataService.setCheckoutItems(checkoutItems);
        this.productService.getProductDetailsForCheckout(false).subscribe(products => {
          this.router.navigate(['/buyProduct'], { queryParams: { isSingleProductCheckout: false, numberOfProducts: products.length } });
        });
      }
    });
  }

  removeSelected() {
    const selectedItems = this.carts.filter(item => item.selected);
    if (selectedItems.length === 0) {
      this.snackBar.open('No items selected to remove.', 'Close', { duration: 2000 });
      return;
    }
    this.loading = true;
    let completed = 0;
    selectedItems.forEach(item => {
      this.productService.removeCartItem(item.cartId).subscribe({
        next: () => {
          completed++;
          if (completed === selectedItems.length) {
            this.getCartDetails();
            this.snackBar.open('Selected items removed from cart', 'Close', { duration: 2000 });
            this.loading = false;
          }
        },
        error: () => {
          completed++;
          if (completed === selectedItems.length) {
            this.getCartDetails();
            this.snackBar.open('Some items could not be removed', 'Close', { duration: 2000 });
            this.loading = false;
          }
        }
      });
    });
  }

  ngOnInit(): void {
    this.getCartDetails();
    this.checkScreen();
  }

  @HostListener('window:resize')
  checkScreen() {
    this.isMobile = window.innerWidth <= 600;
    this.displayedColumns = this.isMobile ? this.mobileColumns : [
      'Name',
      'Description',
      'quantity',
      'Price',
      'totalPrice',
      'Remove',
      'Checkout',
    ];
  }

  toggleDescription(cartId: number) {
    this.expandedDescription[cartId] = !this.expandedDescription[cartId];
  }
}
