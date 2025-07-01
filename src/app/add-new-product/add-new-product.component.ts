import { Component, OnInit } from '@angular/core';
import { Product } from '../_model/product.model';
import { NgForm } from '@angular/forms';
import { ProductService } from '../_services/product.service';
import { FileHandle } from '../_model/file-handle.model';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-new-product',
  templateUrl: './add-new-product.component.html',
  styleUrls: ['./add-new-product.component.css'],
})
export class AddNewProductComponent implements OnInit {
  [x: string]: any;

  isNewProduct: boolean = true; // Flag to determine if it's a new product or editing an existing one
  imagesChanged: boolean = false;

  constructor(
    private productService: ProductService,
    private sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  gridCols: number = 4;

  ngOnInit(): void {
    this.setGridCols();
    this.imagesChanged = false;

    window.addEventListener('resize', () => {
      this.setGridCols();
    });

    this.activatedRoute.data.subscribe((data) => {
      this.product = data['product'] || this.product;
      if (this.product && this.product.productId) {
        this.isNewProduct = false;
      } else {
        this.isNewProduct = true;
        this.resetProduct();
      }
    });

    // Listen for navigation events to reset form when navigating to Add Product
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // If the current route is addProduct and no productId param, reset
        const url = event.urlAfterRedirects || event.url;
        if (url.includes('/addProduct') && (!this.product || !this.product.productId)) {
          this.isNewProduct = true;
          this.resetProduct();
        }
      }
    });

    // Listen for query param changes to force reset
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['t']) {
        this.isNewProduct = true;
        this.resetProduct();
      }
    });
  }

  setGridCols(): void {
    const width = window.innerWidth;
    if (width <= 600) {
      this.gridCols = 1;
    } else if (width <= 900) {
      this.gridCols = 2;
    } else if (width <= 1200) {
      this.gridCols = 3;
    } else {
      this.gridCols = 4;
    }
  }

  product: Product = {
    productName: '',
    productDescription: '',
    productDiscountedPrice: 0,
    productActualPrice: 0,
    productImages: [],
    // createdAt and updatedAt are optional and typically set by the backend
  };

  addProduct(productForm: NgForm): void {
    if (!this.product.productImages || this.product.productImages.length === 0) {
      this.snackBar.open('Please add at least one product image.', 'Close', {
        duration: 4000,
        verticalPosition: 'top',
      });
      return;
    }
    this.productService
      .addProduct(this.prepareFormData(this.product))
      .subscribe(
        (response: Product) => {
          productForm.reset();
          this.product.productImages = [];
          this.snackBar.open('Product added successfully!', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
        },
        (error: any) => {
          let msg = 'Failed to add product.';
          if (error.status === 401 || error.status === 403) {
            msg = 'You are not authorized. Please login as admin.';
          } else if (error.error && typeof error.error === 'string' && error.error.length > 0) {
            msg = error.error;
          } else if (error.message && error.message.length > 0) {
            msg = error.message;
          }
          this.snackBar.open(msg, 'Close', {
            duration: 4000,
            verticalPosition: 'top',
          });
          console.error('Add Product Error:', error);
        }
      );
  }

  prepareFormData(product: Product): FormData {
    const formData = new FormData();

    // Attach the serialized product JSON as a Blob
    formData.append(
      'product',
      new Blob([JSON.stringify(product)], { type: 'application/json' })
    );

    // Safely append image files, if any
    const images = product.productImages || [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (image?.file && image?.file?.name) {
        formData.append('imagefiles', image.file);
      }
    }

    return formData;
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      const file = event.target.files[0] || null;
      const fileHandle: FileHandle = {
        file: file,
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)),
      };
      if (!this.product.productImages) {
        this.product.productImages = [];
      }
      this.product.productImages.push(fileHandle);
      this.imagesChanged = true;
    }
  }

  removeImage(i: number): void {
    if (this.product.productImages && this.product.productImages.length > i) {
      this.product.productImages.splice(i, 1);
      this.imagesChanged = true;
    } else {
      console.error('Invalid image index');
    }

    // Optionally, you can also clear the file input field if needed
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = ''; // Clear the file input
    }
    // If you want to remove the URL object as well, you can do so here
    if (this.product.productImages && this.product.productImages.length === 0) {
      this.product.productImages = []; // Ensure the array is empty if no images left
    }
    // Optionally, you can also log the updated productImages array
    console.log('Updated productImages:', this.product.productImages);
  }

  clearProductData(form: NgForm) {
    form.reset();
    //clear images also
    this.product.productImages = [];
  }

  filesDropped(fileHandle: FileHandle) {
    this.product.productImages?.push(fileHandle);
    this.imagesChanged = true;
  }

  resetProduct() {
    this.product = {
      productName: '',
      productDescription: '',
      productDiscountedPrice: 0,
      productActualPrice: 0,
      productImages: [],
    };
  }

  onSubmit(productForm: NgForm): void {
    if (this.isNewProduct) {
      this.addProduct(productForm);
    } else {
      this.updateProduct(productForm);
    }
  }

  updateProduct(productForm: NgForm): void {
    if (!this.product.productId) {
      return;
    }
    const productToUpdate = { ...this.product };
    if (!this.imagesChanged) {
      delete productToUpdate.productImages;
    }
    const formData = this.prepareFormData(productToUpdate);
    this.productService
      .updateProduct(this.product.productId, formData)
      .subscribe(
        (response: Product) => {
          productForm.reset();
          this.product.productImages = [];
          this.imagesChanged = false;
          this.snackBar.open('Product updated successfully!', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
        },
        (error: any) => {
          let msg = 'Failed to update product.';
          if (error.status === 401 || error.status === 403) {
            msg = 'You are not authorized. Please login as admin.';
          }
          this.snackBar.open(msg, 'Close', {
            duration: 4000,
            verticalPosition: 'top',
          });
          console.error('Update Product Error:', error);
        }
      );
  }
}
