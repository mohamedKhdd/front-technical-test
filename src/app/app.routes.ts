import { Routes } from '@angular/router';

export const routes: Routes =  [
	{
		path: '',
		redirectTo: 'folder/root',
		pathMatch: 'full',
	},
	{
		path: 'folder/:id',
		loadComponent: () =>
			import('./components/file-explorer/file-explorer.component').then(
				(m) => m.FileExplorerComponent
			),
	},
	{
		path: '**',
		redirectTo: 'folder/root',
	},
];
