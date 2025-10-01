/**
 * My Added Recipes Page
 * 
 * Lists all recipes uploaded by the current user
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  Users,
  Star
} from 'lucide-react';
import { Recipe } from '@/types/recipe';

export default function MyAddedRecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      loadUserRecipes();
    }
  }, [status, router, loadUserRecipes]);

  const loadUserRecipes = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/user/recipes');
      // const data = await response.json();
      
      // Mock data for now
      setRecipes([
        {
          id: '1',
          title: 'Mediterranean Pasta Salad',
          description: 'Fresh and colorful pasta salad with Mediterranean flavors',
          image: '/placeholder-recipe.jpg',
          servings: 4,
          prepTime: 15,
          cookTime: 10,
          totalTime: 25,
          difficulty: 'easy' as const,
          category: 'main course',
          cuisine: 'Mediterranean',
          dietaryRestrictions: ['vegetarian'],
          tags: ['pasta', 'salad', 'quick'],
          ingredients: [],
          instructions: [],
          nutrition: {
            calories: 320,
            protein: 12,
            carbohydrates: 45,
            fat: 8
          },
          rating: 4.5,
          ratingsCount: 12,
          likesCount: 23,
          authorId: session?.user?.id || '',
          authorName: session?.user?.name || '',
          isPublished: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          title: 'Healthy Breakfast Bowl',
          description: 'Nutritious breakfast bowl with quinoa, berries, and nuts',
          image: '/placeholder-recipe.jpg',
          servings: 2,
          prepTime: 10,
          cookTime: 0,
          totalTime: 10,
          difficulty: 'easy' as const,
          category: 'breakfast',
          cuisine: 'International',
          dietaryRestrictions: ['vegan', 'gluten-free'],
          tags: ['breakfast', 'healthy', 'quinoa'],
          ingredients: [],
          instructions: [],
          nutrition: {
            calories: 280,
            protein: 15,
            carbohydrates: 35,
            fat: 10
          },
          rating: 4.8,
          ratingsCount: 8,
          likesCount: 31,
          authorId: session?.user?.id || '',
          authorName: session?.user?.name || '',
          isPublished: true,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10')
        }
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading recipes:', error);
      alert('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [session]);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      // TODO: Add actual delete API call
      // await fetch(`/api/recipes/${recipeId}`, { method: 'DELETE' });
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      alert('Failed to delete recipe');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Recipes
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and share your culinary creations
          </p>
        </div>
        <Link
          href="/user/my_added_recipes/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add New Recipe
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Recipes Grid */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Recipe Image */}
              <div className="aspect-video relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    recipe.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {recipe.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Recipe Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {recipe.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {recipe.description}
                </p>

                {/* Recipe Stats */}
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {recipe.totalTime}m
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {recipe.servings}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {recipe.rating?.toFixed(1) || '0.0'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    <Link
                      href={`/user/my_added_recipes/${recipe.id}/edit`}
                      className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </div>
                  <button
                    onClick={() => handleDeleteRecipe(String(recipe.id))}
                    className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recipes yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start sharing your culinary creations with the community.
            </p>
            <Link
              href="/user/my_added_recipes/new"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Upload Your First Recipe
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}