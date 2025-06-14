import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorHomeComponent } from './home.component';

describe('InstructorHomeComponent', () => {
  let component: InstructorHomeComponent;
  let fixture: ComponentFixture<InstructorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
