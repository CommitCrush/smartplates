/**
 * Authentication Middleware for SmartPlates
 * 
 * This middleware handles route protection and user authentication.
 * Clean, reusable functions that can be applied to any protected route.
 * 
 * Beginner-friendly code with clear error handling and documentation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { findUserById } from '@/models/User';
import { User } from '@/types/user';
import { config } from '@/config/env';

// JWT secret from environment configuration
const JWT_SECRET = config.auth.jwtSecret;

/**
 * Interface for authenticated request with user data
 * This extends the normal NextRequest to include user information
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

/**
 * Authentication result interface
 * Provides clear success/failure information
 */
interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Extracts and validates JWT token from request
 * 
 * @param request - Next.js request object
 * @returns Promise<AuthResult> - Authentication result with user data
 */
export async function authenticateToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Extract token from Authorization header or cookies
    let token: string | undefined;
    
    // Try Authorization header first (Bearer token)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // Fallback to cookie if no header token
    /**
     * Authentication Middleware for SmartPlates
     *
     * Handles route protection, user authentication, and admin access control.
     * Clean, reusable functions for protected and admin-only routes.
     */

    import { NextRequest, NextResponse } from 'next/server';
    import { verify } from 'jsonwebtoken';
    import { findUserById } from '@/models/User';
    import { User } from '@/types/user';
    import { config } from '@/config/env';

    // JWT secret from environment configuration
    const JWT_SECRET = config.auth.jwtSecret;

    // Interface for authenticated request with user data
    export interface AuthenticatedRequest extends NextRequest {
      user?: User;
    }

    // Authentication result interface
    interface AuthResult {
      success: boolean;
      user?: User;
      error?: string;
    }

    /**
     * Extracts and validates JWT token from request
     * 
     * @param request - Next.js request object
     */

    // --- Admin Route Protection ---
    /**
     * Middleware-Utility: Erlaubt Zugriff nur für eingeloggte Admins
     * @param request Next.js Request
     * @returns NextResponse (redirect) oder undefined (Zugriff erlaubt)
     */
// ...existing code...
// ...existing code...
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
 * Middleware to optionally authenticate (for public routes that show different content for logged-in users)
 * 
 * @param request - Next.js request object
 * @returns AuthResult - Always returns result, even if authentication fails
 */
export async function optionalAuth(request: NextRequest): Promise<AuthResult> {
  try {
    return await authenticateToken(request);
  } catch (error) {
    // For optional auth, we don't throw errors
    console.error('Optional auth failed:', error);
    return {
      success: false,
      error: 'No authentication'
    };
  }
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
  handler: (request: AuthenticatedRequest, user: User) => Promise<NextResponse>,
  requireAdminRole: boolean = false
) {
  return async (request: NextRequest): Promise<NextResponse> => {
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

/**
 * Utility function to handle preflight CORS requests
 * 
 * @param request - Next.js request object
 * @returns CORS preflight response or null
 */
export function handleCors(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: createCorsHeaders()
    });
  }
  
  return null;
}

/**
 * Rate limiting data structure
 * Simple in-memory rate limiting (use Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting middleware
 * Limits requests per IP address
 * 
 * @param request - Next.js request object
 * @param maxRequests - Maximum requests allowed per window
 * @param windowMs - Time window in milliseconds
 * @returns NextResponse or null (if under limit)
 */
export function rateLimit(
  request: NextRequest, 
  maxRequests: number = 100, 
  windowMs: number = 15 * 60 * 1000  // 15 minutes
): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
  const now = Date.now();
  
  const rateLimitData = rateLimitMap.get(ip);
  
  if (!rateLimitData || now > rateLimitData.resetTime) {
    // Reset or create new rate limit entry
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs
    });
    return null;
  }
  
  if (rateLimitData.count >= maxRequests) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      },
      { status: 429 }
    );
  }
  
  // Increment count
  rateLimitData.count++;
  
  return null;
}
