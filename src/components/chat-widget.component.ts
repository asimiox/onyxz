
import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { ProductService } from '../services/product.service';

interface ChatMessage {
  text: string;
  isUser: boolean;
  time: Date;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      
      <!-- Chat Window -->
      @if (isOpen()) {
        <div class="bg-white w-[350px] sm:w-[400px] h-[500px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          <!-- Header -->
          <div class="bg-slate-900 p-4 flex justify-between items-center">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              </div>
              <div>
                <h3 class="text-white font-bold text-sm">ONYX Stylist</h3>
                <p class="text-slate-400 text-xs">Powered by Gemini AI</p>
              </div>
            </div>
            <button (click)="toggleChat()" class="text-slate-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- Messages -->
          <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            @for (msg of messages(); track msg.time) {
              <div class="flex" [class.justify-end]="msg.isUser">
                <div 
                  class="max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap"
                  [class.bg-slate-900]="msg.isUser"
                  [class.text-white]="msg.isUser"
                  [class.rounded-tr-none]="msg.isUser"
                  [class.bg-white]="!msg.isUser"
                  [class.text-gray-800]="!msg.isUser"
                  [class.rounded-tl-none]="!msg.isUser"
                  [class.border]="!msg.isUser"
                  [class.border-gray-100]="!msg.isUser">
                  {{ msg.text }}
                </div>
              </div>
            }
            
            @if (isLoading()) {
              <div class="flex justify-start">
                <div class="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex space-x-2 items-center">
                  <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            }
          </div>

          <!-- Input -->
          <div class="p-4 bg-white border-t border-gray-100">
            <form (ngSubmit)="sendMessage()" class="flex space-x-2">
              <input 
                type="text" 
                [(ngModel)]="userInput" 
                name="userInput" 
                placeholder="Ask for fashion advice..." 
                class="flex-1 bg-white border border-gray-200 text-black placeholder-black rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                [disabled]="isLoading()"
              >
              <button 
                type="submit" 
                [disabled]="!userInput.trim() || isLoading()"
                class="bg-slate-900 text-white p-3 rounded-full hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
                <svg class="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </div>
        </div>
      }

      <!-- Toggle Button -->
      <button 
        (click)="toggleChat()"
        class="bg-slate-900 hover:bg-slate-800 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-slate-300 group">
        @if (isOpen()) {
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        } @else {
           <span class="absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-20 animate-ping group-hover:hidden"></span>
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        }
      </button>
    </div>
  `
})
export class ChatWidgetComponent implements AfterViewChecked {
  chatService = inject(ChatService);
  productService = inject(ProductService);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = signal(false);
  isLoading = signal(false);
  userInput = '';
  
  messages = signal<ChatMessage[]>([
    { text: "Hi! I'm your ONYX Personal Stylist. Looking for a specific outfit or just browsing?", isUser: false, time: new Date() }
  ]);

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  async sendMessage() {
    if (!this.userInput.trim()) return;

    const userMsg = this.userInput;
    this.userInput = ''; 
    
    // Add user message
    this.messages.update(msgs => [...msgs, { text: userMsg, isUser: true, time: new Date() }]);
    this.isLoading.set(true);

    try {
       const products = this.productService.getAllProducts()();
       const stream = await this.chatService.sendMessageStream(userMsg, products);

       // Initialize a new message for the AI response
       this.messages.update(msgs => [...msgs, { text: "", isUser: false, time: new Date() }]);
       this.isLoading.set(false); // Stop loading spinner as soon as stream starts

       let fullText = "";
       for await (const chunk of stream) {
          fullText += chunk;
          // Update the last message with the accumulated text
          this.messages.update(msgs => {
             const newMsgs = [...msgs];
             const lastMsg = newMsgs[newMsgs.length - 1];
             if (!lastMsg.isUser) {
                lastMsg.text = fullText;
             }
             return newMsgs;
          });
       }

    } catch (e) {
       this.isLoading.set(false);
       this.messages.update(msgs => [...msgs, { text: "Sorry, I encountered an error.", isUser: false, time: new Date() }]);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch(err) { }
    }
  }
}
