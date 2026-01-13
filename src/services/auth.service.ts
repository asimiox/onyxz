import { Injectable, signal, computed, inject } from '@angular/core';
import { User, AuthSession, MembershipTier } from '../models/user';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userService = inject(UserService);
  private _session = signal<AuthSession | null>(null);
  
  currentUser = computed(() => this._session()?.user || null);
  isAuthenticated = computed(() => !!this._session());
  isAdmin = computed(() => this._session()?.user.role === 'admin');

  constructor(private router: Router) {
    // Check localStorage for persisted session
    const saved = localStorage.getItem('mixtas_session');
    if (saved) {
      try {
        this._session.set(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('mixtas_session');
      }
    }
  }

  calculateTier(points: number): MembershipTier {
    if (points >= 500) return 'Diamond';
    if (points >= 300) return 'Gold';
    if (points >= 150) return 'Silver';
    return 'Bronze';
  }

  addPoints(amountSpent: number) {
    const session = this._session();
    if (session) {
      // 1 Dollar = 1 Point logic
      const newPoints = (session.user.points || 0) + Math.floor(amountSpent);
      const newTier = this.calculateTier(newPoints);
      
      const updatedUser: User = {
        ...session.user,
        points: newPoints,
        tier: newTier
      };

      const updatedSession = { ...session, user: updatedUser };
      this.setSession(updatedSession);
      
      // Sync with global user list
      this.userService.updateUser(updatedUser);
    }
  }

  markRewardUsed(tier: MembershipTier) {
    const session = this._session();
    if (session && tier !== 'Bronze') {
       // Using 'as keyof RewardsUsage' logic implicitly via specific check
       const updatedUsage = { ...session.user.rewardsUsage };
       
       if (tier === 'Silver') updatedUsage.Silver = true;
       if (tier === 'Gold') updatedUsage.Gold = true;
       if (tier === 'Diamond') updatedUsage.Diamond = true;

       const updatedUser: User = {
         ...session.user,
         rewardsUsage: updatedUsage
       };

       const updatedSession = { ...session, user: updatedUser };
       this.setSession(updatedSession);
       this.userService.updateUser(updatedUser);
    }
  }

  // ADDED: Missing changePassword method
  changePassword(username: string, oldPassword: string, newPassword: string): { success: boolean; message: string } {
    // Check if user exists and old password matches
    const users = this.userService.getUsers()();
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    if (user.password !== oldPassword) {
      return { success: false, message: 'Current password is incorrect' };
    }
    
    // Update password in user service
    const updatedUser = { ...user, password: newPassword };
    this.userService.updateUser(updatedUser);
    
    // If current user is changing their own password, update session
    const currentSession = this._session();
    if (currentSession && currentSession.user.username === username) {
      const updatedSession = {
        ...currentSession,
        user: updatedUser
      };
      this.setSession(updatedSession);
    }
    
    return { success: true, message: 'Password updated successfully' };
  }

  login(identifier: string, password: string): { success: boolean; message: string } {
    // 1. Admin Check (Special hardcoded admin)
    if (identifier === 'asim') {
      if (password === '10Oct') {
        const adminUser: User = {
            id: 1,
            name: 'Asim (Admin)',
            username: 'asim',
            email: 'admin@mixtas.com',
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Asim&background=0f172a&color=fff',
            joinedDate: new Date(),
            points: 1000,
            tier: 'Diamond',
            rewardsUsage: { Silver: false, Gold: false, Diamond: false } // Admin generally doesn't shop but needs structure
        };
        const adminSession: AuthSession = {
          user: adminUser,
          token: 'admin-token-123'
        };
        this.setSession(adminSession);
        
        // Ensure admin is in user list
        const exists = this.userService.getUsers()().find(u => u.id === 1);
        if(!exists) this.userService.addUser(adminUser);

        return { success: true, message: 'Welcome back, Admin!' };
      } else {
        return { success: false, message: 'Incorrect password' };
      }
    }

    // 2. Strict Check: Username OR Email AND Password match
    const users = this.userService.getUsers()();
    const user = users.find(u => 
      (u.username === identifier || u.email === identifier) && u.password === password
    );

    if (user) {
         const userSession: AuthSession = {
            user: user,
            token: 'user-token-' + Date.now()
         };
         this.setSession(userSession);
         return { success: true, message: 'Login successful!' };
    }

    // 3. User Not Found or Password Incorrect
    return { success: false, message: 'Invalid username/email or password.' };
  }

  signup(name: string, username: string, email: string, password: string): { success: boolean, message: string } {
    const users = this.userService.getUsers()();

    // Check for duplicates
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Email already registered.' };
    }
    if (users.some(u => u.username === username)) {
      return { success: false, message: 'Username is taken.' };
    }

    const newUser: User = {
        id: Math.floor(Math.random() * 1000) + 2,
        name: name,
        username: username,
        email: email,
        password: password, // Store password
        role: 'user',
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
        joinedDate: new Date(),
        points: 0,
        tier: 'Bronze',
        rewardsUsage: {
          Silver: false,
          Gold: false,
          Diamond: false
        }
    };

    const userSession: AuthSession = {
      user: newUser,
      token: 'user-token-' + Date.now()
    };
    this.setSession(userSession);
    
    // Add to global user service
    this.userService.addUser(newUser);
    
    return { success: true, message: 'Registration successful!' };
  }

  updateProfile(name: string, email: string, phone: string, address: string) {
    const session = this._session();
    if (session) {
      const updatedUser: User = {
        ...session.user,
        name,
        email,
        phone,
        address
      };
      
      const newSession = { ...session, user: updatedUser };
      this.setSession(newSession);
      this.userService.updateUser(updatedUser);
    }
  }

  logout() {
    this._session.set(null);
    localStorage.removeItem('mixtas_session');
    this.router.navigate(['/']);
  }

  private setSession(session: AuthSession) {
    this._session.set(session);
    localStorage.setItem('mixtas_session', JSON.stringify(session));
  }
  }
