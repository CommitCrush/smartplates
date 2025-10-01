/**
 * Test API endpoint for cache functionality
 * 
 * GET /api/test/cache - Run cache tests and return results
 */

import { NextRequest, NextResponse } from 'next/server';
// Import removed - test files should not be imported in production builds
// import { testCacheService } from '@/../../tests/cache-service.test';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Cache test endpoint called...');
    
    // For production builds, return a simple status
    return NextResponse.json({
      success: true,
      message: 'Cache test endpoint available (tests disabled in production build)',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Cache test API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Cache test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}