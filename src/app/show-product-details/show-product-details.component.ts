import { Component, OnInit } from '@angular/core';
import { ProductService } from '../_services/product.service';
import { Product } from '../_model/product.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ShowProductImagesDialogComponent } from '../show-product-images-dialog/show-product-images-dialog.component';
import { ImageProcessingService } from '../_services/image-processing.service';
import { map, tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-show-product-details',
  templateUrl: './show-product-details.component.html',
  styleUrls: ['./show-product-details.component.css'],
})
export class ShowProductDetailsComponent implements OnInit {
  constructor(
    private productService: ProductService,
    public dialog: MatDialog,
    private imageProcessingService: ImageProcessingService, // Assuming you have a service for image processing
    private router: Router // Assuming you have a router
  ) {}
  products: Product[] = [];
  pageNumber = 0;
  pageSize = 12;
  isLoading = false;
  hasMoreProducts = true;
  searchKey: string = '';

  displayedColumns: string[] = [
    'Id',
    'Name',
    'Description',
    'Discounted Price',
    'Actual Price',
    'Images',
    'Edit',
    'Delete',
  ];

  ngOnInit(): void {
    this.getAllProducts();
  }

  public getAllProducts() {
    this.isLoading = true;
    this.productService
      .getAllProducts(this.pageNumber, this.pageSize, this.searchKey)
      .pipe(
        tap((rawProducts) =>
          console.log('Raw products from API:', rawProducts)
        ),
        map((x: Product[], i: number) => {
          return x.map((product, index) => this.imageProcessingService.createImages(product));
        })
      )
      .subscribe(
        (data: Product[]) => {
          if (data.length < this.pageSize) {
            this.hasMoreProducts = false;
          }
          this.products = [...this.products, ...data];
          this.pageNumber++;
          this.isLoading = false;
          console.log(data);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          this.isLoading = false;
        }
      );
  }

  loadMore() {
    if (!this.isLoading && this.hasMoreProducts) {
      this.getAllProducts();
    }
  }

  deleteProduct(productId: any) {
    this.productService.deleteProduct(productId).subscribe(
      (response: any) => {
        console.log(response);

        this.getAllProducts();
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }

  editProduct(product: Product) {
    this.router.navigate(['/addProduct', { productId: product.productId }]);
  }

  showImages(product: Product) {
    console.log(product);
    this.dialog.open(ShowProductImagesDialogComponent, {
      data: {
        images: product.productImages,
      },
      width: '800px',
      height: '500px',
    });
  }

  onSearch() {
    this.products = [];
    this.pageNumber = 0;
    this.hasMoreProducts = true;
    this.getAllProducts();
  }
}
