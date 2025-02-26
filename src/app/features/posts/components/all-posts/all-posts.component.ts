import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { PostComponent } from '../post/post.component';
import { PostService, PostResponse } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-all-posts',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatCardModule,
    PostComponent
  ],
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss']
})
export class AllPostsComponent implements OnInit {
  private postService = inject(PostService);
  private router = inject(Router);

  posts: Post[] = [];
  totalPosts = 0;
  pageSize = 10;
  pageIndex = 0;

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getAllPosts(this.pageIndex, this.pageSize).subscribe({
      next: (response: PostResponse) => {
        this.posts = response.content;
        this.totalPosts = response.totalElements;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }

  handlePageEvent(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPosts();
  }

  onPostClick(postId: number) {
    this.router.navigate(['/dashboard/post', postId]);
  }
}
