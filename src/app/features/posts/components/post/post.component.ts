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
  providers: [DialogService],
})
export class PostComponent implements OnDestroy {
  @Input() post!: Post;
  @Input() loading: boolean = true;
  @Input() disablePopup: boolean = false;

  private ref: DynamicDialogRef | undefined;

  constructor(private router: Router, private dialogService: DialogService) {}

  navigateToPost() {
    if (this.disablePopup) {
      return;
    }
    
    // Get screen width
    const isMobile = window.innerWidth <= 768;

    // Show post details in dialog with responsive width
    this.ref = this.dialogService.open(PostDetailsComponent, {
      header: 'Interview Details',
      width: isMobile ? '90%' : '70%',
      height: '90vh',
      maximizable: isMobile ?true : false,
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      style: {
        'max-width': isMobile ? '100%' : '1200px',
      },
      data: {
        postId: this.post.interviewId,
      },
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
