/**
 * User Type Definitions for SmartPlates
 * 
 * This file defines all user-related types used throughout the application.
 * Clean, reusable TypeScript interfaces for better code quality.
 */

import { ObjectId } from 'mongodb';

// User roles in the application
export type UserRole = 'user' | 'admin' | 'viewer';

// User authentication status
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

// Main User interface - represents a user in our database
export interface User {
  _id?: ObjectId | string;           // MongoDB ObjectId or string
  email: string;                     // User's email (unique)
  name: string;                      // User's display name
  avatar?: string;                   // Profile picture URL (optional)
  role: UserRole;                    // User's role (user, admin, viewer)
  
  // Authentication related
  password?: string;                 // Hashed password (optional for OAuth users)
  googleId?: string;                 // Google OAuth ID (optional)
  isEmailVerified: boolean;          // Email verification status
  
  // User preferences
  dietaryRestrictions?: string[];    // Array of dietary restrictions
  favoriteCategories?: string[];     // Preferred recipe categories
  
  // Application usage
  savedRecipes: ObjectId[] | string[]; // Array of saved recipe IDs
  createdRecipes: ObjectId[] | string[]; // Array of user's created recipes
  
  // Timestamps
  createdAt: Date;                   // When user account was created
  updatedAt: Date;                   // Last profile update
  lastLoginAt?: Date;                // Last login timestamp (optional)
}

// User creation input (what we need when creating a new user)
export interface CreateUserInput {
  email: string;
  name: string;
  password?: string;                 // Plain text password (will be hashed)
  avatar?: string;
  role?: UserRole;                   // Optional, defaults to 'user'
  googleId?: string;
  dietaryRestrictions?: string[];
  favoriteCategories?: string[];
}

// User update input (what can be updated)
export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  dietaryRestrictions?: string[];
  favoriteCategories?: string[];
  isEmailVerified?: boolean;
  lastLoginAt?: Date;
}

// Public user profile (what other users can see)
export interface PublicUserProfile {
  _id: ObjectId | string;
  name: string;
  avatar?: string;
  createdRecipes: ObjectId[] | string[];
  createdAt: Date;
}

// Authentication context type
export interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}
