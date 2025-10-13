import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/db';

/**
 * GET /api/admin/recipes/created - Get recipes created by current admin
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const adminId = session.user.id;
    console.log('DEBUG: Looking for recipes by admin ID:', adminId);
    
    // Query recipes collection for recipes created by this admin (Admin collection)
    const recipesCollection = await getCollection('recipes');
    const adminRecipes = await recipesCollection.find({ 
      authorId: adminId
    }).toArray();

    console.log('DEBUG: Found admin recipes:', adminRecipes.length);
    adminRecipes.forEach(recipe => {
      console.log('Admin Recipe:', recipe.title, 'authorId:', recipe.authorId, 'authorType:', recipe.authorType);
    });

    // Also check userRecipes collection (in case admin also creates user recipes)
    const userRecipesCollection = await getCollection('userRecipes');
    const userRecipes = await userRecipesCollection.find({ 
      authorId: adminId
    }).toArray();

    console.log('DEBUG: Found user recipes by admin:', userRecipes.length);
    userRecipes.forEach(recipe => {
      console.log('User Recipe by Admin:', recipe.title, 'authorId:', recipe.authorId, 'authorType:', recipe.authorType);
    });

    // Combine both collections
    const allRecipes = [
      ...adminRecipes.map((recipe: any) => ({ ...recipe, source: 'admin' })),
      ...userRecipes.map((recipe: any) => ({ ...recipe, source: 'user' }))
    ];

    console.log(`Admin ${adminId} has ${allRecipes.length} total recipes (${adminRecipes.length} admin, ${userRecipes.length} user)`);

    return NextResponse.json({
      recipes: allRecipes,
      total: allRecipes.length,
      adminRecipes: adminRecipes.length,
      userRecipes: userRecipes.length
    });

  } catch (error) {
    console.error('Error fetching admin created recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}