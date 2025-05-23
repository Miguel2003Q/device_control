import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudAmbienteComponent } from './solicitud-ambiente.component';

describe('SolicitudAmbienteComponent', () => {
  let component: SolicitudAmbienteComponent;
  let fixture: ComponentFixture<SolicitudAmbienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudAmbienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudAmbienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
