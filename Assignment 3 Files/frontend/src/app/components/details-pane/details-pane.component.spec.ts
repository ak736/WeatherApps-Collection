import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsPaneComponent } from './details-pane.component';

describe('DetailsPaneComponent', () => {
  let component: DetailsPaneComponent;
  let fixture: ComponentFixture<DetailsPaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsPaneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
