import { NextRequest, NextResponse } from 'next/server';
import { SpoonacularService } from '@/services/spoonacularService';
import { saveRecipeToDb } from '@/services/recipeService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const service = new SpoonacularService();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 });
  }

  try {
    const recipeDetails = await service.getRecipeDetails(id);
    if (!recipeDetails) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    // Save to local DB, attribute to user
    const savedRecipe = await saveRecipeToDb(recipeDetails, session.user.id);
    return NextResponse.json({ recipe: savedRecipe });
  } catch (error: any) {
    return NextResponse.json({ error: 'Import failed', details: error?.message }, { status: 500 });
  }
}
