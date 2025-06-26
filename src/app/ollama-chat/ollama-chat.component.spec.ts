import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OllamaChatComponent } from './ollama-chat.component';

describe('OllamaChatComponent', () => {
  let component: OllamaChatComponent;
  let fixture: ComponentFixture<OllamaChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OllamaChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OllamaChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 