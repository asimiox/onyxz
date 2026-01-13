
export type UserRole = 'admin' | 'user' | 'guest';
export type MembershipTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

export interface RewardsUsage {
  Silver: boolean;
  Gold: boolean;
  Diamond: boolean;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  joinedDate: Date;
  points: number;
  tier: MembershipTier;
  rewardsUsage: RewardsUsage; // Track if the one-time reward for a tier is used
}

export interface AuthSession {
  user: User;
  token: string;
}
