import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesTablaComponent } from './gestion-usuarios.component';

describe('GestionUsuariosComponent', () => {
  let component: RolesTablaComponent;
  let fixture: ComponentFixture<RolesTablaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesTablaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesTablaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
