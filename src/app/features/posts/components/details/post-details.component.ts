import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PostComponent } from "../post/post.component";
import { SkeletonModule } from 'primeng/skeleton';
import { TabviewEditorComponent } from "../tabview-editor/tabview-editor.component";

/**
 * Post details component
 */
@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    CarouselModule,
    ProgressSpinnerModule,
    DividerModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    PostComponent,
    SkeletonModule,
    TabviewEditorComponent
  ],
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss']
})
export class PostDetailsComponent implements OnInit {
  post: Post | null = null;
  loading = true;
  error: string | null = null;
  canEdit = false;
  selectedIndex = 0;
  editorContent = {
    details: '',
    editorial: ''
  };

  carouselResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 2,
      numScroll: 1
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.fetchPost(postId);
    }
  }

  private fetchPost(postId: string): void {
    this.loading = true;
    this.postService.getPost(postId).subscribe({
      next: (post) => {
        this.post = post;
        this.editorContent = {
          details: post.details || '',
          editorial: post.editorial || ''
        };
        this.loading = false;
        this.checkEditPermission();
      },
      error: (error) => {
        this.error = 'Error loading post';
        this.loading = false;
        console.error('Error fetching post:', error);
      }
    });
  }

  private checkEditPermission(): void {
    if (!this.post) return;
    console.log(this.post);
    const userId = this.authService.getUserId();
    const userRole = this.authService.getUserRole();

    console.log(this.post.userId, userId);
    // User can edit if they are the author or if they are a moderator/admin
    this.canEdit =
      this.post.userId?.toString() == userId ||
      userRole === 'MODERATOR' ||
      userRole === 'ADMIN';
  }

  onEditClick(): void {
    if (this.post) {
      this.router.navigate(['/dashboard/post/edit', this.post.interviewId], {
        state: { post: this.post },
        skipLocationChange: false
      });
    }
  }

  onDoneClick(): void {
    this.router.navigate(['/dashboard']);
  }

  getImageUrl(imageName: string): string {
    return `https://supun-init.s3.amazonaws.com/${imageName}`;
  }

  // Carousel control methods
  onTabChange(index: number): void {
    this.selectedIndex = index;
  }

  previousImage(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }

  nextImage(): void {
    if (this.post?.images && this.selectedIndex < this.post.images.length - 1) {
      this.selectedIndex++;
    }
  }
}
