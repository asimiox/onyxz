
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lookbook',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="bg-white min-h-screen pt-24 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
         <span class="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] block mb-4">Editorial</span>
         <h1 class="font-serif text-5xl md:text-7xl font-bold text-black mb-8">Spring / Summer <br/> 2026</h1>
         <p class="max-w-2xl mx-auto text-gray-500 mb-16 font-light leading-relaxed">
           A collection defined by minimalist silhouettes, organic textures, and a monochrome palette. 
           Explore the styles that shape the season.
         </p>

         <div class="space-y-24">
            <!-- Look 1 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div class="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                  <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Look 1">
               </div>
               <div class="text-left md:pl-12">
                  <span class="text-xs font-bold text-black uppercase tracking-widest border-b border-black pb-1 mb-6 inline-block">Look 01</span>
                  <h3 class="font-serif text-4xl text-black mb-4">Urban Texture</h3>
                  <p class="text-gray-500 mb-8 font-light">Layering textures creates depth in a monochrome outfit. Pair chunky knits with sleek leather for a modern city look.</p>
                  <a routerLink="/shop" class="text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">Shop The Look &rarr;</a>
               </div>
            </div>

            <!-- Look 2 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div class="order-2 md:order-1 text-left md:pr-12">
                  <span class="text-xs font-bold text-black uppercase tracking-widest border-b border-black pb-1 mb-6 inline-block">Look 02</span>
                  <h3 class="font-serif text-4xl text-black mb-4">Fluid Motion</h3>
                  <p class="text-gray-500 mb-8 font-light">Soft tailoring meets athletic ease. Oversized blazers thrown over silk slip dresses define the new casual.</p>
                  <a routerLink="/shop" class="text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">Shop The Look &rarr;</a>
               </div>
               <div class="order-1 md:order-2 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                  <img src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1200&auto=format&fit=crop" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Look 2">
               </div>
            </div>

            <!-- Look 3 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div class="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                  <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Look 3">
               </div>
               <div class="text-left md:pl-12">
                  <span class="text-xs font-bold text-black uppercase tracking-widest border-b border-black pb-1 mb-6 inline-block">Look 03</span>
                  <h3 class="font-serif text-4xl text-black mb-4">The New Classic</h3>
                  <p class="text-gray-500 mb-8 font-light">Redefining the basics. The perfect white tee, the ultimate denim jacket. Timeless pieces for a capsule wardrobe.</p>
                  <a routerLink="/shop" class="text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors">Shop The Look &rarr;</a>
               </div>
            </div>
         </div>
      </div>
    </div>
  `
})
export class LookbookComponent {}
