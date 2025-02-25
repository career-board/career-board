import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Post } from '../../models/post.model';
import { PostDetailsComponent } from '../details/post-details.component';

@Component({
  selector: 'app-post',
  standalone: true,
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  imports: [CommonModule, CardModule, SkeletonModule, DialogModule],
  providers: [DialogService]
})
export class PostComponent implements OnDestroy {
  @Input() post!: Post;
  @Input() loading: boolean = true;
  
  private ref: DynamicDialogRef | undefined;

  constructor(
    private router: Router,
    private dialogService: DialogService
  ) {}

  navigateToPost() {
    // Show post details in dialog
    this.ref = this.dialogService.open(PostDetailsComponent, {
      header: 'Interview Details',
      width: '70%',
      height: '90vh',
      maximizable: true,
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      style: {
        'max-width': '1200px'
      },
      data: {
        postId: this.post.interviewId
      }
    });

    // Handle dialog close
    this.ref.onClose.subscribe(() => {
      this.ref = undefined;
    });
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
