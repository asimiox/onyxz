
import { Injectable, signal } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Start with empty list - only real registered users
  private users = signal<User[]>([]);

  getUsers() {
    return this.users;
  }

  addUser(user: User) {
    this.users.update(users => [...users, user]);
  }

  updateUser(updatedUser: User) {
    this.users.update(users => users.map(u => u.id === updatedUser.id ? updatedUser : u));
  }

  deleteUser(id: number) {
    this.users.update(users => users.filter(u => u.id !== id));
  }
}
