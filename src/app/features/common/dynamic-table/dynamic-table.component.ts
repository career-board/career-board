import { CommonModule } from '@angular/common';
import { Component ,Input,EventEmitter,Output,SimpleChanges} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';


@Component({
  selector: 'app-dynamic-table',
  imports: [CommonModule,TableModule,ButtonModule,TagModule,MenuModule,SkeletonModule],
  standalone:true,
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent {

  @Input() cols: any[] = [];
  @Input() datas: any[] = [];
  @Input() actionsMenu: MenuItem[] = []; // Receive menu structure from parent
  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>(); // New output for actions


  isLoading = true;  // Flag to manage loading state

  ngOnChanges(changes: SimpleChanges) {
    // Check if 'datas' has changed
    if (changes['datas'] && changes['datas'].currentValue) {
      // Set loading to false once data is available
      this.isLoading = false;
    }
  }
  isDate(value: any): boolean {
    // Check if the value is a valid date object and not just a number
    const parsedDate = Date.parse(value);
    return !isNaN(parsedDate) && Object.prototype.toString.call(value) === '[object String]' && parsedDate > 0;
  }


  emitRowClick(post: any) {
    this.rowClick.emit(post);
  }

  setActionsMenu(rowData: any) {
    this.actionsMenu = [
      {
        label: 'Actions',
        items: [
          { label: 'Edit', icon: 'pi pi-pencil', command: () => this.emitAction('Edit', rowData) },
          { label: 'Delete', icon: 'pi pi-trash', command: () => this.emitAction('Delete', rowData) }
        ]
      }
    ];
  }

  emitAction(action: string, rowData: any) {
    this.actionClick.emit({ action, row: rowData }); // Emit event to parent
  }
}
