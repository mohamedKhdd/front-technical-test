import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileItem, ItemsResponse, PathResponse } from '../models/item.model';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class FileManagerService {
	private http = inject(HttpClient);

	getItems(parentId?: string | null): Observable<ItemsResponse> {
		const params: Record<string, string> = {};
		if (parentId && parentId !== 'root') {
			params['parentId'] = parentId;
		} else {
			params['parentId'] = 'null';
		}
		return this.http.get<ItemsResponse>(`${API}/items`, { params });
	}

	downloadItem(id: string): Observable<Blob> {
		return this.http.get(`${API}/items/${id}`, { responseType: 'blob' });
	}

	uploadFiles(
		files: File[],
		parentId?: string | null
	): Observable<{ items: FileItem[] }> {
		const formData = new FormData();
		files.forEach(file => formData.append('files', file));
		if (parentId && parentId !== 'root') {
			formData.append('parentId', parentId);
		}
		return this.http.post<{ items: FileItem[] }>(`${API}/items`, formData);
	}

	createFolder(
		name: string,
		parentId?: string | null
	): Observable<{ item: FileItem }> {
		const body: Record<string, unknown> = { name, folder: true };
		if (parentId && parentId !== 'root') {
			body['parentId'] = parentId;
		}
		return this.http.post<{ item: FileItem }>(`${API}/items`, body);
	}

	deleteItem(id: string): Observable<void> {
		return this.http.delete<void>(`${API}/items/${id}`);
	}

	renameItem(id: string, name: string): Observable<FileItem> {
		return this.http.patch<FileItem>(`${API}/items/${id}`, { name });
	}

	getItemPath(id: string): Observable<PathResponse> {
		if (id === 'root') {
			return new Observable(obs => {
				obs.next({ items: [{ id: 'root', name: 'Root', folder: true }] });
				obs.complete();
			});
		}
		return this.http.get<PathResponse>(`${API}/items/${id}/path`);
	}
}
