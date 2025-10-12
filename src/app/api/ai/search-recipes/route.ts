import { NextRequest, NextResponse } from 'next/server';
import { searchRecipesMongoAI } from '@/services/recipeServiceAI';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      query: searchParams.get('search') || '',
      type: searchParams.get('type') || undefined,
      diet: searchParams.get('diet') || undefined,
      intolerances: searchParams.get('intolerances') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      maxReadyTime: searchParams.get('maxReadyTime') ? parseInt(searchParams.get('maxReadyTime') as string, 10) : undefined,
    };
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || searchParams.get('number') || '30', 10);
    const authorId = searchParams.get('authorId') || undefined;
    const randomize = searchParams.get('randomize') === 'true';

    const { recipes, total } = await searchRecipesMongoAI(
      { ...filters, authorId },
      { page, limit },
      randomize
    );
    return NextResponse.json({ recipes, total, source: 'mongodb-ai' });
  } catch (error) {
    console.error('❌ API /api/ai/search-recipes error:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes (AI)' }, { status: 500 });
  }
}