import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileItem } from '../../models/item.model';

@Component({
  selector: 'ic-file-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'file-item.component.html',
  styleUrl: 'file-item.component.scss' ,
})
export class FileItemComponent {
  @Input({ required: true }) item!: FileItem;
  @Input() selected = false;
  @Output() clicked = new EventEmitter<FileItem>();
  @Output() dblClicked = new EventEmitter<FileItem>();
  @Output() downloadRequested = new EventEmitter<FileItem>();
	@Output() renameRequested = new EventEmitter<FileItem>();
	@Output() deleteRequested = new EventEmitter<FileItem>();

  contextMenuVisible = false;
  isDragOver = false;

  private el = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.contextMenuVisible = false;
    }
  }

  handleClick(event: MouseEvent): void {
    event.stopPropagation();
    this.contextMenuVisible = false;
    this.clicked.emit(this.item);
  }

  handleDblClick(): void {
    this.dblClicked.emit(this.item);
  }

  handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuVisible = true;
  }

  closeMenu(): void {
    this.contextMenuVisible = false;
  }

  onDownload(): void {
    this.downloadRequested.emit(this.item);
  }

	onRename(): void {
		this.renameRequested.emit(this.item);
	}

	onDelete(): void {
		this.deleteRequested.emit(this.item);
	}
  getIcon(): string {
    if (this.item.folder) return '📁';
    const ext = this.getExtension().toLowerCase();
    const map: Record<string, string> = {
      pdf: '📕', doc: '📝', docx: '📝', txt: '📄', md: '📄',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🎨', webp: '🖼️',
      mp4: '🎬', mov: '🎬', avi: '🎬', mkv: '🎬',
      mp3: '🎵', wav: '🎵', flac: '🎵',
      zip: '📦', tar: '📦', gz: '📦', rar: '📦',
      js: '🟨', ts: '🔷', html: '🌐', css: '🎨', scss: '🎨',
      json: '📋', xml: '📋', csv: '📊',
      xls: '📊', xlsx: '📊',
      ppt: '📊', pptx: '📊',
      exe: '⚙️', sh: '⚙️',
    };
    return map[ext] ?? '📄';
  }

  getExtension(): string {
    const parts = this.item.name.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
