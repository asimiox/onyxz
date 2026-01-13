
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-24 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="min-w-[300px] p-4 bg-black text-white pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-right fade-in shadow-2xl border-l-4"
          [class.border-white]="toast.type === 'success'"
          [class.border-gray-500]="toast.type === 'error'"
          [class.border-gray-700]="toast.type === 'info'"
        >
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <span class="font-bold text-xs uppercase tracking-widest">{{ toast.type }}</span>
              <span class="font-medium text-sm">{{ toast.message }}</span>
            </div>
            <button (click)="toastService.remove(toast.id)" class="ml-4 hover:text-gray-300 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
