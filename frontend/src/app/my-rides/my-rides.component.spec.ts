import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRidesComponent } from './my-rides.component';

describe('MyRidesComponent', () => {
  let component: MyRidesComponent;
  let fixture: ComponentFixture<MyRidesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyRidesComponent]
    });
    fixture = TestBed.createComponent(MyRidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
