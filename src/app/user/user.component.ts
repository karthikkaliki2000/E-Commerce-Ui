import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { UserService } from '../_services/user.service';
import { ProductService } from '../_services/product.service';
import { Product } from '../_model/product.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {
  productList: Product[] = [];
  message: any;

  @ViewChild('scrollTrack', { static: false }) scrollTrack!: ElementRef;

  constructor(
    private userService: UserService,
    public productService: ProductService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.forUser();
    this.productService.getAllProducts().subscribe(
      (products: Product[]) => {
        this.productList = products;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  forUser() {
    this.userService.forUser().subscribe(
      (data) => {
        this.message = data;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  pauseScroll(): void {
    this.renderer.setStyle(this.scrollTrack.nativeElement, 'animation-play-state', 'paused');
  }

  resumeScroll(): void {
    this.renderer.setStyle(this.scrollTrack.nativeElement, 'animation-play-state', 'running');
  }
}
