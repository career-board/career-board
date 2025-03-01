import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { PostComponent } from '../post/post.component';
import { TabviewEditorComponent } from '../tabview-editor/tabview-editor.component';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';

/**
 * Post details component
 */
@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    CarouselModule,
    ButtonModule,
    SkeletonModule,
    FormsModule,
    PostComponent,
    TabviewEditorComponent
  ]
})
export class PostDetailsComponent implements OnInit {
  post: Post | null = null;
  loading = true;
  canEdit = false;
  editorContent: { details: string; editorial?: string } = {
    details: '',
    editorial: ''
  };
  carouselResponsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 6,
      numScroll: 1
    },
    {
      breakpoint: '1024px',
      numVisible: 5,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '375px',
      numVisible: 2,
      numScroll: 1
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService,
    public config: DynamicDialogConfig,
    public dialogRef: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    // Get postId from route params or dialog config
    const postId = this.config?.data?.postId || this.route.snapshot.params['id'];
    
    if (postId) {
      this.loadPost(postId);
    }
  }

  private loadPost(id: string): void {
    this.loading = true;
    this.postService.getPost(id).subscribe({
      next: (post: Post) => {
        this.post = post;
        this.editorContent = {
          details: post.details || '',
          editorial: post.editorial || ''
        };
        this.checkEditPermission();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private checkEditPermission(): void {
    if (!this.post) return;
    
    const userId = this.authService.getUserId();
    const userRole = this.authService.getUserRole();

    // User can edit if they are the author or if they are a moderator/admin
    this.canEdit = 
      this.post.userId?.toString() == userId ||
      userRole === 'MODERATOR' ||
      userRole === 'ADMIN';
  }

  onEditClick(): void {
    if (this.post) {
      this.router.navigate(['/dashboard/post/edit', this.post.interviewId], {
        state: { post: this.post }
      });
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    }
  }

  onDoneClick(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  getImageUrl(imageName: string): string {
    return `https://supun-init.s3.amazonaws.com/${imageName}`;
  }
}
