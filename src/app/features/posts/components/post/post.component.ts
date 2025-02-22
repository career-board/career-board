import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post',
  standalone: true,
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
  imports: [CommonModule, MatCardModule, MatDividerModule],
})
export class PostComponent {
  @Input() post!: Post;

  constructor(private router: Router) {}

  navigateToPost() {
    this.router.navigate(['/dashboard/post', this.post.interviewId]);
  }
}
