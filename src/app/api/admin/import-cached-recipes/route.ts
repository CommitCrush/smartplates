import { NextRequest, NextResponse } from 'next/server';
import { importCachedRecipesToDB } from '@/services/spoonacularCacheService.server';

/**
 * Admin-only endpoint to import cached recipes from JSON file to MongoDB
 */
export async function POST(_request: NextRequest) {
  try {
    console.log('🔄 Starting import of cached recipes to MongoDB...');
    
    // Import cached recipes
    const result = await importCachedRecipesToDB();
    
    console.log('✅ Import completed successfully', result);
    
    return NextResponse.json({
      success: true,
      message: 'Cached recipes imported successfully',
      ...result
    });
    
  } catch (error) {
    console.error('❌ Error importing cached recipes:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}