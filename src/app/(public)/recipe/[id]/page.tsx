/**
 * Recipe Detail Page
 * 
 * Dynamic route for individual recipe display.
 * Shows complete recipe information including ingredients, instructions, and metadata.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RecipeDetail } from '@/components/recipe/RecipeDetail';
import { Recipe } from '@/types/recipe';

interface RecipePageProps {
  params: {
    id: string;
  };
}

// Fetch recipe data - this would connect to your API
async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    // In production, this would fetch from your API
    // For now, return mock data for development
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/recipes/${id}`, {
      cache: 'no-store' // For fresh data
    });
    
    if (!response.ok) {
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
  const recipe = await getRecipe(params.id);

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
  const recipe = await getRecipe(params.id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RecipeDetail recipe={recipe} />
    </div>
  );
}
