/**
 * Recipe Reviews API Route
 * 
 * Handles recipe review submission, retrieval, and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { recipeInteractionsService } from '@/services/recipeInteractionsService.server';

export async function POST(request: NextRequest) {
  try {
    const { 
      recipeId, 
      userId, 
      userName, 
      rating, 
      comment, 
      userAvatar 
    } = await request.json();

    if (!recipeId || !userId || !userName || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: 'Alle Felder sind erforderlich' },
        { status: 400 }
      );
    }

    const result = await recipeInteractionsService.submitRecipeReview(
      recipeId,
      userId,
      userName,
      rating,
      comment,
      userAvatar
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Recipe review submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Speichern der Bewertung' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = (searchParams.get('sortBy') || 'newest') as 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';

    if (!recipeId) {
      return NextResponse.json(
        { success: false, message: 'Recipe ID ist erforderlich' },
        { status: 400 }
      );
    }

    const result = await recipeInteractionsService.getRecipeReviews(
      recipeId,
      page,
      limit,
      sortBy
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Recipe reviews retrieval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Laden der Bewertungen' 
      },
      { status: 500 }
    );
  }
}