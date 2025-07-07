import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../_model/product.model';
import { OrderDetails } from '../_model/order-details.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  PRODUCT_API_PATH = 'http://localhost:9090';

  public addProduct(product: FormData) {
    return this.http.post<Product>(
      this.PRODUCT_API_PATH + '/product/add',
      product
    );
  }

  public getAllProducts(pageNumber: number = 0, pageSize: number = 12, searchKey: string = '') {
    let url = `${this.PRODUCT_API_PATH}/product/all?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (searchKey) {
      url += `&searchKey=${encodeURIComponent(searchKey)}`;
    }
    return this.http.get<Product[]>(url);
  }

  deleteProduct(productId: number) {
    return this.http.delete(
      this.PRODUCT_API_PATH + '/product/delete/' + productId
    );
  }

  updateProduct(productId: number, product: FormData) {
    return this.http.put<Product>(
      this.PRODUCT_API_PATH + '/product/update/' + productId,
      product
    );
  }

  getProductById(productId: number) {
    return this.http.get<Product>(
      this.PRODUCT_API_PATH + '/product/' + productId
    );
  }

  getProductDetails(isSingleProductCheckout: boolean, productId: number) {
    return this.http.get<Product[]>(
      this.PRODUCT_API_PATH + '/product/details/' + isSingleProductCheckout + '/' +   productId
    );
  }

  placeOrder(orderDetails: OrderDetails) {
    console.log("Order details---->"+orderDetails);
    return this.http.post(this.PRODUCT_API_PATH + '/order/place', orderDetails);
  }

  public addToCart(productId: number, quantity: number) {
    return this.http.post(this.PRODUCT_API_PATH + '/cart/add/' + productId + '/' + quantity, null);
  }
}
