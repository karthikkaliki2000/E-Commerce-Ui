import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSliderComponentComponent } from './product-slider-component.component';

describe('ProductSliderComponentComponent', () => {
  let component: ProductSliderComponentComponent;
  let fixture: ComponentFixture<ProductSliderComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSliderComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductSliderComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
