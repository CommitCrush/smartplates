/**
 * NextAuth.js Configuration for SmartPlates - MOCK VERSION
 * 
 * This is a mock configuration for development without real authentication.
 * For production, this would include real Google OAuth and MongoDB.
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { shouldBeAdmin } from '@/config/team';
import { findUserByEmail } from '@/models/User';
import { verifyPassword } from '@/utils/password';

/**
 * Mock NextAuth configuration for development
 * Uses credentials provider with hardcoded test users
 */
export const authOptions: NextAuthOptions = {
  // Mock authentication providers
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Development Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user in MongoDB
        const user = await findUserByEmail(credentials.email.toLowerCase());
        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        // Determine role from team.ts - only admin or user for auth
        const finalRole = shouldBeAdmin(user.email) ? 'admin' : 'user';

        return {
          id: user._id?.toString() || '',
          email: user.email,
          name: user.name,
          role: finalRole,
          emailVerified: user.isEmailVerified || false
        };
      }
    })
  ],

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callback functions
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'user';
      }
      return session;
    },
  },

  // Custom pages (optional)
  pages: {
    signIn: '/login',
    error: '/login'
  },

  // Security options
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-not-for-production',
  
  // Development settings
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Determines user role based on email address using team.ts configuration
 * 
 * @param email - User's email address
 * @returns UserRole - 'admin' or 'user'
 */
export function getUserRole(email: string): 'admin' | 'user' {
  return shouldBeAdmin(email) ? 'admin' : 'user';
}

/**
 * Check if user has admin privileges using team.ts configuration
 * 
 * @param userEmail - User's email address
 * @returns boolean - True if user is admin
 */
export function isAdminUser(userEmail: string): boolean {
  return shouldBeAdmin(userEmail);
}

/**
 * Get user data from session
 * Helper function to extract user information from NextAuth session
 * 
 * @param session - NextAuth session object
 * @returns User object or null
 */
export function getUserFromSession(session: any) {
  if (!session?.user) return null;
  
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    role: getUserRole(session.user.email),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: false,
        weekly: true
      },
      dietary: [],
      language: 'en'
    }
  };
}

/**
 * Enhanced user type for NextAuth session
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: 'admin' | 'user';
    };
  }
  
  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: 'admin' | 'user';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'user';
  }
}
