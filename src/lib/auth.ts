/**
 * NextAuth.js Configuration for SmartPlates - MOCK VERSION
 * 
 * This is a mock configuration for development without real authentication.
 * For production, this would include real Google OAuth and MongoDB.
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

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
        // Mock users for development
        const mockUsers = [
          {
            id: 'admin-1',
            email: 'admin@smartplates.dev',
            name: 'Admin User',
            role: 'admin'
          },
          {
            id: 'user-1', 
            email: 'user@smartplates.dev',
            name: 'Regular User',
            role: 'user'
          }
        ];

        if (credentials?.email && credentials?.password) {
          // Simple mock authentication
          const user = mockUsers.find(u => u.email === credentials.email);
          if (user && credentials.password === 'password123') {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role as 'admin' | 'user',
              emailVerified: true
            };
          }
        }
        
        return null;
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
 * Team member emails that should have admin access
 * Add team member emails here to grant admin privileges
 */
const ADMIN_EMAILS = [
  'admin@smartplates.dev',
  'team@smartplates.dev',
  // Add more admin emails as needed
];

/**
 * Determines user role based on email address
 * 
 * @param email - User's email address
 * @returns UserRole - 'admin' or 'user'
 */
export function getUserRole(email: string): 'admin' | 'user' {
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user';
}

/**
 * Check if user has admin privileges
 * 
 * @param userEmail - User's email address
 * @returns boolean - True if user is admin
 */
export function isAdminUser(userEmail: string): boolean {
  return getUserRole(userEmail) === 'admin';
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
