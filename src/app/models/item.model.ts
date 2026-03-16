export interface FileItem {
  id: string;
  parentId: string | null;
  name: string;
  folder: boolean;
  creation: string;
  modification: string;
  filePath?: string;
  mimeType?: string;
  size?: number;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  folder: boolean;
}

export interface ItemsResponse {
  items: FileItem[];
}

export interface PathResponse {
  items: BreadcrumbItem[];
}

export interface ApiError {
  code: string;
  desc: string;
}

export type SortField = 'name' | 'modification' | 'size';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';
