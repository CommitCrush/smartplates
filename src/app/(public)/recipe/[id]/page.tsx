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
    // Use proper base URL construction
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <RecipeDetail recipe={recipe} />
    </div>
  );
}
