import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Post } from '../../models/post.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-post',
  standalone: true,
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
  imports: [CommonModule,ButtonModule,CardModule,ButtonModule,TagModule],
})
export class PostComponent {
  @Input() post!: Post;

  constructor(private router: Router) {}

  navigateToPost() {
    this.router.navigate(['/dashboard/post', this.post.postId]);
  }
  editPost(post: any) {
    console.log('Edit post:', post);
    // Your edit logic here
  }

  // Handle delete post
  deletePost(post: any) {
    console.log('Delete post:', post);
    // Your delete logic here
  }
}
