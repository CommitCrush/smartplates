/**
 * Categories API Route
 * 
 * GET: Abrufen aller Kategorien (öffentlich zugänglich)
 * POST: Neue Kategorie erstellen (nur für Administratoren)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleCors, rateLimit } from '@/middleware/authMiddleware';
import { findAllCategories, createCategory } from '@/utils/category-operations';
import { createCategoryValidation } from '@/lib/validation/categorySchemas';

// Type für User basierend auf dem Auth-System
type CategoryUser = {
  _id?: string | import('mongodb').ObjectId;
  email: string;
  name?: string;
}

/**
 * GET /api/categories
 * Abrufen aller verfügbaren Kategorien
 * Öffentlich zugänglich - keine Authentifizierung erforderlich
 */
export async function GET(req: NextRequest) {
  try {
    const response = handleCors(req);
    if (response) return response;

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // Pagination-Parameter
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const paginationOptions = { page, limit };
    
    const result = await findAllCategories(paginationOptions);
    
    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories  
 * Neue Kategorie erstellen
 * Nur für authentifizierte Benutzer (normalerweise Administratoren)
 */
async function createCategoryHandler(request: NextRequest, user: CategoryUser) {
  // TODO: In future, we'll use user.id for createdBy field
  console.log('Category created by user:', user.email);
  
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;
    
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 10, 15 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Parse request body
    const categoryData = await request.json();
    
    // Validierung mit Zod
    const validationResult = createCategoryValidation.safeParse(categoryData);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validierungsfehler',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    // Prepare category data for database (simplified to match utils)
    const categoryForDb = {
      name: validationResult.data.name,
      description: validationResult.data.description || '',
      imageUrl: undefined // TODO: Handle image uploads later
    };

    // Kategorie erstellen
    const result = await createCategory(categoryForDb);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create category' 
      },
      { status: 500 }
    );
  }
}

// POST endpoint requires authentication
export const POST = withAuth(createCategoryHandler, false);