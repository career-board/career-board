import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { PostComponent } from '../post/post.component';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-posts',
  standalone: true,
  imports: [CommonModule, PaginatorModule, SkeletonModule, PostComponent],
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss']
})
export class AllPostsComponent implements OnInit {
  posts: Post[] = [];
  totalPosts: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  loading: boolean = true;

  constructor(private postService: PostService, private router: Router) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getAllPosts(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.posts = response.content;
          this.totalPosts = response.totalElements;
          this.loading = false;
        }, 1000);
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    // Check if it's the same page
    if (this.pageIndex === event.page && this.pageSize === event.rows) {
      return;
    }

    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.loadPosts();
  }

  onPostClick(postId: number) {
    this.router.navigate(['/dashboard/interview', postId]);
  }
}
