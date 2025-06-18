import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasActivosComponent } from './estadisticas-activos.component';

describe('EstadisticasActivosComponent', () => {
  let component: EstadisticasActivosComponent;
  let fixture: ComponentFixture<EstadisticasActivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasActivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticasActivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
