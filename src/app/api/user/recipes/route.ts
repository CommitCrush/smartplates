import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listRecipesByUser } from '@/services/recipeService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const collect = (key: string) =>
      searchParams.getAll(key).flatMap((v) => v.split(',')).map((s) => s.trim()).filter(Boolean);

    // dishTypes aus Query akzeptieren (z. B. dishTypes=dessert)
    const dishTypes = Array.from(new Set(collect('dishTypes').map((s) => s.toLowerCase())));

    const { recipes, total } = await listRecipesByUser(session.user.id, { page, limit, dishTypes });
    return NextResponse.json({ recipes, total, page, limit, filters: { dishTypes } });
  } catch (error) {
    console.error('❌ API /api/user/recipes error:', error);
    return NextResponse.json({ error: 'Failed to fetch user recipes' }, { status: 500 });
  }
}

/**
 * Hinweis:
 * - Den ungültigen Handler GET_DESSERT_RECIPES bitte entfernen.
 *   Next.js ruft nur GET/POST/PATCH/DELETE/PUT/OPTIONS/HEAD auf.
 */
