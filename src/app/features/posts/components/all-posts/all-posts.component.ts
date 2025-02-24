import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { PostComponent } from '../post/post.component';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-posts',
  standalone: true,
  imports: [CommonModule, PaginatorModule, PostComponent],
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss']
})
export class AllPostsComponent implements OnInit {
  posts: Post[] = [];
  totalPosts: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  constructor(private postService: PostService, private router: Router) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.getAllPosts(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.posts = response.content;
        this.totalPosts = response.totalElements;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }

  onPageChange(event: any): void {
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.loadPosts();
  }

  onPostClick(postId: number) {
    this.router.navigate(['/dashboard/post', postId]);
  }
}
