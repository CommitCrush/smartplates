/**
 * NextAuth.js Configuration for SmartPlates - MOCK VERSION
 * 
 * This is a mock configuration for development without real authentication.
 * For production, this would include real Google OAuth and MongoDB.
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { shouldBeAdmin } from '@/config/team';

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
        
        // Mock users for development with individual passwords
        const mockUsers = [
          {
            id: 'admin-1',
            email: 'admin@smartplates.dev',
            name: 'Admin User',
            role: 'admin',
            password: 'admin123'
          },
          {
            id: 'user-1', 
            email: 'user@smartplates.dev',
            name: 'Regular User',
            role: 'user',
            password: 'user123'
          },
          // Add team members from team.ts
          {
            id: 'team-ese',
            email: 'ese@gmail.com',
            name: 'Esse (Team)',
            role: 'admin',
            password: 'team123'
          },
          {
            id: 'team-rozn',
            email: 'rozn@gmail.com',
            name: 'Rozen (Team)',
            role: 'admin',
            password: 'team123'
          },
          {
            id: 'team-monika',
            email: 'monika@gmail.com',
            name: 'Monika (Team)',
            role: 'admin',
            password: 'team123'
          },
          {
            id: 'team-balta',
            email: 'balta@gmail.com',
            name: 'Balta (Team)',
            role: 'admin',
            password: 'team123'
          },
          {
            id: 'team-hana',
            email: 'hana@gmail.com',
            name: 'Hana (Team)',
            role: 'admin',
            password: 'team123'
          }
        ];

        // Find user by email and check password
        const user = mockUsers.find(u => 
          u.email === credentials.email && u.password === credentials.password
        );
        
        if (user) {
          // Use team.ts configuration to determine final role
          const finalRole = shouldBeAdmin(user.email) ? 'admin' : user.role;
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: finalRole as 'admin' | 'user',
            emailVerified: true
          };
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
