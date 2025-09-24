import { NextRequest, NextResponse } from 'next/server';
import { getSpoonacularRecipe } from '@/services/spoonacularService';

const service = new SpoonacularService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing recipe id' }, { status: 400 });
  }
  try {
    const details = await service.getRecipeDetails(Number(id));
    return NextResponse.json({
      title: details?.title || '',
      summary: details?.summary || '',
      image: details?.image || '',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch details', details: error?.message }, { status: 500 });
  }
}
