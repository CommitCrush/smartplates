/**
 * Recipe Like API Route
 * 
 * Handles recipe like/unlike functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { recipeInteractionsService } from '@/services/recipeInteractionsService.server';

export async function POST(request: NextRequest) {
  try {
    const { recipeId, userId } = await request.json();

    if (!recipeId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Recipe ID und User ID sind erforderlich' },
        { status: 400 }
      );
    }

    const result = await recipeInteractionsService.toggleRecipeLike(recipeId, userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Recipe like API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Verarbeiten der Anfrage' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Recipe like endpoint - POST method required' },
    { status: 405 }
  );
}