import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarEspacioComponent } from './solicitar-espacio.component';

describe('SolicitarEspacioComponent', () => {
  let component: SolicitarEspacioComponent;
  let fixture: ComponentFixture<SolicitarEspacioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarEspacioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitarEspacioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
