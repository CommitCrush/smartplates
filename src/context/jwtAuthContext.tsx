/**
 * Custom JWT Authentication Context for SmartPlates
 * 
 * This provides authentication state for custom JWT token authentication.
 * Compatible with the custom login/register API routes.
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@/types/user';

/**
 * User information interface
 */
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
}

/**
 * Custom JWT authentication context interface
 */
interface JWTAuthContextType {
  // User information
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  
  // Authentication functions
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * Create JWT authentication context
 */
const JWTAuthContext = createContext<JWTAuthContextType | undefined>(undefined);

/**
 * Custom hook to use JWT authentication context
 */
export function useJWTAuth(): JWTAuthContextType {
  const context = useContext(JWTAuthContext);
  if (context === undefined) {
    throw new Error('useJWTAuth must be used within a JWTAuthProvider');
  }
  return context;
}

/**
 * JWT Authentication provider component
 */
export function JWTAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper computed values
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  /**
   * Check for existing authentication on mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if user is authenticated by calling a protected endpoint
   */
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login function
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const contextValue: JWTAuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <JWTAuthContext.Provider value={contextValue}>
      {children}
    </JWTAuthContext.Provider>
  );
}