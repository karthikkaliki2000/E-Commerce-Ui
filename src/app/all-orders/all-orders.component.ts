import { Component, OnInit, HostListener } from '@angular/core';
import { OrderService, OrderResponse } from '../_services/order.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css']
})
export class AllOrdersComponent implements OnInit {
  orders: OrderResponse[] = [];
  loading = false;
  error = '';
  displayedColumns: string[] = ['orderId', 'productNames', 'customerName', 'email', 'address', 'orderStatus', 'totalPrice', 'orderDate', 'actions'];
  mobileColumns: string[] = ['orderId', 'productNames', 'customer', 'address', 'orderStatus', 'totalPrice', 'orderDate', 'actions'];
  isMobile = false;
  page: number = 1;
  pageSize: number = 10;

  get pagedOrders(): OrderResponse[] {
    const start = (this.page - 1) * this.pageSize;
    return this.orders.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
  }

  constructor(
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadOrders();
    this.checkScreen();
  }

  @HostListener('window:resize')
  checkScreen() {
    this.isMobile = window.innerWidth <= 600;
    this.displayedColumns = this.isMobile ? this.mobileColumns : ['orderId', 'productNames', 'customerName', 'email', 'address', 'orderStatus', 'totalPrice', 'orderDate', 'actions'];
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';
    
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
      }
    });
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/order-details', orderId]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Order Placed':
        return 'primary';
      case 'Order Shipped':
        return 'accent';
      case 'Order Delivered':
        return 'primary';
      case 'Order Cancelled':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusLabel(status: string): string {
    return status.replace('Order ', '');
  }

  refreshOrders(): void {
    this.loadOrders();
    // Optionally close the menu if open
    const headerEl = document.querySelector('app-header');
    if (headerEl && (headerEl as any).componentInstance) {
      (headerEl as any).componentInstance.showMobileMenu = false;
    }
  }

  isMobileMenuOpen(): boolean {
    // fallback: check if mobile menu is visible in DOM
    return !!document.querySelector('.mobile-nav-menu');
  }

  get totalRevenue(): number {
    return this.orders.reduce((sum, order) => sum + order.totalPrice, 0);
  }

  get placedOrdersCount(): number {
    return this.orders.filter(order => order.orderStatus === 'Order Placed').length;
  }

  get deliveredOrdersCount(): number {
    return this.orders.filter(order => order.orderStatus === 'Order Delivered').length;
  }

  // Add a helper to get product names as a string
  getProductNames(order: OrderResponse): string {
    return order.products?.map(p => p.productName).join(', ') || '';
  }

  // Mark order as delivered
  markAsDelivered(order: OrderResponse): void {
    if (order.orderStatus !== 'Order Shipped') {
      this.snackBar.open('Only orders with status Shipped can be marked as DELIVERED', 'Close', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Mark as Delivered',
        message: `Are you sure you want to mark Order #${order.orderId} as delivered?`
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.markOrderAsDelivered(order.orderId).subscribe({
          next: () => {
            this.snackBar.open('Order marked as delivered successfully', 'Close', { duration: 3000 });
            order.orderStatus = 'Order Delivered';
            // Optionally, refresh the list
            // this.loadOrders();
          },
          error: (error) => {
            // this.snackBar.open('Failed to mark order as delivered', 'Close', { duration: 3000 });
            console.error('Error marking as delivered:', error);
          }
        });
      }
    });
  }

  // Mark order as shipped
  markAsShipped(order: OrderResponse): void {
    if (order.orderStatus !== 'Order Placed') {
      this.snackBar.open('Only orders with status PLACED can be marked as SHIPPED', 'Close', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Mark as Shipped',
        message: `Are you sure you want to mark Order #${order.orderId} as shipped?`
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.markOrderAsShipped(order.orderId).subscribe({
          next: (res) => {
            this.snackBar.open('Order marked as shipped successfully', 'Close', { duration: 3000 });
            order.orderStatus = 'Order Shipped';
            // Optionally, refresh the list
            // this.loadOrders();
          },
          error: (error) => {
            this.snackBar.open('Failed to mark order as shipped', 'Close', { duration: 3000 });
            console.error('Error marking as shipped:', error);
          }
        });
      }
    });
  }
} 