import { Component, OnInit, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent } from '../post/post.component';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, PostComponent, PaginatorModule, SkeletonModule],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  userId = input.required<string>();
  loading: boolean = true;
  posts: Post[] = [];
  
  // Pagination
  totalPosts = 0;
  pageSize = 10;
  pageIndex = 0;

  private postService = inject(PostService);

  ngOnInit() {
    this.loadUserPosts();
  }

  private loadUserPosts() {
    this.loading = true;
    this.postService.getUserPosts(this.userId(), this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        setTimeout(() => {  // Adding a small delay to show loading state
          this.posts = response.content || [];
          this.totalPosts = response.totalElements;
          this.loading = false;
        }, 1000);
      },
      error: (error: any) => {
        this.posts = [];
        this.loading = false;
      },
    });
  }

  onPageChange(event: any) {
    // Check if it's the same page
    if (this.pageIndex === event.page && this.pageSize === event.rows) {
      return;
    }

    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.loadUserPosts();
  }
}
