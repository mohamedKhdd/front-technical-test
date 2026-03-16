import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbItem } from '../../models/item.model';

@Component({
	selector: 'ic-breadcrumb',
	standalone: true,
	imports: [CommonModule, RouterModule],
	templateUrl: './breadcrumb.component.html',
	styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent {
	@Input() items: BreadcrumbItem[] = [];
}
