
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-white border-t border-gray-100 pt-16 pb-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Optimized Grid for Mobile (Stack) and Desktop (3 Columns) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          
          <!-- Brand -->
          <div class="flex flex-col items-start">
             @if (settingsService.logo()) {
                <a routerLink="/" class="block mb-6">
                   <img [src]="settingsService.logo()" class="h-12 w-auto object-contain" alt="ONYX">
                </a>
             } @else {
                <a routerLink="/" class="font-serif text-2xl font-bold text-slate-900 block mb-4">ONYX</a>
             }
             
             <p class="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
               Premium urban fashion designed for those who appreciate quality, style, and substance.
             </p>
             <div class="flex space-x-4">
                <a href="https://instagram.com/theasimnawaz" target="_blank" class="text-slate-400 hover:text-pink-600 transition-colors p-1">
                  <span class="sr-only">Instagram</span>
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.153 1.772c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.315 2zm-2.008 2H12c2.614 0 2.938.011 3.962.058 1.002.045 1.546.2 1.913.342.484.188.828.412 1.19.774.362.362.586.706.774 1.19.143.367.298.91.342 1.913.047 1.024.058 1.348.058 3.963 0 2.614-.011 2.938-.058 3.962-.045 1.002-.2 1.546-.342 1.913-.188.484-.412.828-.774 1.19.362.362-.706.586-1.19.774.367-.143.91-.298 1.913-.342 1.024-.047 1.348-.058 3.963-.058zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.35-3.224a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" clip-rule="evenodd"/></svg>
                </a>
                <a href="https://wa.me/923228033682" target="_blank" class="text-slate-400 hover:text-green-600 transition-colors p-1">
                  <span class="sr-only">WhatsApp</span>
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </a>
             </div>
          </div>

          <!-- Collections (Replaced Quick Links, removed Company links) -->
          <div>
            <h3 class="font-bold text-slate-900 mb-6">Collections</h3>
            <ul class="space-y-3">
               <li><a routerLink="/shop" [queryParams]="{category: 'Women'}" class="text-sm text-slate-500 hover:text-blue-600 transition-colors">Women</a></li>
               <li><a routerLink="/shop" [queryParams]="{category: 'Men'}" class="text-sm text-slate-500 hover:text-blue-600 transition-colors">Men</a></li>
               <li><a routerLink="/shop" [queryParams]="{category: 'Shoes'}" class="text-sm text-slate-500 hover:text-blue-600 transition-colors">Shoes</a></li>
               <li><a routerLink="/shop" [queryParams]="{category: 'Accessories'}" class="text-sm text-slate-500 hover:text-blue-600 transition-colors">Accessories</a></li>
               <li><a routerLink="/shop" class="text-sm text-slate-500 hover:text-blue-600 transition-colors">New Arrivals</a></li>
            </ul>
          </div>

          <!-- Contact (Layout updated for better stacking) -->
          <div>
            <h3 class="font-bold text-slate-900 mb-6">Contact Us</h3>
            <ul class="space-y-4">
               <li class="flex items-center">
                  <svg class="w-5 h-5 text-slate-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <a href="https://wa.me/923228033682" target="_blank" class="text-sm text-slate-500 font-bold hover:text-green-600 transition-colors">+92 322 8033682</a>
               </li>
               <li class="flex items-center">
                  <svg class="w-5 h-5 text-slate-400 mr-3 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.153 1.772c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.315 2zm-2.008 2H12c2.614 0 2.938.011 3.962.058 1.002.045 1.546.2 1.913.342.484.188.828.412 1.19.774.362.362.586.706.774 1.19.143.367.298.91.342 1.913.047 1.024.058 1.348.058 3.963 0 2.614-.011 2.938-.058 3.962-.045 1.002-.2 1.546-.342 1.913-.188.484-.412.828-.774 1.19.362.362-.706.586-1.19.774.367-.143.91-.298 1.913-.342 1.024-.047 1.348-.058 3.963-.058zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.35-3.224a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" clip-rule="evenodd"/></svg>
                  <a href="https://instagram.com/theasimnawaz" target="_blank" class="text-sm text-slate-500 hover:text-pink-600 transition-colors">@theasimnawaz</a>
               </li>
            </ul>
          </div>

        </div>
        
        <div class="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
           <div class="flex flex-col md:flex-row items-center gap-1 md:gap-4">
             <p class="text-sm text-slate-400">&copy; 2026 ONYX Fashion.</p>
             <p class="text-sm font-bold text-slate-900">Made by Asim Nawaz</p>
           </div>
           <div class="flex space-x-4 mt-4 md:mt-0">
              <div class="h-6 w-10 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">VISA</div>
              <div class="h-6 w-10 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">MC</div>
              <div class="h-6 w-10 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">COD</div>
           </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
   settingsService = inject(SettingsService);
}
