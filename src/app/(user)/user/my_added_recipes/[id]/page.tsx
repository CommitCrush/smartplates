/**
 * User Recipe Detail Page
 * 
 * Displays detailed view of user's uploaded recipe
 */

import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase, COLLECTIONS } from '@/lib/db';
import { ObjectId } from 'mongodb';
import RecipeDetail from '@/components/recipe/RecipeDetail';
import Layout from '@/components/layout/Layout';
import type { Recipe } from '@/types/recipe';

interface RecipeDetailPageProps { 
  params: Promise<{ id: string }>; 
}

async function getRecipe(id: string, userId: string) {
  try {
    const db = await connectToDatabase();
    const recipesCollection = db.collection(COLLECTIONS.RECIPES);

    let recipe = null;

    // Try as ObjectId first
    try {
      recipe = await recipesCollection.findOne({ 
        _id: new ObjectId(id),
        userId: userId // Only show user's own recipes
      });
    } catch (objectIdError) {
      // If ObjectId fails, try as string ID
      recipe = await recipesCollection.findOne({ 
        id: id,
        userId: userId
      });
    }

    return recipe;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { id } = await params;
  
  // Get user session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600">You need to be logged in to view this recipe.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const recipe = await getRecipe(id, session.user.id);

  if (!recipe) {
    notFound();
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <RecipeDetail 
          recipe={recipe as Recipe} 
          isEditable={true}
          showUserActions={true}
        />
      </div>
    </Layout>
  );
}
