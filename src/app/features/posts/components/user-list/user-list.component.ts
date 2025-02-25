import {Component, inject, input, OnInit} from '@angular/core';

import {UserService} from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../../../common/dynamic-table/dynamic-table.component';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { User } from '../../models/user.model';
@Component({
  selector: 'app-user-list',
  imports: [
    DynamicTableComponent,CommonModule,ConfirmDialogModule,
  ],
  providers: [ConfirmationService] ,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {

  userId = input.required<string>();

  private userService = inject(UserService);
  users: User[] = [];
  columns = [
    { field: 'userId', header: 'Id' },
    { field: 'username', header: 'Username' },
    { field: 'currentCompany', header: 'Company' },
    { field: 'postCount', header: 'No of Post' },
    { field: 'createdAt', header: 'Joined Date' },
    { field: 'active', header: 'Status' },
    { field: 'action', header: 'Action' }
  ];
  actionsMenu: MenuItem[] = [
    {
      label: 'Actions',
      items: [
        { label: 'Edit', icon: 'pi pi-pencil', command: (event) => this.onEdit(event) },
        { label: 'Delete', icon: 'pi pi-trash', command: (event) => this.onDelete(event) }
      ]
    }
  ];

  constructor(private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadUserusers();
  }

  onRowClick(user:any) {
   // this.router.navigate(['/dashboard/user', user.postId]);
  }

  onActionClick(event: { action: string; row: any }) {
    console.log(`${event.action} clicked for row:`, event.row);
    if (event.action === 'Edit') {
      this.onEdit(event.row);
    } else if (event.action === 'Delete') {
      this.confirmDelete(event.row);
    }
  }
  confirmDelete(rowData: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this item?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.onDelete(rowData);
      },
      reject: () => {
        console.log('Delete operation cancelled');
      }
    });
  }

  onEdit(row: any) {
    console.log('Editing:', row);
    // Your edit logic here
  }

  onDelete(row: any) {
    console.log('Deleting:', row);
    // Your delete logic here
  }
  private loadUserusers() {
    this.userService.fetchUsers().subscribe({
      next: (users: User[]) => {
        this.users = users || [];
      },
      error: (error: any) => {
        this.users = [];
      },
    });
  }
}
