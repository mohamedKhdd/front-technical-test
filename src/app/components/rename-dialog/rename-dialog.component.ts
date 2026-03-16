import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ic-rename-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rename-dialog.component.html',
  styleUrl: './rename-dialog.component.scss',
})
export class RenameDialogComponent implements OnChanges, AfterViewInit {
  @Input() visible = false;
  @Input() originalName = '';
  @Output() renamed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  currentName = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['originalName']) {
      this.currentName = this.originalName;
    }
    if (changes['visible']?.currentValue === true) {
      // Focus input after it renders
      setTimeout(() => this.nameInput?.nativeElement?.select(), 50);
    }
  }

  ngAfterViewInit(): void {
    if (this.visible) {
      setTimeout(() => this.nameInput?.nativeElement?.select(), 50);
    }
  }

  submit(): void {
    const trimmed = this.currentName.trim();
    if (trimmed && trimmed !== this.originalName) {
      this.renamed.emit(trimmed);
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
