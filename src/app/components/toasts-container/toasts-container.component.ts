import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { NgTemplateOutlet } from '@angular/common';

@Component({
	selector: 'app-toasts',
	imports: [NgbToastModule, NgTemplateOutlet],
	template: `
		@for (toast of toastService.toasts; track toast) {
			<ngb-toast
				[class]="toast.classname"
				[autohide]="true"
				[delay]="toast.delay || 5000"
				(hidden)="toastService.remove(toast)"
			>
				<ng-template [ngTemplateOutlet]="toast.template"></ng-template>
			</ngb-toast>
		}
	`,
	host: { class: 'toast-container position-fixed top-0 end-0 p-3', style: 'z-index: 1200' },
})
export class ToastsContainer {
	toastService = inject(ToastService);
}
