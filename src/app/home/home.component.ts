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
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
    private breakpointObserver: BreakpointObserver,
  ) {}
  ngOnInit(): void {
   this.getAllProducts();
   this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet
    ]).subscribe(result => {
      if (result.matches) {
        this.gridCols = 1;
      } else {
        this.gridCols = 4;
      }
    });
  }

  products: Product[] = [];
  openChat = false;
  selectedBot: 'ollama' | 'openrouter' = 'ollama';
  @ViewChild('ollamaChat') ollamaChat?: OllamaChatComponent;
  @ViewChild('openRouterChat') openRouterChat?: OpenRouterChatComponent;
  expandedDescriptions = new Set<number>();
  pageNumber = 0;
  pageSize = 12;
  isLoading = false;
  hasMoreProducts = true;
  searchKey: string = '';
  gridCols = 4; // default

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
          console.log('Home page product images:', this.products.map(p => p.productImages));
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

  showProductDetails(productId: number | undefined, imageUrl: string | undefined) {
    this.router.navigate(['/productViewDetails', productId]);
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

  onSearch() {
    this.products = [];
    this.pageNumber = 0;
    this.hasMoreProducts = true;
    this.getAllProducts();
  }

}
