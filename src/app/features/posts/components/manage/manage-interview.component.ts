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
  existingImages: postImage[] = [];
  isEditMode: boolean = false;
  postId: string | null = null;
  currentPost: Post | null = null;
  canModerate: boolean = false;
  interviewTypes: any[] = [];
  text: string = '';
  loading: boolean = false;
  newlyUploadedImages: string[] = [];

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
        console.log('Loaded existing images from state:', JSON.stringify(this.existingImages));
        // Log individual image details
        this.existingImages.forEach((img, index) => {
          console.log(`Image ${index} details:`, img);
          console.log(`Image ${index} URL:`, this.getImageUrl(img.imageName));
        });
        this.prepareExistingFilesForUpload(state.post.images);
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
                console.log('Loaded existing images from API:', JSON.stringify(this.existingImages));
                // Log individual image details
                this.existingImages.forEach((img, index) => {
                  console.log(`Image ${index} details:`, img);
                  console.log(`Image ${index} URL:`, this.getImageUrl(img.imageName));
                });
                this.prepareExistingFilesForUpload(post.images);
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

  /**
   * Called when files are selected using the file upload component
   */
  onFilesSelected(files: File[]) {
    console.log('Files selected:', files);
    this.selectedFiles = files;
  }

  /**
   * Called when file upload completes
   */
  onUploadComplete(uploadedFileKeys: string[]) {
    console.log('Files uploaded:', uploadedFileKeys);
    
    // Update our local tracking of files
    this.isUploading = false;
    
    // Store the newly uploaded file keys
    this.newlyUploadedImages = [...this.newlyUploadedImages, ...uploadedFileKeys];
    
    // When updating a post, the existingImages are only those from the backend
    // We don't modify existingImages here, they will be merged during form submission
    
    // Show notification of successful upload
    this.notificationService.showSuccess(`Successfully uploaded ${uploadedFileKeys.length} image(s)`);
  }

  /**
   * Creates image objects from uploaded file keys
   */
  private createImagesFromUploaded(uploadedFileKeys: string[]): postImage[] {
    return uploadedFileKeys.map((imageName) => ({
      imageId: 0,
      imageName,
    }));
  }

  /**
   * Merges newly uploaded image names with existing images
   * @param uploadedImageNames Array of image names from the uploaded files
   * @param existingImages Array of existing postImage objects
   * @returns Array of postImage objects
   */
  mergeImageLists(
    uploadedImageNames: string[],
    existingImages: postImage[]
  ): postImage[] {
    // Get the existing image names
    const existingImageNames = existingImages.map((img) => img.imageName);
    
    // Create new postImage objects for any newly uploaded images
    const newImages = uploadedImageNames
      .filter((name) => !existingImageNames.includes(name))
      .map((name) => ({
        imageId: 0, // New images have an ID of 0
        imageName: name,
      }));
    
    // Combine existing images with new ones
    return [...existingImages, ...newImages];
  }

  /**
   * Prepares existing images as File objects for the file upload component
   */
  private prepareExistingFilesForUpload(images: postImage[]): void {
    // For existing images, we need to create File objects that the file upload component can use
    // Since we can't easily reconstruct the original files, we'll create placeholders
    // that represent the existing images
    
    // First, clear any previously selected files
    this.selectedFiles = [];
    
    // Show a notification to the user that existing images are being loaded
    if (images.length > 0) {
      this.notificationService.showSuccess(`Loading ${images.length} existing image(s)`);
    }

    // Note: We're not setting the selectedFiles here because the FileUploadComponent
    // doesn't have an input to accept already uploaded files
    // The existing images will be saved from this.existingImages when the form is submitted
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

  /**
   * Resets the image tracking state
   */
  resetImageState(): void {
    this.newlyUploadedImages = [];
    this.selectedFiles = [];
    // We don't reset existingImages as those come from the backend
  }

  onCancel(): void {
    this.resetImageState();
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
        this.resetImageState();
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
    // For new posts, get the file names from newlyUploadedImages
    console.log('Create with uploaded images:', this.newlyUploadedImages);
    
    let editorial = '';
    if (this.canModerate) {
      editorial =
        this.postForm.get('editorContent')?.get('editorial')?.value || '';
    }

    const postData: CreateInterviewRequest = {
      description: this.postForm.get('description')?.value,
      imageNames: this.newlyUploadedImages,
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
    // When updating, we need to combine backend images with newly uploaded images
    const existingImageNames = this.existingImages.map(img => img.imageName);
    
    // Combine both sets of images, eliminating duplicates
    const allImageNames = [...new Set([...this.newlyUploadedImages, ...existingImageNames])];
    
    console.log('Update with images:', allImageNames);
    
    let editorial = '';
    if (this.canModerate) {
      editorial =
        this.postForm.get('editorContent')?.get('editorial')?.value || '';
    }

    const interviewData: UpdateInterviewRequest = {
      interviewId: Number(this.postId),
      userId: this.currentPost!.userId,
      description: this.postForm!.get('description')!.value,
      images: this.mergeImageLists(allImageNames, this.existingImages),
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
        this.resetImageState();
        this.router.navigate(['/dashboard/my-posts']);
      },
      error: (error) => {
        this.notificationService.showError(
          'Error updating post: ' + error.message
        );
      },
    });
  }

  /**
   * Gets a display name for an image (removes userId/ prefix)
   * @param imageName Full image name/path
   * @returns Simplified name for display
   */
  getDisplayName(imageName: string): string {
    // Extract the filename from the path (remove userId/ prefix if present)
    let displayName = imageName;
    
    // If the name contains a slash, extract just the filename part
    if (displayName.includes('/')) {
      displayName = displayName.split('/').pop() || displayName;
    }
    
    // Limit the length for display
    if (displayName.length > 20) {
      displayName = displayName.substring(0, 17) + '...';
    }
    
    return displayName;
  }

  /**
   * Gets the image URL for display
   * @param imageName Name of the image
   * @returns Complete URL for the image
   */
  getImageUrl(imageName: string): string {
    const imageUrl = 'https://supun-init.s3.amazonaws.com/' + imageName;
    // console.log('Constructed image URL:', imageUrl);
    return imageUrl;
  }

  /**
   * Removes an existing image
   * @param index Index of the image to remove
   */
  removeExistingImage(index: number): void {
    if (index >= 0 && index < this.existingImages.length) {
      // Store the name of the removed image for logging
      const removedImageName = this.existingImages[index].imageName;
      
      // Remove the image from the existing images array
      this.existingImages.splice(index, 1);
      
      // Show a notification
      this.notificationService.showSuccess(`Removed image ${this.getDisplayName(removedImageName)}`);
    }
  }

  /**
   * Handles image loading errors
   * @param event The error event
   */
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    const originalSrc = imgElement.src;
    console.error('Failed to load image:', originalSrc);
    
    // Extract the image name from the URL for better debugging
    let imageName = originalSrc.split('/').pop() || 'unknown';
    console.error(`Image "${imageName}" failed to load from URL: ${originalSrc}`);
    
    // Instead of using a placeholder image, use a data URI for a simple placeholder
    // This is a small gray square with an "X" in it
    imgElement.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Crect%20fill%3D%22%23ddd%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EX%3C%2Ftext%3E%3C%2Fsvg%3E';
    imgElement.alt = 'Image not available';
    
    // Add a title for tooltip on hover with the original image name
    imgElement.title = `Failed to load: ${imageName}`;
    
    // Show a notification with more specific information
    this.notificationService.showError(`Failed to load image: ${imageName}. The image may be unavailable or deleted.`);
  }
}
