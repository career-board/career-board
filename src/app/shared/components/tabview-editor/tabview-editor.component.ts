import { Component, EventEmitter, forwardRef, input, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { EditorComponent } from '../editor/editor.component';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-tabview-editor',
  standalone: true,
  imports: [CommonModule, TabViewModule, EditorComponent, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TabviewEditorComponent),
      multi: true,
    },
  ],
  templateUrl: './tabview-editor.component.html',
  styleUrls: ['./tabview-editor.component.scss'],
})
export class TabviewEditorComponent implements ControlValueAccessor {
  detailsContent: string = '';
  editorialContent: string = '';
  readonly = input<boolean>(false);
  showEditorial = input<boolean>(false);
  @Output() activeTabChange = new EventEmitter<number>();

  onChange = (value: any) => {};
  onTouched = () => {};

  onDetailsChange(content: string) {
    this.detailsContent = content;
    this.emitValue();
  }

  onEditorialChange(content: string) {
    this.editorialContent = content;
    this.emitValue();
  }

  onTabChange(event: any) {
    this.activeTabChange.emit(event.index);
  }

  private emitValue() {
    this.onChange({
      details: this.detailsContent,
      editorial: this.editorialContent,
    });
  }

  writeValue(value: any): void {
    if (value) {
      this.detailsContent = value.details || '';
      this.editorialContent = value.editorial || '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}
