import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilVigilanteComponent } from './perfil.component';

describe('PerfilComponent', () => {
  let component: PerfilVigilanteComponent;
  let fixture: ComponentFixture<PerfilVigilanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilVigilanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilVigilanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
