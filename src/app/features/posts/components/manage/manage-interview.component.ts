import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CreateInterviewRequest } from '../../models/create-post-request.model';
import { postImage } from '../../models/post-image.model';
import { Post } from '../../models/post.model';
import { PresignImageResponse } from '../../models/presign-image-response.model';
import { UpdateInterviewRequest } from '../../models/update-post-request.model';
import { ImageService } from '../../services/image.service';
import { PostService } from '../../services/post.service';
import { TabviewEditorComponent } from '../tabview-editor/tabview-editor.component';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';

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
    FormsModule,
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
    EditorModule,
    TabviewEditorComponent,
    ButtonModule,
    SkeletonModule,
    FileUploadComponent,
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
  text: string = '';
  loading: boolean = false;

  imageService = inject(ImageService);
  authService = inject(AuthService);
  postService = inject(PostService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  constructor(private fb: FormBuilder) {
    this.postForm = this.fb.group({
      description: ['', [Validators.required]],
      typeId: [null, [Validators.required]],
      company: ['', [Validators.required]],
      interviewDate: [null, [Validators.required]],
      editorContent: this.fb.group({
        details: [''],
        editorial: [''],
      }),
    });

    const userRole = this.authService.getUserRole();
    this.canModerate = userRole === 'MODERATOR' || userRole === 'ADMIN';

    // Handle date timezone conversion
    this.postForm.get('interviewDate')?.valueChanges.subscribe((date) => {
      if (date) {
        const localDate = new Date(date);
        localDate.setMinutes(
          localDate.getMinutes() - localDate.getTimezoneOffset()
        );
        this.postForm
          .get('interviewDate')
          ?.setValue(localDate, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.loadInterviewTypes();
    const state = window.history.state as { post: Post } | undefined;
    console.log('State:', state);

    if (state?.post) {
      this.loading = true;
      this.isEditMode = true;
      this.postId = state.post.interviewId?.toString() || null;
      this.currentPost = state.post;

      // Check if user has permission to edit
      const userId = this.authService.getUserId();
      if (state.post.userId.toString() != userId && !this.canModerate) {
        this.notificationService.showError(
          'You do not have permission to edit this post'
        );
        this.router.navigate(['/dashboard']);
        return;
      }

      this.postForm.patchValue({
        description: state.post.description,
        typeId: state.post.typeId,
        company: state.post.company,
        interviewDate: state.post.interviewDate
          ? new Date(state.post.interviewDate)
          : null,
        editorContent: {
          details: state.post.details || '',
          editorial: state.post.editorial || '',
        },
        status: state.post.status,
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
      this.loading = false;
    } else {
      this.loading = true;
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
                this.notificationService.showError(
                  'You do not have permission to edit this post'
                );
                this.router.navigate(['/dashboard']);
                return;
              }

              this.postForm.patchValue({
                description: post.description,
                typeId: post.typeId,
                company: post.company,
                interviewDate: post.interviewDate
                  ? new Date(post.interviewDate)
                  : null,
                editorContent: {
                  details: post.details || '',
                  editorial: post.editorial || '',
                },
                status: post.status,
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
              this.loading = false;
            }
          },
          error: (error) => {
            this.notificationService.showError(
              'Error loading post: ' + error.message
            );
            this.loading = false;
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
    uploadedImageNames: string[],
    imageList: postImage[]
  ): postImage[] {
    const imageMap = new Map(
      imageList.map((image) => [image.imageName, image.imageId])
    );

    return uploadedImageNames.map((imageName) => ({
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

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  async onSubmit(status: 'DRAFT' | 'PUBLISHED') {
    if (this.postForm.valid) {
      try {
        this.isUploading = true;

        if (this.isEditMode && this.postId) {
          this.updateInterview(status);
        } else {
          this.createInterview(status);
        }
      } catch (error: any) {
        this.notificationService.showError(
          'Error uploading images: ' + error.message
        );
      } finally {
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    }
  }

  private createInterview(status: 'DRAFT' | 'PUBLISHED') {
    console.log('Create Post');
    const postData: CreateInterviewRequest =
      this.mapToCreateInterviewRequest(status);
    console.log(postData);
    this.postService.createPost(postData).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Interview created successfully!');
        this.router.navigate(['/dashboard/my-posts']);
      },
      error: (error) => {
        this.notificationService.showError(
          'Error creating post: ' + error.message
        );
      },
    });
  }

  private mapToCreateInterviewRequest(status: 'DRAFT' | 'PUBLISHED') {
    const uploadedImages = this.selectedFiles.map((file) => file.name);
    console.log(uploadedImages);
    let editorial = '';
    if (this.canModerate) {
      editorial =
        this.postForm.get('editorContent')?.get('editorial')?.value || '';
    }
    console.log(editorial);

    const postData: CreateInterviewRequest = {
      description: this.postForm.get('description')?.value,
      imageNames: uploadedImages,
      status: status,
      userId: Number(this.authService.getUserId()),
      details: this.postForm.get('editorContent')?.get('details')?.value || '',
      editorial: editorial,
      typeId: this.postForm.get('typeId')!.value,
      company: this.postForm.get('company')!.value,
      interviewDate: this.postForm.get('interviewDate')!.value.toISOString(),
    };
    return postData;
  }

  private mapToUpdateInterviewRequest(status: 'DRAFT' | 'PUBLISHED') {
    const uploadedImages = this.selectedFiles.map((file) => file.name);
    console.log(uploadedImages);
    let editorial = '';
    if (this.canModerate) {
      editorial =
        this.postForm.get('editorContent')?.get('editorial')?.value || '';
    }

    const interviewData: UpdateInterviewRequest = {
      interviewId: Number(this.postId),
      userId: this.currentPost!.userId,
      description: this.postForm!.get('description')!.value,
      images: this.mergeImageLists(uploadedImages, this.existingImages),
      status: status,
      details: this.postForm.get('editorContent')?.get('details')?.value || '',
      editorial: editorial,
      typeId: this.postForm.get('typeId')!.value,
      company: this.postForm.get('company')!.value,
      interviewDate: this.postForm.get('interviewDate')!.value.toISOString(),
    };
    return interviewData;
  }

  private updateInterview(status: 'DRAFT' | 'PUBLISHED') {
    console.log('Update Post');
    const interviewData: UpdateInterviewRequest =
      this.mapToUpdateInterviewRequest(status);
    this.postService.updatePost(interviewData).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Interview updated successfully!');
        this.router.navigate(['/dashboard/my-posts']);
      },
      error: (error) => {
        this.notificationService.showError(
          'Error updating post: ' + error.message
        );
      },
    });
  }

  onUploadComplete(uploadedFileKeys: string[]) {
    console.log('Files uploaded:', uploadedFileKeys);
    
    // Handle the uploaded images
    /* if (uploadedFileKeys && uploadedFileKeys.length > 0) {
      if (!this.currentPost) {
        // Initialize currentPost if it doesn't exist
        this.currentPost = {
          images: this.createImagesFromUploaded(uploadedFileKeys)
        } as Post;
      } else if (this.currentPost.images) {
        // If we already have images, merge with uploaded ones
        const mergedImages = this.mergeImageLists(uploadedFileKeys, this.currentPost.images);
        this.currentPost.images = mergedImages;
      } else {
        // Otherwise create fresh images array
        this.currentPost.images = this.createImagesFromUploaded(uploadedFileKeys);
      }
    } */
  }

  onFilesSelected(files: File[]) {
    console.log('Files selected:', files);
    this.selectedFiles = files;

    // Generate previews for each new file
    /* files.forEach((file: File) => {
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
    }); */
  }

  private createImagesFromUploaded(uploadedFileKeys: string[]): postImage[] {
    return uploadedFileKeys.map((imageName) => ({
      imageId: 0,
      imageName,
    }));
  }
}
