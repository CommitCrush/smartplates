/**
 * NextAuth.js Configuration for SmartPlates
 * 
 * This file configures Google OAuth authentication with MongoDB adapter.
 * Clean, beginner-friendly setup for Google Cloud Authentication.
 */

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient, ObjectId } from 'mongodb';
import { config } from '@/config/env';
import type { UserRole } from '@/types/user';

// MongoDB client for NextAuth adapter
const client = new MongoClient(config.database.uri);
const clientPromise = Promise.resolve(client);

/**
 * NextAuth configuration options
 * Configures Google OAuth with MongoDB storage
 */
export const authOptions: NextAuthOptions = {
  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: config.googleCloud.clientId!,
      clientSecret: config.googleCloud.clientSecret!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
  ],

  // MongoDB adapter for session storage
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: config.database.name,
    collections: {
      Users: 'users',
      Sessions: 'sessions',
      Accounts: 'accounts',
      VerificationTokens: 'verificationTokens',
    }
  }) as any,

  // Configure session strategy
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // 24 hours
  },

  // Configure pages
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },

  // Configure callbacks
  callbacks: {
    /**
     * Called when user signs in
     * Customize user data and add role information
     */
    async signIn({ account }) {
      // Allow all Google OAuth sign-ins
      if (account?.provider === 'google') {
        return true;
      }
      return false;
    },

    /**
     * Called whenever a session is checked
     * Add user role and ID to session
     */
    async session({ session, user }) {
      if (session.user && user) {
        // Add user ID and role to session
        session.user.id = user.id;
        session.user.role = (user as any).role || 'user';
        session.user.emailVerified = (user as any).emailVerified || false;
      }
      return session;
    },

    /**
     * Called when JWT token is created
     * Add custom fields to the token
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'user';
        token.emailVerified = (user as any).emailVerified || false;
      }
      return token;
    },
  },

  // Configure events
  events: {
    /**
     * Called when user signs in for the first time
     * Set default user role and verification status
     */
    async createUser({ user }) {
      // Default role for new users
      if (user.email) {
        // You can customize this logic
        const isAdmin = user.email.includes('admin') || user.email === 'admin@smartplates.com';
        
        // Update user with default role
        await client.db(config.database.name).collection('users').updateOne(
          { _id: new ObjectId(user.id) },
          { 
            $set: { 
              role: isAdmin ? 'admin' : 'user',
              isEmailVerified: true, // Google OAuth emails are verified
              createdAt: new Date(),
              updatedAt: new Date(),
              savedRecipes: [],
              createdRecipes: [],
            }
          }
        );
      }
    },

    /**
     * Called when user signs in
     * Update last login timestamp
     */
    async signIn({ user }) {
      if (user.id) {
        await client.db(config.database.name).collection('users').updateOne(
          { _id: new ObjectId(user.id) },
          { 
            $set: { 
              lastLoginAt: new Date(),
              updatedAt: new Date(),
            }
          }
        );
      }
    },
  },

  // Enable debug in development
  debug: config.app.debug,

  // Configure secret
  secret: config.auth.nextAuthSecret,
};

/**
 * Helper function to get user role from session
 * @param session - NextAuth session object
 * @returns User role or 'viewer' if not authenticated
 */
export function getUserRole(session: { user?: { role?: UserRole } } | null): UserRole {
  if (!session?.user) return 'viewer';
  return session.user.role || 'user';
}

/**
 * Helper function to check if user is admin
 * @param session - NextAuth session object
 * @returns True if user is admin
 */
export function isAdmin(session: { user?: { role?: UserRole } } | null): boolean {
  return getUserRole(session) === 'admin';
}

/**
 * Helper function to check if user is authenticated
 * @param session - NextAuth session object
 * @returns True if user is authenticated
 */
export function isAuthenticated(session: { user?: any } | null): boolean {
  return !!session?.user;
}