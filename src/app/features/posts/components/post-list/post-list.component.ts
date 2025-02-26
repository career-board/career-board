import {Component, inject, input, OnInit} from '@angular/core';
import {PostComponent} from "../post/post.component";
import {Post} from '../../models/post.model';
import {PostService} from '../../services/post.service';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../../../common/dynamic-table/dynamic-table.component';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MatCard } from '@angular/material/card';


@Component({
  selector: 'app-post-list',
  imports: [
    CommonModule,ConfirmDialogModule,PostComponent,
  ],
  providers: [ConfirmationService] ,
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss'
})
export class PostListComponent implements OnInit {

  userId = input.required<string>();

  private postService = inject(PostService);
  posts: Post[] = [];
  columns = [
    { field: 'id', header: 'Id' },
    { field: 'username', header: 'Username' },
    { field: 'company', header: 'Company' },
    { field: 'totalPost', header: 'No of Post' },
    { field: 'createdAt', header: 'Joined Date' },
    { field: 'status', header: 'Status' },
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
    this.loadUserPosts();
  }

  onRowClick(post:any) {
   // this.router.navigate(['/dashboard/post', post.postId]);
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
  private loadUserPosts() {
    this.postService.getUserPosts(this.userId()).subscribe({
      next: (posts: Post[]) => {
        this.posts = posts || [];
      },
      error: (error: any) => {
        this.posts = [];
      },
    });
  }
}
