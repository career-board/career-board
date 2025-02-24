import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post',
  standalone: true,
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  imports: [CommonModule, CardModule, SkeletonModule],
})
export class PostComponent {
  @Input() post!: Post;
  @Input() loading: boolean = true;

  constructor(private router: Router) {}

  navigateToPost() {
    this.router.navigate(['/dashboard/post', this.post.interviewId]);
  }
}
