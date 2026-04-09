import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Uploadcomponent } from './uploadcomponent';

describe('Uploadcomponent', () => {
  let component: Uploadcomponent;
  let fixture: ComponentFixture<Uploadcomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Uploadcomponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Uploadcomponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
