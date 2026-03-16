import {
  Component,
  Output,
  EventEmitter,
  HostListener,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ic-upload-zone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-zone.component.html',
  styleUrl: './upload-zone.component.scss',
})
export class UploadZoneComponent {
  @Output() filesDropped = new EventEmitter<File[]>();

  isDragging = signal(false);
  private dragCounter = 0;

  @HostListener('document:dragenter', ['$event'])
  onDocumentDragEnter(event: DragEvent): void {
    // Only show overlay if dragging files from OS (not internal drag)
    const hasFiles = Array.from(event.dataTransfer?.types ?? []).includes('Files');
    if (!hasFiles) return;
    this.dragCounter++;
    this.isDragging.set(true);
  }

  @HostListener('document:dragleave', ['$event'])
  onDocumentDragLeave(event: DragEvent): void {
    this.dragCounter--;
    if (this.dragCounter <= 0) {
      this.dragCounter = 0;
      this.isDragging.set(false);
    }
  }

  @HostListener('document:drop', ['$event'])
  onDocumentDrop(event: DragEvent): void {
    // Prevent default browser navigation behavior
    event.preventDefault();
    this.dragCounter = 0;
    this.isDragging.set(false);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  onDragLeave(event: DragEvent): void {
    // Handled by document listener
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter = 0;
    this.isDragging.set(false);

    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length) {
      this.filesDropped.emit(files);
    }
  }
}
