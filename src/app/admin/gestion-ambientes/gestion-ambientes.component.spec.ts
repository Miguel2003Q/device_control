import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionAmbientesComponent } from './gestion-ambientes.component';

describe('GestionAmbientesComponent', () => {
  let component: GestionAmbientesComponent;
  let fixture: ComponentFixture<GestionAmbientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionAmbientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionAmbientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
