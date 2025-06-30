import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ProductService } from '../_services/product.service';
import { map, tap } from 'rxjs';
import { ImageProcessingService } from '../_services/image-processing.service';
import { Product } from '../_model/product.model';
import { HttpErrorResponse } from '@angular/common/http';
import { OllamaChatComponent } from '../ollama-chat/ollama-chat.component';
import { OpenRouterChatComponent } from '../open-router-chat/open-router-chat.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAuthService } from '../_services/user-auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  constructor(
    private productService: ProductService,
    private imageProcessingService: ImageProcessingService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userAuthService: UserAuthService,



  ) {}
  ngOnInit(): void {
   this.getAllProducts();
  }

  products: Product[] = [];
  openChat = false;
  selectedBot: 'ollama' | 'openrouter' = 'ollama';
  @ViewChild('ollamaChat') ollamaChat?: OllamaChatComponent;
  @ViewChild('openRouterChat') openRouterChat?: OpenRouterChatComponent;
  expandedDescriptions = new Set<number>();

  public getAllProducts() {
    this.productService
      .getAllProducts()
      .pipe(
        tap((rawProducts) =>
          console.log('Raw products from API:', rawProducts)
        ),
        map((x: Product[], i: number) => {
          //First map will take entire products array
          return x.map(
            (
              product,
              index //second map will take single element of products array
            ) => this.imageProcessingService.createImages(product)
          );
        }) // This will return an array of products with images processed
      )
      .subscribe(
        (data: Product[]) => {
          this.products = data;
          console.log(data);
        },

        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
  }

  openChatDialog() {
    this.openChat = true;
    this.cdRef.detectChanges();
  }

  clearActiveHistory() {
    if (this.selectedBot === 'ollama' && this.ollamaChat) {
      this.ollamaChat.clearHistory();
    } else if (this.selectedBot === 'openrouter' && this.openRouterChat) {
      this.openRouterChat.clearHistory();
    }
  }

  toggleDescription(idx: number) {
    if (this.expandedDescriptions.has(idx)) {
      this.expandedDescriptions.delete(idx);
    } else {
      this.expandedDescriptions.add(idx);
    }
  }

  showProductDetails(productId: number | undefined) {
    this.router.navigate(['/productViewDetails', {productId: productId}]);
  }

  getFirstTwoWords(desc: string): string {
    if (!desc) return '';
    const words = desc.split(' ');
    return words.slice(0, 2).join(' ');
  }

  getMiddleWords(desc: string): string {
    if (!desc) return '';
    const words = desc.split(' ');
    if (words.length <= 3) return '';
    return words.slice(2, -1).join(' ');
  }

  getLastWord(desc: string): string {
    if (!desc) return '';
    const words = desc.split(' ');
    return words.length > 0 ? words[words.length - 1] : '';
  }

}
