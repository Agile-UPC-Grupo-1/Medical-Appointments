import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsChatbotComponent } from './results-chatbot.component';

describe('ResultsChatbotComponent', () => {
  let component: ResultsChatbotComponent;
  let fixture: ComponentFixture<ResultsChatbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsChatbotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResultsChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
