import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../_model/product.model';

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

  public getAllProducts() {
    return this.http.get<Product[]>(this.PRODUCT_API_PATH + '/product/all');
  }

  deleteProduct(productId: number) {
    return this.http.delete(
      this.PRODUCT_API_PATH + '/product/delete/' + productId
    );
  }

  updateProduct(productId: number, product: Product) {
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
}
