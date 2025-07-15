import { Component, OnInit } from '@angular/core';
import { OrderService, OrderResponse } from '../_services/order.service';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: OrderResponse[] = [];
  loading = true;
  error: string | null = null;

  // Filter state
  filterOrderId: string = '';
  filterStatus: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';

  // Sorting state
  sortField: string = 'orderDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination state
  page: number = 1;
  pageSize: number = 5;

  get filteredOrders(): OrderResponse[] {
    return this.orders.filter(order => {
      // Filter by Order ID
      if (this.filterOrderId && !order.orderId.toString().includes(this.filterOrderId)) {
        return false;
      }
      // Filter by Status
      if (this.filterStatus && order.orderStatus !== this.filterStatus) {
        return false;
      }
      // Filter by Date Range
      const orderDate = new Date(order.orderDate);
      if (this.filterStartDate && orderDate < new Date(this.filterStartDate)) {
        return false;
      }
      if (this.filterEndDate && orderDate > new Date(this.filterEndDate)) {
        return false;
      }
      return true;
    });
  }

  get sortedAndPagedOrders(): OrderResponse[] {
    // Apply filters first
    let filtered = this.filteredOrders.slice();
    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (this.sortField) {
        case 'orderDate':
          aValue = new Date(a.orderDate).getTime();
          bValue = new Date(b.orderDate).getTime();
          break;
        case 'totalPrice':
          aValue = a.totalPrice;
          bValue = b.totalPrice;
          break;
        case 'orderStatus':
          aValue = a.orderStatus;
          bValue = b.orderStatus;
          break;
        // No default: only allow known fields
      }
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    // Pagination
    const start = (this.page - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalFilteredOrders(): number {
    return this.filteredOrders.length;
  }

  getProductNames(order: OrderResponse): string {
    return order.products?.map(p => p.productName).join(', ') || '';
  }

  getProductQuantities(order: OrderResponse): string {
    return order.products?.map(p => p.quantity).join(', ') || '';
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

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load order history.';
        this.loading = false;
      }
    });
  }

  viewOrder(orderId: number) {
    this.router.navigate(['/order-details', orderId]);
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
  }

  exportToCSV() {
    const rows = this.filteredOrders.map(order => ({
      orderId: order.orderId,
      date: order.orderDate,
      status: order.orderStatus,
      total: order.totalPrice
    }));
    const header = ['orderId', 'date', 'status', 'total'];
    const csvHeader = ['Order ID', 'Date', 'Status', 'Total'];
    const csv = [csvHeader.join(','), ...rows.map(row => header.map(h => '"' + ((row as Record<string, any>)[h] ?? '') + '"').join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async exportToPDF() {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    const rows = this.filteredOrders.map(order => [
      order.orderId,
      order.orderDate,
      order.orderStatus,
      order.totalPrice
    ]);
    autoTable(doc, {
      head: [['Order ID', 'Date', 'Status', 'Total']],
      body: rows,
    });
    doc.save('orders.pdf');
  }
} 