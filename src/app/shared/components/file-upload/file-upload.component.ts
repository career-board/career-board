import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';

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
  @Input() maxSize: number = 1000000; // 1MB
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() fileUploaded = new EventEmitter<any>();
  
  totalSize: string = '0';
  totalSizePercent: number = 0;
  
  constructor(private messageService: MessageService) {}

  onSelectedFiles(event: any): void {
    // The event.files property might contain a FileList instead of an Array
    // Convert to array if needed
    const filesArray = event.files ? (Array.isArray(event.files) ? event.files : Array.from(event.files)) : [];
    this.calculateTotalSize(filesArray);
    this.filesSelected.emit(filesArray);
  }
  
  onTemplatedUpload(): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Files uploaded successfully' });
    this.fileUploaded.emit();
  }

  onRemoveTemplatingFile(event: Event, file: any, removeFileCallback: Function, index: number): void {
    if (typeof removeFileCallback === 'function') {
      removeFileCallback(index);
      this.recalculateTotalSize(removeFileCallback);
    }
    event.stopPropagation();
  }

  calculateTotalSize(files: any[]): void {
    let totalBytes = 0;
    if (files && Array.isArray(files)) {
      files.forEach(file => {
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
      this.calculateTotalSize(filesArray);
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  choose(event: Event, chooseCallback: Function): void {
    if (typeof chooseCallback === 'function') {
      chooseCallback();
    }
    event.stopPropagation();
  }
  
  uploadEvent(uploadCallback: Function): void {
    if (typeof uploadCallback === 'function') {
      uploadCallback();
    }
  }
}
