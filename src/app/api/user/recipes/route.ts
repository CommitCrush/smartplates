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

    const { recipes, total } = await listRecipesByUser(session.user.id, { page, limit });
    return NextResponse.json({ recipes, total });
  } catch (error) {
    console.error('❌ API /api/user/recipes error:', error);
    return NextResponse.json({ error: 'Failed to fetch user recipes' }, { status: 500 });
  }
}
