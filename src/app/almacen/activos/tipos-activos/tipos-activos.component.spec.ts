import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposActivosComponent } from './tipos-activos.component';

describe('TiposActivosComponent', () => {
  let component: TiposActivosComponent;
  let fixture: ComponentFixture<TiposActivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposActivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiposActivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
