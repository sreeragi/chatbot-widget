import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleEditorComponent } from './style-editor.component';

describe('StyleEditorComponent', () => {
  let component: StyleEditorComponent;
  let fixture: ComponentFixture<StyleEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StyleEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StyleEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
