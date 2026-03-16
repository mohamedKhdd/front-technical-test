import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SortField, SortOrder, ViewMode } from '../../models/item.model';

@Component({
  selector: 'ic-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() newFolderRequested = new EventEmitter<string>();
	@Input() sortField: SortField = 'name';
	@Input() sortOrder: SortOrder = 'asc';
	@Input() viewMode: ViewMode = 'grid';
	@Output() sortFieldChange = new EventEmitter<SortField>();
	@Output() sortOrderChange = new EventEmitter<SortOrder>();
	@Output() viewModeChange = new EventEmitter<ViewMode>();
	@Output() dropOnFolder = new EventEmitter<{ targetId: string; draggedId: string }>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('newFolderInput') newFolderInputRef!: ElementRef<HTMLInputElement>;

	showNewFolderInput = false;
	newFolderName = '';


  triggerUpload(): void {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.filesSelected.emit(Array.from(input.files));
    }
  }

	startNewFolder(): void {
		this.showNewFolderInput = true;
		this.newFolderName = '';
		setTimeout(() => this.newFolderInputRef?.nativeElement?.focus(), 50);
	}

	submitNewFolder(): void {
		const name = this.newFolderName.trim();
		if (name) {
			this.newFolderRequested.emit(name);
		}
		this.cancelNewFolder();
	}

	cancelNewFolder(): void {
		this.showNewFolderInput = false;
		this.newFolderName = '';
	}

	onSortFieldChange(event: Event): void {
		const select = event.target as HTMLSelectElement;
		this.sortFieldChange.emit(select.value as SortField);
	}

	toggleSortOrder(): void {
		this.sortOrderChange.emit(this.sortOrder === 'asc' ? 'desc' : 'asc');
	}

}
