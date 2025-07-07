import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../_model/product.model';
import { ProductService } from '../_services/product.service';
import { ImageProcessingService } from '../_services/image-processing.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  product: Product | undefined;

  selectedProductIndex=0;
  quantity: number = 1;

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(+id).subscribe(product => {
        this.product = this.imageProcessingService.createImages(product);
        this.selectedProductIndex = 0;
        console.log('Details page product images:', this.product?.productImages);
        console.log(this.product);
      });
    }
  }

  constructor( private activatedRoute:ActivatedRoute, private router:Router, private productService: ProductService, private imageProcessingService: ImageProcessingService) {
   

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

  addToCart(productId: number, quantity: number) {
    this.productService.addToCart(productId, quantity).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

}
