import { Component, OnInit, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent } from '../post/post.component';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  userId = input.required<string>();
  loading: boolean = true;
  posts: Post[] = [];

  private postService = inject(PostService);

  ngOnInit() {
    this.loadUserPosts();
  }

  private loadUserPosts() {
    this.loading = true;
    this.postService.getUserPosts(this.userId()).subscribe({
      next: (posts: Post[]) => {
        setTimeout(() => {  // Adding a small delay to show loading state
          this.posts = posts || [];
          this.loading = false;
        }, 1000);
      },
      error: (error: any) => {
        this.posts = [];
        this.loading = false;
      },
    });
  }
}
