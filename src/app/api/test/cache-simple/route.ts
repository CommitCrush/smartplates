/**
 * Simple cache test API endpoint
 * 
 * GET /api/test/cache-simple - Test basic cache functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/services/spoonacularCacheService';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing cache service functionality...');
    
    // Test cache stats
    const stats = await cacheService.getCacheStats();
    
    // Test quota status  
    const quota = await cacheService.getQuotaStatus();
    
    return NextResponse.json({
      success: true,
      message: 'Cache service is working properly',
      data: {
        cacheStats: stats,
        quotaStatus: quota,
        serverTime: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Cache test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Cache test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}