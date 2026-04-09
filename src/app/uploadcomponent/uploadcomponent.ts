import { Component } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  standalone: true,
  templateUrl: './uploadcomponent.html',
  styleUrls: ['./uploadcomponent.scss'],
})
export class UploadComponent {
  selectedFile: File | null = null;
  isDragging = false;
  isUploading = false;
  uploadProgress = 0;
  uploadSuccess = false;
  errorMessage = '';

  private apiUrl = 'https://shelley-upload-api.up.railway.app/api/upload';

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.setFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('video/')) {
      this.setFile(file);
    } else {
      this.errorMessage = 'Please drop a valid video file.';
    }
  }

  setFile(file: File): void {
    this.selectedFile = file;
    this.uploadSuccess = false;
    this.errorMessage = '';
    this.uploadProgress = 0;
  }

  clearFile(): void {
    this.selectedFile = null;
    this.uploadSuccess = false;
    this.errorMessage = '';
    this.uploadProgress = 0;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  uploadVideo(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadSuccess = false;
    this.errorMessage = '';
    this.uploadProgress = 0;

    const formData = new FormData();
    formData.append('video', this.selectedFile);

    this.http
      .post(this.apiUrl, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.Sent) {
            // Request has been sent — show some progress immediately
            this.uploadProgress = 10;
          } else if (event.type === HttpEventType.UploadProgress && event.total) {
            // Map real progress between 10–90 so it never looks stuck at 100 before server responds
            const realProgress = Math.round((event.loaded / event.total) * 80);
            this.uploadProgress = 10 + realProgress;
          } else if (event.type === HttpEventType.ResponseHeader) {
            // Server is responding — almost done
            this.uploadProgress = 95;
          } else if (event.type === HttpEventType.Response) {
            // Fully done
            this.uploadProgress = 100;
            setTimeout(() => {
              this.isUploading = false;
              this.uploadSuccess = true;
              this.selectedFile = null;
              this.uploadProgress = 0;
            }, 600); // brief pause so user sees 100% before it clears
          }
        },
        error: (err) => {
          this.isUploading = false;
          this.errorMessage = err?.error?.message || 'Upload failed. Please try again.';
        },
      });
  }
}
