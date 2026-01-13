
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-black font-serif">Categories</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         <!-- Add New Category -->
         <div class="bg-white border border-gray-200 p-6 rounded-sm shadow-sm h-fit">
            <h3 class="font-bold text-lg mb-4">Add Category</h3>
            <div class="space-y-4">
               <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Category Name</label>
                  <input type="text" [(ngModel)]="newCategoryName" placeholder="e.g. Winter Wear" class="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:ring-black bg-white text-black placeholder-black">
               </div>
               
               <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Cover Image (URL or Upload)</label>
                  <div class="flex gap-2 items-center">
                     <div class="flex-1">
                        @if (newCategoryMode() === 'url') {
                           <input type="text" [(ngModel)]="newCategoryImage" placeholder="https://..." class="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:ring-black bg-white text-black placeholder-black">
                        } @else {
                           <input type="file" (change)="onFileSelected($event, 'new')" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200">
                        }
                     </div>
                     <button (click)="toggleNewMode()" class="text-xs font-bold uppercase underline text-gray-500 hover:text-black shrink-0">
                        {{ newCategoryMode() === 'url' ? 'Use Upload' : 'Use URL' }}
                     </button>
                  </div>
                  @if(newCategoryImage) {
                     <div class="mt-2">
                        <img [src]="newCategoryImage" class="h-20 w-20 object-cover border border-gray-200 rounded">
                     </div>
                  }
               </div>

               <button (click)="addCategory()" [disabled]="!newCategoryName.trim() || !newCategoryImage.trim()" class="w-full bg-black text-white px-6 py-3 font-bold uppercase tracking-wider text-xs hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  Add Category
               </button>
            </div>
         </div>

         <!-- Category List -->
         <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
               <thead class="bg-gray-50">
                  <tr>
                     <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest w-16">Image</th>
                     <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
                     <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-gray-200">
                  @for (cat of categoriesList(); track cat.name) {
                     <tr class="hover:bg-gray-50 group">
                        <td class="px-6 py-4">
                           @if (editingCategory() === cat.name) {
                              <div class="flex flex-col gap-2">
                                 <img [src]="editImage || cat.image" class="h-10 w-10 object-cover rounded border border-gray-200">
                                 <input type="file" (change)="onFileSelected($event, 'edit')" accept="image/*" class="text-[10px]">
                              </div>
                           } @else {
                              <img [src]="cat.image" class="h-10 w-10 object-cover rounded border border-gray-200" [alt]="cat.name">
                           }
                        </td>
                        <td class="px-6 py-4">
                           @if (editingCategory() === cat.name) {
                              <input type="text" [(ngModel)]="editName" class="border border-gray-300 px-2 py-1 text-sm w-full bg-white text-black placeholder-black">
                           } @else {
                              <span class="text-sm font-bold text-black">{{ cat.name }}</span>
                           }
                        </td>
                        <td class="px-6 py-4 text-right space-x-2">
                           @if (editingCategory() === cat.name) {
                              <div class="flex flex-col gap-1 items-end">
                                 <button (click)="saveEdit(cat.name)" class="text-green-600 font-bold text-xs uppercase hover:underline">Save</button>
                                 <button (click)="cancelEdit()" class="text-gray-400 font-bold text-xs uppercase hover:underline">Cancel</button>
                              </div>
                           } @else {
                              <button (click)="startEdit(cat.name, cat.image)" class="text-blue-600 font-bold text-xs uppercase hover:underline">Edit</button>
                              <button (click)="deleteCategory(cat.name)" class="text-red-500 font-bold text-xs uppercase hover:underline">Delete</button>
                           }
                        </td>
                     </tr>
                  }
               </tbody>
            </table>
         </div>
      </div>
      
      <div class="mt-8 bg-red-50 p-4 border border-red-100 rounded text-sm text-red-800">
         <strong>Warning:</strong> Deleting a category will permanently delete ALL products associated with it.
      </div>
    </div>
  `
})
export class AdminCategoriesComponent {
  productService = inject(ProductService);
  toastService = inject(ToastService);

  newCategoryName = '';
  newCategoryImage = '';
  newCategoryMode = signal<'url' | 'file'>('url');

  editingCategory = signal<string | null>(null);
  editName = '';
  editImage = '';

  // Use a computed signal for the list to ensure stable rendering and change detection
  categoriesList = computed(() => this.productService.getCategoryConfigs()());

  toggleNewMode() {
    this.newCategoryMode.update(m => m === 'url' ? 'file' : 'url');
    this.newCategoryImage = '';
  }

  onFileSelected(event: any, context: 'new' | 'edit') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (context === 'new') {
           this.newCategoryImage = result;
        } else {
           this.editImage = result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  addCategory() {
    if (!this.newCategoryName.trim() || !this.newCategoryImage.trim()) {
       this.toastService.show('Name and Image are required', 'error');
       return;
    }
    this.productService.addCategory(this.newCategoryName.trim(), this.newCategoryImage);
    this.newCategoryName = '';
    this.newCategoryImage = '';
    this.toastService.show('Category added successfully', 'success');
  }

  startEdit(name: string, image: string) {
    this.editingCategory.set(name);
    this.editName = name;
    this.editImage = image;
  }

  cancelEdit() {
    this.editingCategory.set(null);
    this.editName = '';
    this.editImage = '';
  }

  saveEdit(oldName: string) {
    if (!this.editName.trim()) {
       this.cancelEdit();
       return;
    }
    this.productService.updateCategory(oldName, this.editName.trim(), this.editImage);
    this.editingCategory.set(null);
    this.toastService.show('Category updated successfully', 'success');
  }

  deleteCategory(name: string) {
    if (confirm(`Are you sure? This will delete the category "${name}" and ALL its products!`)) {
       this.productService.deleteCategory(name);
       this.toastService.show('Category and products deleted', 'success');
    }
  }
}
