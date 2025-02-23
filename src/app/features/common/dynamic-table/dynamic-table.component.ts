import { CommonModule } from '@angular/common';
import { Component ,Input,EventEmitter,Output} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-dynamic-table',
  imports: [CommonModule,TableModule,ButtonModule],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent {

  @Input() cols: any[] = [];
  @Input() datas: any[] = [];
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();

  emitEdit(post: any, event: Event) {
    event.stopPropagation(); // Prevents row click from firing
    this.edit.emit(post);
  }

  emitDelete(post: any, event: Event) {
    event.stopPropagation(); // Prevents row click from firing
    this.delete.emit(post);
  }

  emitRowClick(post: any) {
    this.rowClick.emit(post);
  }
}
