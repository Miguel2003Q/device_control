import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionActivosComponent } from './gestion-activos.component';

describe('GestionActivosComponent', () => {
  let component: GestionActivosComponent;
  let fixture: ComponentFixture<GestionActivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionActivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionActivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
