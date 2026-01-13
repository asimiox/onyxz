
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { ShopComponent } from './pages/shop.component';
import { ProductDetailComponent } from './pages/product-detail.component';
import { CartComponent } from './pages/cart.component';
import { LoginComponent } from './pages/auth/login.component';
import { SignupComponent } from './pages/auth/signup.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password.component';
import { ProfileComponent } from './pages/user/profile.component';
import { LookbookComponent } from './pages/lookbook.component';
import { SupportComponent } from './pages/support.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/dashboard.component';
import { AdminProductsComponent } from './pages/admin/products.component';
import { AdminCategoriesComponent } from './pages/admin/categories.component';
import { AdminOrdersComponent } from './pages/admin/orders.component';
import { AdminUsersComponent } from './pages/admin/users.component';
import { AdminPromotionsComponent } from './pages/admin/promotions.component';
import { AdminPaymentsComponent } from './pages/admin/payments.component';
import { AdminSettingsComponent } from './pages/admin/settings.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Public
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'lookbook', component: LookbookComponent },
  { path: 'support', component: SupportComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // User Protected
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  // Admin
  { path: 'admin/login', redirectTo: 'login' }, // Redirect admin login to main login
  { 
    path: 'admin', 
    component: AdminLayoutComponent, 
    canActivate: [adminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'promotions', component: AdminPromotionsComponent },
      { path: 'payments', component: AdminPaymentsComponent },
      { path: 'settings', component: AdminSettingsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
