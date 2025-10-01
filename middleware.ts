/**
 * Next.js Middleware for Route Protection
 * 
 * Protects admin and user routes from unauthorized access
 * Only allows public access to: /, /recipe, /cookware, /about, /contact
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/recipe',
  '/cookware',
  '/about',
  '/contact',
  '/api/auth',
  '/auth',
  '/_next',
  '/favicon.ico',
  '/images',
  '/icons',
  '/placeholder-recipe.svg',
  '/placeholder-avatar.svg'
];

// Define admin-only routes
const ADMIN_ROUTES = [
  '/admin'
];

// Define user routes (require authentication but not admin)
const USER_ROUTES = [
  '/user'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get the user's session token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Check if user is trying to access admin routes
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  
  if (isAdminRoute) {
    // Redirect to home if not authenticated
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
    
    // Redirect to home if not admin
    if (token.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(url);
    }
    
    // Allow admin access
    return NextResponse.next();
  }

  // Check if user is trying to access user routes
  const isUserRoute = USER_ROUTES.some(route => pathname.startsWith(route));
  
  if (isUserRoute) {
    // Redirect to home if not authenticated
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'login_required');
      return NextResponse.redirect(url);
    }
    
    // Allow authenticated user access
    return NextResponse.next();
  }

  // For any other route not explicitly defined, redirect to home
  const url = request.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};