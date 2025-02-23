import {Component, inject, input, OnInit} from '@angular/core';
import {PostComponent} from "../post/post.component";
import {Post} from '../../models/post.model';
import {PostService} from '../../services/post.service';
import { TableModule } from 'primeng/table';


import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../../../common/dynamic-table/dynamic-table.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-list',
  imports: [
    DynamicTableComponent,CommonModule,TableModule,
  ],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss'
})
export class PostListComponent implements OnInit {

  userId = input.required<string>();

  private postService = inject(PostService);
  posts: Post[] = [];
  columns = [
    { field: 'title', header: 'Title' },
    { field: 'username', header: 'Username' },
    { field: 'role', header: 'Role' },
    { field: 'totalPost', header: 'Total Post' },
    { field: 'action', header: 'Action' }
  ];
  constructor(private router: Router) {}

  ngOnInit() {
    this.loadUserPosts();
  }

  onRowClick(post:any) {
   // this.router.navigate(['/dashboard/post', post.postId]);
  }
  onEdit(post: any) {
    console.log('Edit post:', post);
    // Your edit logic here
  }

  // Handle delete post
  onDelete(post: any) {
    console.log('Delete post:', post);
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
