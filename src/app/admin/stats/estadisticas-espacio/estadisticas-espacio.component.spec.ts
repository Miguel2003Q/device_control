import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasEspacioComponent } from './estadisticas-espacio.component';

describe('EstadisticasEspacioComponent', () => {
  let component: EstadisticasEspacioComponent;
  let fixture: ComponentFixture<EstadisticasEspacioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasEspacioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticasEspacioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
