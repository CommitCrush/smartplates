import { NextRequest, NextResponse } from 'next/server';
import { searchSpoonacularRecipes } from '@/services/spoonacularService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;
  const diet = searchParams.get('diet') || undefined;
  const quick = searchParams.get('quick') === 'true';
  const maxReadyTime = quick ? '20' : undefined;
  const number = searchParams.get('number') || '20';

  const filters: any = {};
  if (category) filters.type = category;
  if (diet) filters.diet = diet;
  if (maxReadyTime) filters.maxReadyTime = maxReadyTime;
  if (number) filters.number = number;

  try {
    const { recipes } = await searchSpoonacularRecipes(q, filters);
    return NextResponse.json({ recipes });
  } catch (error: any) {
    return NextResponse.json({ error: 'Spoonacular search failed', details: error?.message }, { status: 500 });
  }
}
