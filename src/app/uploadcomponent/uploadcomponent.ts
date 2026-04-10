import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-upload',
  imports: [FormsModule],
  templateUrl: './uploadcomponent.html',
  styleUrls: ['./uploadcomponent.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-12px)' }),
        animate('250ms ease', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class UploadComponent {
  selectedFiles: File[] = [];
  uploadedFiles: string[] = [];
  isDragging = false;
  isUploading = false;
  errorMessage = '';
  userName = '';
  userClass = '';

  private submissionUrl = 'https://shelley-upload-api-production.up.railway.app/api/submission';
  private apiUrl = 'https://shelley-upload-api-production.up.railway.app/api/upload';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  // Add this method and call it inside uploadVideos() after Promise.all resolves
  saveSubmission(): void {
    if (!this.userName && !this.userClass) return;

    this.http
      .post(this.submissionUrl, {
        name: this.userName,
        class: this.userClass,
      })
      .subscribe({
        error: (err) => console.error('Failed to save submission:', err),
      });
    this.userName = '';
    this.userClass = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(Array.from(input.files));
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
    const files = Array.from(event.dataTransfer?.files || []).filter((f) =>
      f.type.startsWith('video/'),
    );
    if (files.length) {
      this.addFiles(files);
    } else {
      this.errorMessage = 'Please drop valid video files.';
    }
  }

  addFiles(files: File[]): void {
    this.selectedFiles = [...this.selectedFiles, ...files];
    this.uploadedFiles = [];
    this.errorMessage = '';
  }

  removeFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  clearFiles(): void {
    this.selectedFiles = [];
    this.uploadedFiles = [];
    this.errorMessage = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  uploadVideos(): void {
    if (!this.selectedFiles.length) return;

    this.isUploading = true;
    this.uploadedFiles = [];
    this.errorMessage = '';

    const uploads = this.selectedFiles.map((file) => {
      const formData = new FormData();
      formData.append('video', file);
      return this.http.post(this.apiUrl, formData);
    });

    forkJoin(uploads).subscribe({
      next: () => {
        this.isUploading = false;
        this.uploadedFiles = this.selectedFiles.map((f) => f.name);
        this.selectedFiles = [];
        this.saveSubmission();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isUploading = false;
        this.errorMessage = err?.error?.message || 'One or more uploads failed. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }
}
