/**
 * Admin API Route: Recipe Migration
 * 
 * Endpoint to trigger migration of existing recipes to include
 * missing cookingMinutes and preparationMinutes fields
 */

import { NextRequest, NextResponse } from 'next/server';
import { migrateRecipeTimeFields, validateMigration } from '@/utils/migrateRecipeData';

export async function POST(request: NextRequest) {
  try {
    // Basic authentication check (you should implement proper admin auth)
    const authHeader = request.headers.get('authorization');
    const isAdmin = authHeader && authHeader.includes('admin'); // Simplified check
    
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Unauthorized. Admin access required.' 
      }, { status: 401 });
    }
    
    console.log('🚀 Starting recipe migration...');
    
    // Run the migration
    const result = await migrateRecipeTimeFields();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true,
        message: 'Recipe migration completed successfully',
        data: {
          processed: result.processed,
          successful: result.successful,
          errors: result.errors
        }
      });
    } else {
      return NextResponse.json({ 
        success: false,
        error: result.error || 'Migration failed'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('💥 Migration API error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Basic authentication check
    const authHeader = request.headers.get('authorization');
    const isAdmin = authHeader && authHeader.includes('admin');
    
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Unauthorized. Admin access required.' 
      }, { status: 401 });
    }
    
    // Validate migration status
    const validation = await validateMigration();
    
    if (validation) {
      return NextResponse.json({
        success: true,
        message: 'Migration validation completed',
        data: validation
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Validation failed'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('💥 Validation API error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}