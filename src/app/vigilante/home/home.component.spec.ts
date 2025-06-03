import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeVigilanteComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeVigilanteComponent;
  let fixture: ComponentFixture<HomeVigilanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeVigilanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeVigilanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
