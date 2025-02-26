import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { CreateInterviewRequest } from '../../models/create-post-request.model';
import { PresignImageResponse } from '../../models/presign-image-response.model';
import { UpdateInterviewRequest } from '../../models/update-post-request.model';
import { ImageService } from '../../services/image.service';
import { PostService } from '../../services/post.service';
import { postImage } from '../../models/post-image.model';
import { Post } from '../../models/post.model';

interface ImagePreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-manage-interview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressBarModule,
    MatIconModule,
  ],
  templateUrl: './manage-interview.component.html',
  styleUrls: ['./manage-interview.component.scss'],
})
export class ManageInterviewComponent implements OnInit {
  postForm: FormGroup;
  selectedFiles: File[] = [];
  uploadProgress: number = 0;
  isUploading: boolean = false;
  imagePreviews: ImagePreview[] = [];
  isEditMode: boolean = false;
  postId: string | null = null;
  currentPost: Post | null = null;
  canModerate: boolean = false;

  imageService = inject(ImageService);
  authService = inject(AuthService);
  postService = inject(PostService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor(private fb: FormBuilder) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      status: ['DRAFT', [Validators.required]],
      moderatorComment: [''],
    });

    const userRole = this.authService.getUserRole();
    this.canModerate = userRole === 'MODERATOR' || userRole === 'ADMIN';
  }

  ngOnInit() {
    const state = window.history.state as { post: Post } | undefined;
    console.log('State:', state);

    if (state?.post) {
      // Use the post data from router state
      this.isEditMode = true;
      this.postId = state.post.interviewId?.toString() || null;
      this.currentPost = state.post;

      // Check if user has permission to edit
      const userId = this.authService.getUserId();
      if (state.post.userId.toString() != userId && !this.canModerate) {
        this.snackBar.open(
          'You do not have permission to edit this post',
          'Close',
          {
            duration: 3000,
          }
        );
        this.router.navigate(['/dashboard']);
        return;
      }

      this.postForm.patchValue({
        title: state.post.description,
        content: state.post.content,
        status: state.post.status,
        moderatorComment: state.post.moderatorComment
      });

      // Load existing images
      if (state.post.images) {
        state.post.images.forEach((image) => {
          this.imagePreviews.push({
            file: new File([], image.imageName),
            url: `https://supun-init.s3.amazonaws.com/${image.imageName}`,
          });
        });
        this.selectedFiles = this.imagePreviews.map(
          (preview) => preview.file
        );
      }
    } else {
      // If no state data, check if we're in edit mode via URL
      this.route.params
        .pipe(
          switchMap((params) => {
            const id = params['id'];
            if (id) {
              this.isEditMode = true;
              this.postId = id;
              return this.postService.getPost(id);
            }
            return of(null);
          })
        )
        .subscribe({
          next: (post) => {
            if (post) {
              this.currentPost = post;
              // Check if user has permission to edit
              const userId = this.authService.getUserId();
              if (post.userId.toString() != userId && !this.canModerate) {
                this.snackBar.open(
                  'You do not have permission to edit this post',
                  'Close',
                  {
                    duration: 3000,
                  }
                );
                this.router.navigate(['/dashboard']);
                return;
              }

              this.postForm.patchValue({
                title: post.description,
                content: post.content,
                status: post.status,
                moderatorComment: post.moderatorComment
              });

              // Load existing images
              if (post.images) {
                post.images.forEach((image) => {
                  this.imagePreviews.push({
                    file: new File([], image.imageName),
                    url: `https://supun-init.s3.amazonaws.com/${image.imageName}`,
                  });
                });
                this.selectedFiles = this.imagePreviews.map(
                  (preview) => preview.file
                );
              }
            }
          },
          error: (error) => {
            this.snackBar.open('Error loading post: ' + error.message, 'Close', {
              duration: 3000,
            });
          },
        });
    }
  }

  onFileSelected(event: any) {
    const files: FileList | null = event.target.files;
    if (files) {
      console.log('Selected files:', files);

      let newFiles: File[] = Array.from(files).map(
        (file: File, index: number) => {
          console.log(file.name.split('.').pop());
          const timestamp = Date.now() + '_' + index;
          const newName = timestamp + '.' + file.name.split('.').pop();
          Object.defineProperty(file, 'name', {
            writable: true,
            value: `${this.authService.getUserId()}/${newName}`,
          });
          return file;
        }
      );
      const nameList = newFiles.map((file: File) => file.name);
      console.log(nameList);
      this.imageService.getPresignedUploadUrl(nameList).subscribe({
        next: (response) => {
          newFiles.forEach((file: File) => {
            console.log(response);
            const presignedUrl = response.find((res: PresignImageResponse) => {
              const isMatching = res.key === file.name;
              console.log(res.key);
              console.log(file.name);
              console.log(isMatching);
              return isMatching;
            });
            // file['name'] = presignedUrl!.key;
            this.imageService.uploadFile(file, presignedUrl!.url).subscribe({
              next: (response) => {
                console.log('File uploaded successfully:', response);
              },
              error: (error) => {
                console.error('File upload failed:', error);
              },
            });
          });
        },
      });

      this.selectedFiles = [...this.selectedFiles, ...newFiles];

      // Generate previews for each new file
      newFiles.forEach((file: File) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviews.push({
              file: file,
              url: e.target.result,
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeImage(index: number) {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles = this.imagePreviews.map((preview) => preview.file);
  }

  mergeImageLists(
    uploadedImages: string[],
    imageList: postImage[]
  ): postImage[] {
    const imageMap = new Map(
      imageList.map((image) => [image.imageName, image.imageId])
    );

    return uploadedImages.map((imageName) => ({
      imageId: imageMap.get(imageName) ?? 0,
      imageName,
    }));
  }

  async onSubmit() {
    if (this.postForm.valid) {
      try {
        this.isUploading = true;

        // Create post with image names
        const uploadedImages = this.selectedFiles.map((file) => file.name);
        console.log(uploadedImages);
        let moderatorComment = '';
        if (this.canModerate) {
          moderatorComment = this.postForm.get('moderatorComment')!.value;
        }

        if (this.isEditMode && this.postId) {
          console.log('Update Post');
          const interviewData: UpdateInterviewRequest = {
            interviewId: Number(this.postId),
            userId: this.currentPost!.userId,
            description: this.postForm!.get('title')!.value,
            content: this.postForm.get('content')!.value,
            images: this.mergeImageLists(
              uploadedImages,
              this.currentPost!.images
            ),
            status: this.postForm.get('status')!.value,
            moderatorComment: moderatorComment,
          };
          this.postService.updatePost(interviewData as UpdateInterviewRequest).subscribe({
            next: (response) => {
              this.snackBar.open('Interview updated successfully!', 'Close', {
                duration: 3000,
              });
              this.router.navigate(['/dashboard/post', this.postId]);
            },
            error: (error) => {
              this.snackBar.open(
                'Error updating post: ' + error.message,
                'Close',
                {
                  duration: 3000,
                }
              );
            },
          });
        } else {
          console.log('Create Post');
          const postData: CreateInterviewRequest = {
            description: this.postForm.get('title')?.value,
            content: this.postForm.get('content')?.value,
            imageNames: uploadedImages,
            status: this.postForm.get('status')?.value,
            userId: Number(this.authService.getUserId()),
            moderatorComment: moderatorComment,
          };
          this.postService.createPost(postData).subscribe({
            next: (response) => {
              if (typeof response === 'string') {
                this.snackBar.open(response, 'Close', {
                  duration: 3000,
                });
              } else {
                this.snackBar.open('Interview created successfully!', 'Close', {
                  duration: 3000,
                });
                this.router.navigate(['/dashboard/post', response.interviewId]);
              }
            },
            error: (error) => {
              this.snackBar.open(
                'Error creating post: ' + error.message,
                'Close',
                {
                  duration: 3000,
                }
              );
            },
          });
        }
      } catch (error: any) {
        this.snackBar.open(
          'Error uploading images: ' + error.message,
          'Close',
          {
            duration: 3000,
          }
        );
      } finally {
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    }
  }
}
