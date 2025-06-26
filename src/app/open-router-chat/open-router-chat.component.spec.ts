import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenRouterChatComponent } from './open-router-chat.component';

describe('OpenRouterChatComponent', () => {
  let component: OpenRouterChatComponent;
  let fixture: ComponentFixture<OpenRouterChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenRouterChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenRouterChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
