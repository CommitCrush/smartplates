/**
 * Authentication Middleware for SmartPlates
 * 
 * This middleware handles route protection and user authentication.
 * Clean, reusable functions that can be applied to any protected route.
 * 
 * Beginner-friendly code with clear error handling and documentation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';

export interface AuthenticatedRequest extends NextRequest {
  user?: any;
}

interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

/**
 * Mock authentication function for development
 * In production, this would validate JWT tokens and check database
 * 
 * @param request - Next.js request object
 * @returns Promise<AuthResult> - Authentication result with user data
 */
export async function authenticateToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Token aus Header oder Cookie extrahieren (hier als Beispiel userId aus Header)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      // DEV-Fallback: Immer Admin-User erlauben, wenn kein Header gesetzt
      if (process.env.NODE_ENV !== 'production') {
        return {
          success: true,
          user: {
            id: 'admin-dev',
            email: 'admin@dev.local',
            name: 'Dev Admin',
            role: 'admin',
            isActive: true
          }
        };
      }
      return { success: false, error: 'No user ID provided' };
    }
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ _id: toObjectId(userId) });
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    if (user.isActive === false) {
      return { success: false, error: 'Account deaktiviert' };
    }
    return { success: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Middleware to require authentication
 * 
 * @param request - Next.js request object
 * @returns NextResponse or null (if authentication successful)
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await authenticateToken(request);
  
  if (!authResult.success) {
    return NextResponse.json(
      { 
        error: 'Authentication required',
        message: authResult.error 
      },
      { status: 401 }
    );
  }
  
  // Authentication successful, allow request to continue
  return null;
}

/**
 * Middleware to require admin role
 * Use this to protect admin-only routes
 * 
 * @param request - Next.js request object
 * @returns NextResponse or null (if authorization successful)
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await authenticateToken(request);
  
  if (!authResult.success) {
    return NextResponse.json(
      { 
        error: 'Authentication required',
        message: authResult.error 
      },
      { status: 401 }
    );
  }
  
  // Check if user has admin role
  if (authResult.user?.role !== 'admin') {
    return NextResponse.json(
      { 
        error: 'Admin access required',
        message: 'You do not have permission to access this resource'
      },
      { status: 403 }
    );
  }
  
  // Authorization successful, allow request to continue
  return null;
}

/**
 * Higher-order function to create protected API route handlers
 * This is a utility to wrap your API handlers with authentication
 * 
 * @param handler - Your API route handler function
 * @param requireAdminRole - Whether admin role is required
 * @returns Protected API handler
 */
export function withAuth(
  handler: (request: AuthenticatedRequest, user: any) => Promise<NextResponse>,
  requireAdminRole: boolean = false
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    // Check authentication
    const authResult = await authenticateToken(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: authResult.error 
        },
        { status: 401 }
      );
    }
    
    // Check admin role if required
    if (requireAdminRole && authResult.user.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Admin access required',
          message: 'You do not have permission to access this resource'
        },
        { status: 403 }
      );
    }
    
    // Add user to request object
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = authResult.user;
    
    // Call the original handler with authenticated request and user
    return handler(authenticatedRequest, authResult.user);
  };
}

/**
 * Utility function to create CORS headers
 * Useful for API routes that need to handle cross-origin requests
 * 
 * @param origin - Allowed origin (optional)
 * @returns Headers object with CORS settings
 */
export function createCorsHeaders(origin?: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}
