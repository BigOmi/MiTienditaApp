import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NuevaVentaComponent } from './nueva-venta.component';

describe('NuevaVentaComponent', () => {
  let component: NuevaVentaComponent;
  let fixture: ComponentFixture<NuevaVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NuevaVentaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevaVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
