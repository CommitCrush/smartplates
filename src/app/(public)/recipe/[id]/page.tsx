/**
 * Recipe Detail Page
 * 
 * Dynamic route for individual recipe display.
 * Shows complete recipe information including ingredients, instructions, and metadata.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RecipeDetail } from '@/components/recipe/RecipeDetail';
import { CommunityRecipeDetail } from '@/components/recipe/CommunityRecipeDetail';
import { Recipe } from '@/types/recipe';

interface RecipePageProps {
  params: {
    id: string;
  };
}

// Fetch recipe data - this would connect to your API
async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    // Use proper base URL construction with current port
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}/api/recipes/${id}`, {
      cache: 'no-store' // For fresh data
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch recipe ${id}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    return {
      title: 'Recipe Not Found | SmartPlates'
    };
  }

  return {
    title: `${recipe.title} | SmartPlates`,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: recipe.image ? [{ url: recipe.image }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description: recipe.description,
      images: recipe.image ? [recipe.image] : [],
    }
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  // Check if this is a community recipe (admin/user created)
  // Type-safe check for community recipe properties
  const isCommunityRecipe = !!(recipe as any).source && 
                           ((recipe as any).source === 'admin_upload' || 
                            (recipe as any).source === 'user_upload') ||
                           !recipe.spoonacularId ||
                           !!(recipe as any).ingredients && Array.isArray((recipe as any).ingredients);

  return (
    <div className="container mx-auto px-4 py-8">
      {isCommunityRecipe ? (
        <CommunityRecipeDetail recipe={recipe} />
      ) : (
        <RecipeDetail recipe={recipe} />
      )}
    </div>
  );
}
