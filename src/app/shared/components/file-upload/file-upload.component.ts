import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';
import { ImageService } from '../../../features/posts/services/image.service';
import { Observable, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PresignImageResponse } from '../../../features/posts/models/presign-image-response.model';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadModule,
    ToastModule,
    ButtonModule,
    ProgressBarModule,
    BadgeModule
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Input() url: string = 'https://www.primefaces.org/cdn/api/upload.php';
  @Input() maxSize: number = 5000000; // 5MB
  @Input() useCustomUpload: boolean = false; // If true, uses the custom upload method
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() fileUploaded = new EventEmitter<any>();
  @Output() uploadProgress = new EventEmitter<number>();
  @Output() uploadComplete = new EventEmitter<string[]>();
  
  totalSize: string = '0';
  totalSizePercent: number = 0;
  selectedFiles: File[] = []; // Store selected files
  uploadState: 'idle' | 'uploading' | 'completed' | 'error' = 'idle';
  uploadedFiles: Set<string> = new Set(); // Track files that have been uploaded
  
  @ViewChild('fileUpload') fileUploadComponent!: FileUpload;
  
  private imageService = inject(ImageService);
  private http = inject(HttpClient);
  
  constructor(private messageService: MessageService) {
    // Initialize the uploadedFiles Set
    this.uploadedFiles = new Set<string>();
  }

  onSelectedFiles(event: any): void {
    // The event.files property might contain a FileList instead of an Array
    // Convert to array if needed
    const filesArray = event.files ? (Array.isArray(event.files) ? event.files : Array.from(event.files)) : [];
    
    // Store selected files for later upload
    this.selectedFiles = filesArray;
    
    // Only set upload state to idle if there are new files that haven't been uploaded yet
    const hasNewFiles = filesArray.some((file: File) => !this.uploadedFiles.has(file.name));
    if (hasNewFiles) {
      this.uploadState = 'idle';
    }
    
    this.calculateTotalSize(filesArray);
    this.filesSelected.emit(filesArray);
  }
  
  /**
   * Custom method to upload files using ImageService
   * @param files Files to upload
   */
  uploadSelectedFiles(files: File[]): void {
    if (!files || files.length === 0) return;
    
    // Filter out files that have already been uploaded
    const filesToUpload = files.filter((file: File) => !this.uploadedFiles.has(file.name));
    
    if (filesToUpload.length === 0) {
      this.messageService.add({ 
        severity: 'info', 
        summary: 'Info', 
        detail: 'All files have already been uploaded' 
      });
      return;
    }
    
    // Set upload state to uploading
    this.uploadState = 'uploading';

    const nameList = filesToUpload.map((file: File) => file.name);
    this.uploadProgress.emit(10); // Start progress
    
    this.imageService.getPresignedUploadUrl(nameList).subscribe({
      next: (response) => {
        this.uploadProgress.emit(30); // URLs obtained
        
        // Create an array of observables for each file upload
        const uploadObservables: Observable<any>[] = [];
        const uploadedFileKeys: string[] = [];
        
        filesToUpload.forEach((file: File) => {
          const presignedUrl = response.find((res: PresignImageResponse) => res.key === file.name);
          
          if (presignedUrl) {
            uploadedFileKeys.push(presignedUrl.key);
            uploadObservables.push(this.imageService.uploadFile(file, presignedUrl.url));
          }
        });
        
        // If no files to upload, emit complete
        if (uploadObservables.length === 0) {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'No files to upload' 
          });
          this.uploadProgress.emit(0);
          this.uploadState = 'error';
          return;
        }
        
        // Use forkJoin to wait for all uploads to complete
        forkJoin(uploadObservables).subscribe({
          next: (results) => {
            this.uploadProgress.emit(100); // Complete
            this.uploadState = 'completed';
            
            // Mark files as uploaded
            filesToUpload.forEach((file: File) => {
              this.uploadedFiles.add(file.name);
            });
            
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: `${results.length} files uploaded successfully` 
            });
            
            this.uploadComplete.emit(uploadedFileKeys);
            
            // Also emit the standard upload event for backward compatibility
            this.fileUploaded.emit(results);
          },
          error: (error) => {
            this.uploadProgress.emit(0);
            this.uploadState = 'error';
            
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: 'File upload failed: ' + (error.message || 'Unknown error') 
            });
            
            console.error('File upload failed:', error);
          }
        });
      },
      error: (error) => {
        this.uploadProgress.emit(0);
        this.uploadState = 'error';
        
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to get upload URLs: ' + (error.message || 'Unknown error') 
        });
        
        console.error('Failed to get upload URLs:', error);
      }
    });
  }
  
  onTemplatedUpload(): void {
    console.log('Files uploaded successfully');
    
    // Mark all current files as uploaded
    if (this.fileUploadComponent && this.fileUploadComponent.files) {
      this.fileUploadComponent.files.forEach((file: any) => {
        if (file.name) {
          this.uploadedFiles.add(file.name);
        }
      });
    }
    
    this.uploadState = 'completed';
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Files uploaded successfully' });
    this.fileUploaded.emit();
  }

  onRemoveTemplatingFile(event: Event, file: any, removeFileCallback: Function, index: number): void {
    // Prevent the default behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Remove from uploaded files tracking
    if (file && file.name) {
      this.uploadedFiles.delete(file.name);
    }
    
    // Call the PrimeNG callback to remove the file
    if (typeof removeFileCallback === 'function') {
      // Pass the event as the first parameter, followed by the index
      removeFileCallback(event, index);
    }
    
    // Update the selectedFiles array to remove the file
    if (this.selectedFiles.length > index) {
      this.selectedFiles.splice(index, 1);
    }
    
    // Recalculate total size after file removal
    if (this.fileUploadComponent && this.fileUploadComponent.files) {
      this.calculateTotalSize(this.fileUploadComponent.files as File[]);
    }
  }

  calculateTotalSize(files: File[]): void {
    let totalBytes = 0;
    if (files && Array.isArray(files)) {
      files.forEach((file: File) => {
        totalBytes += file.size || 0;
      });
    }
    
    this.totalSize = this.formatSize(totalBytes);
    this.totalSizePercent = (totalBytes / this.maxSize) * 100;
  }

  recalculateTotalSize(getFiles: Function): void {
    if (typeof getFiles === 'function') {
      const files = getFiles();
      const filesArray = files ? (Array.isArray(files) ? files : Array.from(files)) : [];
      this.calculateTotalSize(filesArray as File[]);
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Helper method to check if a file has been uploaded
   * This is used in the template to avoid calling Set.has directly
   */
  isFileUploaded(fileName: string): boolean {
    return this.uploadedFiles.has(fileName);
  }
  
  /**
   * Clears the uploaded files tracking state
   * This can be called to reset the component state if needed
   */
  clearUploadedFiles(): void {
    this.uploadedFiles.clear();
    this.uploadState = 'idle';
  }
  
  choose(event: Event, chooseCallback: Function): void {
    if (typeof chooseCallback === 'function') {
      chooseCallback();
    }
    event.stopPropagation();
  }
  
  uploadEvent(uploadCallback: Function): void {
    console.log('upload');
    if (typeof uploadCallback === 'function') {
      uploadCallback();
    }
    console.log('upload', this.selectedFiles);
    // Handle custom upload on upload button click
    if (this.useCustomUpload && this.selectedFiles.length > 0) {
      this.uploadSelectedFiles(this.selectedFiles);
    }
  }
}
