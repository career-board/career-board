import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post',
  standalone: true,
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  imports: [CommonModule, CardModule],
})
export class PostComponent {
  @Input() post!: Post;

  constructor(private router: Router) {}

  navigateToPost() {
    this.router.navigate(['/dashboard/post', this.post.interviewId]);
  }
}
