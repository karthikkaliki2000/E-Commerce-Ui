import { Injectable } from '@angular/core';
import { Product } from '../_model/product.model';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { ProductService } from './product.service';
import { ImageProcessingService } from './image-processing.service';

@Injectable({
  providedIn: 'root',
})
export class ProductResolverService implements Resolve<Product | null> {
  constructor(
    private productService: ProductService,
    private imageProcessing: ImageProcessingService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Product | null | Observable<Product | null> | Promise<Product | null> {
    const id = route.paramMap.get('productId');

    if (id) {
      //then we have to fectch details from backend or else return empty observable
      return this.productService.getProductById(Number(id)).pipe(
        map((product) => {
          if (product) {
            return this.imageProcessing.createImages(product);
          } else {
            return null;
          } //return null if product is not found
        })
      );
    } else {
      return of(this.getProductDetails());
    }
  }

  getProductDetails() {
    return {
      productId: undefined,
      productName: '',
      productDescription: '',
      productDiscountedPrice: 0,
      productActualPrice: 0,
      productImages: [],
    };
  }
}
