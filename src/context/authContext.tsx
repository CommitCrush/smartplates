/**
 * Authentication Context for SmartPlates
 * 
 * This provides authentication state and functions throughout the app.
 * Uses NextAuth.js with SessionProvider for Google OAuth.
 */

'use client';

import { createContext, useContext } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import { UserRole } from '@/types/user';

/**
 * Authentication context interface
 * Provides authentication state and helper functions
 */
interface AuthContextType {
  // Session data
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  
  // User information
  user: Session['user'] | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  // Authentication functions
  signIn: typeof signIn;
  signOut: typeof signOut;
}

/**
 * Create authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use authentication context
 * @returns Authentication context with user data and functions
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Authentication provider component
 * Wraps the app with NextAuth SessionProvider and custom auth context
 */
function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  
  // Helper computed values
  const user = session?.user || null;
  const userRole: UserRole = session?.user?.role || 'viewer';
  const isAuthenticated = !!session?.user;
  const isAdmin = userRole === 'admin';
  
  const contextValue: AuthContextType = {
    session,
    status,
    user,
    userRole,
    isAuthenticated,
    isAdmin,
    signIn,
    signOut,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Main authentication provider
 * Combines NextAuth SessionProvider with custom AuthContext
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderContent>
        {children}
      </AuthProviderContent>
    </SessionProvider>
  );
}

/**
 * Hook to get current user role
 * @returns User role ('user' | 'admin' | 'viewer')
 */
export function useUserRole(): UserRole {
  const { userRole } = useAuth();
  return userRole;
}

/**
 * Hook to check if user is authenticated
 * @returns True if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to check if user is admin
 * @returns True if user is admin
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = useAuth();
  return isAdmin;
}