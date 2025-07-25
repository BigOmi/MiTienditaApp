import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewEmpleadoPage } from './new-empleado.page';

describe('NewEmpleadoPage', () => {
  let component: NewEmpleadoPage;
  let fixture: ComponentFixture<NewEmpleadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewEmpleadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
