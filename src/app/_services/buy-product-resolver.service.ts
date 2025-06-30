import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Product } from '../_model/product.model';
import { map, Observable } from 'rxjs';
import { ProductService } from './product.service';
import { ImageProcessingService } from './image-processing.service';

@Injectable({
  providedIn: 'root'
})
export class BuyProductResolverService implements Resolve<Product[]>{

  constructor(private productService:ProductService, private imageProcessingService:ImageProcessingService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Product[] | Observable<Product[]> | Promise<Product[]> {
   
   const id=route.paramMap.get('productId');    
   const isSingleProductCheckoutParam = route.paramMap.get('isSingleProductCheckout');
   const isSingleProductCheckout = isSingleProductCheckoutParam === 'true';
  
   return this.productService.getProductDetails(isSingleProductCheckout, id as unknown as number).pipe(
    map(
      (products:Product[],index:number)=>{
        return products.map(
          (product:Product)=>{
            return this.imageProcessingService.createImages(product);
          }
        ) ;
      } 
    )
   );
  }
}
