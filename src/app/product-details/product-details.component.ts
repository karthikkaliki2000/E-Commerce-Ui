import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../_model/product.model';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  product: Product | undefined;

  selectedProductIndex=0;
  ngOnInit(): void {
    this.product = this.activatedRoute.snapshot.data['product'];
    const mainImageUrl = this.activatedRoute.snapshot.paramMap.get('mainImageUrl');
    if (mainImageUrl && this.product?.productImages) {
      const idx = this.product.productImages.findIndex(img => img.url === mainImageUrl);
      this.selectedProductIndex = idx !== -1 ? idx : 0;
    } else {
      this.selectedProductIndex = 0;
    }
    console.log('Details page product images:', this.product?.productImages);
    console.log(this.product);
  }

  constructor( private activatedRoute:ActivatedRoute, private router:Router) {
   

  }

  get productDiscountPercentage(): number {
    if (!this.product) return 0;
    const actual = this.product.productActualPrice || 0;
    const discounted = this.product.productDiscountedPrice || 0;
    if (actual === 0) return 0;
    return Math.round(((actual - discounted) / actual) * 100);
  }

  buyProduct(productId: number) {
    this.router.navigate(['/buyProduct',
     {
      isSingleProductCheckout:true,
      productId:productId
     }
    ]);
    console.log("buy product");
  }

}
