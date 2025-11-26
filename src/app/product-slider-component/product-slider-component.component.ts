import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ProductService } from '../_services/product.service';
import { Product } from '../_model/product.model';


@Component({
  selector: 'app-product-slider-component',
  templateUrl: './product-slider-component.component.html',
  styleUrls: ['./product-slider-component.component.css']
})
export class ProductSliderComponentComponent implements OnInit {
  productList: Product[] = [];

  @ViewChild('slider', { static: false }) slider!: ElementRef;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe(
      (products: Product[]) => {
        this.productList = products;
      },
      (error) => {
        console.error('Failed to load products:', error);
      }
    );
  }

  scrollLeft(): void {
    this.slider.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight(): void {
    this.slider.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }
}
