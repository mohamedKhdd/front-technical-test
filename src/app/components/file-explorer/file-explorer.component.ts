import {
	Component,
	OnInit,
	OnDestroy,
	inject,
	signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, finalize } from 'rxjs';

import { FileItem, BreadcrumbItem, ViewMode, SortField, SortOrder } from '../../models/item.model';
import { FileManagerService } from '../../services/file-manager.service';
import { ToastService } from '../../services/toast.service';

import { FileItemComponent } from '../file-item/file-item.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { RenameDialogComponent } from '../rename-dialog/rename-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
	selector: 'ic-file-explorer',
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		FileItemComponent,
		ToolbarComponent,
		RenameDialogComponent,
		ConfirmDialogComponent,
		BreadcrumbComponent,
	],
	templateUrl: './file-explorer.component.html',
	styleUrl: './file-explorer.component.scss',
})
export class FileExplorerComponent implements OnInit, OnDestroy {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private fm = inject(FileManagerService);
	private toast = inject(ToastService);
	private subs = new Subscription();

	// ── State ─────────────────────────────────────────────────────────────────
	currentFolderId = signal<string>('root');
	items = signal<FileItem[]>([]);
	rootItem: BreadcrumbItem = { id: 'root', name: 'Root', folder: true };
	breadcrumb = signal<BreadcrumbItem[]>([
		{ id: 'root', name: 'Root', folder: true },
	]);
	loading = signal(false);
	uploading = signal(false);
	selectedId = signal<string | null>(null);

	sortField = signal<SortField>('name');
	sortOrder = signal<SortOrder>('asc');
	viewMode = signal<ViewMode>('grid');

	renameDialog = signal<{
		visible: boolean;
		name: string;
		item: FileItem | null;
	}>({
		visible: false,
		name: '',
		item: null,
	});
	deleteDialog = signal<{
		visible: boolean;
		name: string;
		item: FileItem | null;
	}>({
		visible: false,
		name: '',
		item: null,
	});

	ngOnInit(): void {
		this.subs.add(
			this.route.paramMap.subscribe(params => {
				const id = params.get('id') ?? 'root';
				this.currentFolderId.set(id);
				this.loadItems(id);
				this.loadBreadcrumb(id);
			})
		);
	}

	ngOnDestroy(): void {
		this.subs.unsubscribe();
	}

	loadItems(folderId: string): void {
		this.loading.set(true);
		this.items.set([]);
		const parentId = folderId === 'root' ? null : folderId;
		this.subs.add(
			this.fm
				.getItems(parentId)
				.pipe(finalize(() => this.loading.set(false)))
				.subscribe({
					next: res => this.items.set(res.items),
					error: () =>
						this.toast.error('Failed to load files. Is the API running?'),
				})
		);
	}

	loadBreadcrumb(folderId: string): void {
		this.subs.add(
			this.fm.getItemPath(folderId).subscribe({
				next: res =>
					this.breadcrumb.set(
						folderId != this.rootItem.id
							? [this.rootItem, ...res.items]
							: res.items
					),
				error: () =>
					this.breadcrumb.set([{ id: 'root', name: 'Root', folder: true }]),
			})
		);
	}

	selectItem(item: FileItem): void {
		this.selectedId.set(item.id);
	}

	clearSelection(): void {
		this.selectedId.set(null);
	}

	openItem(item: FileItem): void {
		if (item.folder) {
			this.router.navigate(['/folder', item.id]);
		} else {
			this.downloadItem(item);
		}
	}

	downloadItem(item: FileItem): void {
		this.subs.add(
			this.fm.downloadItem(item.id).subscribe({
				next: blob => {
					const url = URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = item.name;
					a.click();
					URL.revokeObjectURL(url);
					this.toast.success(`Downloaded "${item.name}"`);
				},
				error: () => this.toast.error(`Failed to download "${item.name}"`),
			})
		);
	}

	uploadFiles(files: File[]): void {
		if (!files.length) return;
		this.uploading.set(true);
		const parentId = this.currentFolderId();
		this.subs.add(
			this.fm
				.uploadFiles(files, parentId)
				.pipe(finalize(() => this.uploading.set(false)))
				.subscribe({
					next: (uploaded: { items: FileItem[] }) => {
						const newItems = Array.isArray(uploaded.items)
							? uploaded.items
							: [uploaded.items];
						this.items.update(curr => [...curr, ...newItems]);
						this.toast.success(
							newItems.length === 1
								? `Uploaded "${newItems[0].name}"`
								: `Uploaded ${newItems.length} files`
						);
					},
					error: err => {
						const code = err?.error?.code;
						if (code === 'DUPLICATE') {
							this.toast.warning('A file with that name already exists here.');
						} else if (code === 'FILESIZE_LIMIT_EXCEEDED') {
							this.toast.warning('File too large. Maximum size is 10 MB.');
						} else {
							this.toast.error('Upload failed. Please try again.');
						}
					},
				})
		);
	}

	createFolder(name: string): void {
		const parentId = this.currentFolderId();
		this.subs.add(
			this.fm.createFolder(name, parentId).subscribe({
				next: (folder: { item: FileItem }) => {
					this.items.update(curr => [...curr, folder.item]);
					this.toast.success(`Folder "${name}" created`);
				},
				error: err => {
					const code = err?.error?.code;
					if (code === 'DUPLICATE_FOLDER') {
						this.toast.warning('A folder with that name already exists here.');
					} else {
						this.toast.error('Failed to create folder.');
					}
				},
			})
		);
	}

	openRenameDialog(item: FileItem): void {
		this.renameDialog.set({ visible: true, name: item.name, item });
	}

	closeRenameDialog(): void {
		this.renameDialog.set({ visible: false, name: '', item: null });
	}

	submitRename(newName: string): void {
		const item = this.renameDialog().item;
		if (!item) return;
		this.closeRenameDialog();
		this.subs.add(
			this.fm.renameItem(item.id, newName).subscribe({
				next: updated => {
					this.items.update(curr =>
						curr.map(i => (i.id === updated.id ? updated : i))
					);
					this.toast.success(`Renamed to "${newName}"`);
				},
				error: () => this.toast.error('Rename failed. Please try again.'),
			})
		);
	}

	// ── Delete ────────────────────────────────────────────────────────────────
	openDeleteDialog(item: FileItem): void {
		this.deleteDialog.set({ visible: true, name: item.name, item });
	}

	closeDeleteDialog(): void {
		this.deleteDialog.set({ visible: false, name: '', item: null });
	}

	submitDelete(): void {
		const item = this.deleteDialog().item;
		if (!item) return;
		this.closeDeleteDialog();
		this.subs.add(
			this.fm.deleteItem(item.id).subscribe({
				next: () => {
					this.items.update(curr => curr.filter(i => i.id !== item.id));
					this.toast.success(`Deleted "${item.name}"`);
				},
				error: () => this.toast.error(`Failed to delete "${item.name}"`),
			})
		);
	}
}
