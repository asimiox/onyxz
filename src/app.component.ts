
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';
import { FooterComponent } from './components/footer.component';
import { ToastComponent } from './components/toast.component';
import { PromotionPopupComponent } from './components/promotion-popup.component';
import { ChatWidgetComponent } from './components/chat-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent, PromotionPopupComponent, ChatWidgetComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-navbar></app-navbar>
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <app-toast></app-toast>
      <app-promotion-popup></app-promotion-popup>
      <app-chat-widget></app-chat-widget>
    </div>
  `
})
export class AppComponent {}
