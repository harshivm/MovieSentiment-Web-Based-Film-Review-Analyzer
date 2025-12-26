import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentimentDisplay } from './sentiment-display';

describe('SentimentDisplay', () => {
  let component: SentimentDisplay;
  let fixture: ComponentFixture<SentimentDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentimentDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SentimentDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
