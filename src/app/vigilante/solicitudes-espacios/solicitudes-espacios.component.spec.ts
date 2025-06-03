import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesEspaciosComponent } from './solicitudes-espacios.component';

describe('SolicitudesEspaciosComponent', () => {
  let component: SolicitudesEspaciosComponent;
  let fixture: ComponentFixture<SolicitudesEspaciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesEspaciosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesEspaciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
