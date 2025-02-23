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
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { AuthService } from '../../../../core/services/auth.service';
import { CreateInterviewRequest } from '../../models/create-post-request.model';
import { UpdateInterviewRequest } from '../../models/update-post-request.model';
import { PostService } from '../../services/post.service';
import { ImageService } from '../../services/image.service';
import { postImage } from '../../models/post-image.model';
import { Post } from '../../models/post.model';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { PresignImageResponse } from '../../models/presign-image-response.model';

interface ImagePreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-manage-interview',
  templateUrl: './manage-interview.component.html',
  styleUrls: ['./manage-interview.component.scss'],
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
    DropdownModule,
    InputTextModule,
    CalendarModule,
  ],
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
  interviewTypes: any[] = [];
  existingImages: postImage[] = [];

  imageService = inject(ImageService);
  authService = inject(AuthService);
  postService = inject(PostService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  constructor(private fb: FormBuilder) {
    this.postForm = this.fb.group({
      description: ['', [Validators.required]],
      content: ['', [Validators.required]],
      status: ['DRAFT', [Validators.required]],
      moderatorComment: [''],
      typeId: [null, [Validators.required]],
      company: ['', [Validators.required]],
      interviewDate: [null, [Validators.required]],
    });

    const userRole = this.authService.getUserRole();
    this.canModerate = userRole === 'MODERATOR' || userRole === 'ADMIN';
  }

  ngOnInit(): void {
    this.loadInterviewTypes();
    const state = window.history.state as { post: Post } | undefined;
    console.log('State:', state);

    if (state?.post) {
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
        description: state.post.description,
        content: state.post.content,
        status: state.post.status,
        moderatorComment: state.post.moderatorComment,
        typeId: state.post.typeId,
        company: state.post.company,
        interviewDate: new Date(state.post.interviewDate),
      });

      // Load existing images
      if (state.post.images) {
        this.existingImages = state.post.images;
        state.post.images.forEach((image) => {
          this.imagePreviews.push({
            file: new File([], image.imageName),
            url: `https://supun-init.s3.amazonaws.com/${image.imageName}`,
          });
        });
        this.selectedFiles = this.imagePreviews.map((preview) => preview.file);
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
                description: post.description,
                content: post.content,
                status: post.status,
                moderatorComment: post.moderatorComment,
                typeId: post.typeId,
                company: post.company,
                interviewDate: new Date(post.interviewDate),
              });

              // Load existing images
              if (post.images) {
                this.existingImages = post.images;
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
            this.snackBar.open(
              'Error loading post: ' + error.message,
              'Close',
              {
                duration: 3000,
              }
            );
          },
        });
    }
  }

  private loadInterviewTypes() {
    this.http
      .get<any[]>(`${environment.apiUrl}/api/interview-types`)
      .subscribe({
        next: (types) => {
          this.interviewTypes = types.map((type) => ({
            ...type,
            name: type.name
              .replace(/_/g, ' ')
              .toLowerCase()
              .split(' ')
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(' '),
          }));
        },
        error: (error) => {
          console.error('Error loading interview types:', error);
        },
      });
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

  isInterviewDateInvalid(): boolean {
    return (
      this.postForm.get('interviewDate')!.invalid &&
      this.postForm.get('interviewDate')!.touched
    );
  }

  isCompanyInvalid(): boolean {
    return (
      this.postForm.get('company')!.invalid &&
      this.postForm.get('company')!.touched
    );
  }

  isTypeIdInvalid(): boolean {
    return (
      this.postForm.get('typeId')!.invalid &&
      this.postForm.get('typeId')!.touched
    );
  }

  isDescriptionInvalid(): boolean {
    return (
      this.postForm.get('description')!.invalid &&
      this.postForm.get('description')!.touched
    );
  }

  async onSubmit() {
    if (this.postForm.valid) {
      try {
        this.isUploading = true;

        if (this.isEditMode && this.postId) {
          this.updateInterview()
        } else {
          this.createInterview();
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

  private createInterview() {
    console.log('Create Post');
    const postData: CreateInterviewRequest = this.mapToCreateInterviewRequest();
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

  private mapToCreateInterviewRequest() {

    const uploadedImages = this.selectedFiles.map((file) => file.name);
    console.log(uploadedImages);
    let moderatorComment = '';
    if (this.canModerate) {
      moderatorComment = this.postForm.get('moderatorComment')!.value;
    }

    const postData: CreateInterviewRequest = {
      description: this.postForm.get('description')?.value,
      content: this.postForm.get('content')?.value,
      imageNames: uploadedImages,
      status: this.postForm.get('status')?.value,
      userId: Number(this.authService.getUserId()),
      moderatorComment: moderatorComment,
      typeId: this.postForm.get('typeId')!.value,
      company: this.postForm.get('company')!.value,
      interviewDate: this.postForm.get('interviewDate')!.value.toISOString(),
    };
    return postData;
  }

  private mapToUpdateInterviewRequest() {

    const uploadedImages = this.selectedFiles.map((file) => file.name);
    console.log(uploadedImages);
    let moderatorComment = '';
    if (this.canModerate) {
      moderatorComment = this.postForm.get('moderatorComment')!.value;
    }

    const interviewData: UpdateInterviewRequest = {
      interviewId: Number(this.postId),
      userId: this.currentPost!.userId,
      description: this.postForm!.get('description')!.value,
      content: this.postForm.get('content')!.value,
      images: this.mergeImageLists(
          uploadedImages,
          this.existingImages
      ),
      status: this.postForm.get('status')!.value,
      moderatorComment: moderatorComment,
      typeId: this.postForm.get('typeId')!.value,
      company: this.postForm.get('company')!.value,
      interviewDate: this.postForm.get('interviewDate')!.value.toISOString(),
    };
    return interviewData;
  }

  private updateInterview() {
    console.log('Update Post');
    const interviewData: UpdateInterviewRequest = this.mapToUpdateInterviewRequest();
    this.postService.updatePost(interviewData).subscribe({
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
  }
}
