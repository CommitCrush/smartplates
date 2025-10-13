/**
 * User My Recipes Page
 * 
 * Shows all user's planned, uploaded, and saved recipes in organized tabs
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { BookOpen, Heart, Upload, Calendar, Plus, Search, Filter, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Recipe {
  _id: string; // Use _id from MongoDB
  id: string;
  title: string;
  description: string;
  primaryImageUrl?: string; // Use primaryImageUrl from the UserRecipe model
  image?: string; // Keep for other recipe types if needed
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  isPublic: boolean;
  createdAt: string;
  plannedDate?: string;
  weekRange?: string;
  mealType?: string;
  servings?: number;
  notes?: string;
}

interface Favorite {
  recipeId: string;
  recipeTitle: string;
  recipeImage: string;
  createdAt: string;
}

interface ShoppingList {
  id: string;
  name: string;
  recipeCount: number;
  createdAt: string;
}

type TabType = 'uploaded' | 'saved' | 'planned' | 'shopping-list';

export default function MyRecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('uploaded');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [data, setData] = useState<{
    uploaded: Recipe[];
    saved: Recipe[];
    planned: Recipe[];
    'shopping-list': ShoppingList[];
  }>({
    uploaded: [],
    saved: [],
    planned: [],
    'shopping-list': []
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchUserRecipes = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users/recipes?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data = await response.json();
      // Map _id to id for consistency
      return (data.recipes || []).map((recipe: any) => ({
        ...recipe,
        id: recipe._id,
        image: recipe.primaryImageUrl || (recipe.images && recipe.images.length > 0 ? recipe.images[0].url : '/placeholder-recipe.svg')
      }));
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      return [];
    }
  }, []);

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    setDeleting(recipeId);
    try {
      const response = await fetch('/api/users/recipes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete recipe');
      }

      // Refresh data after deletion
      loadUserData();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const loadUserData = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Parallel fetching for better performance
      const [plannedResponse, userRecipes, favoritesResponse] = await Promise.all([
        fetch('/api/users/planned-recipes').catch(e => { console.error('Error fetching planned recipes:', e); return null; }),
        fetchUserRecipes(session.user.id),
        fetch('/api/favorites').catch(e => { console.error('Error fetching favorites:', e); return null; })
      ]);

      let plannedRecipes: Recipe[] = [];
      if (plannedResponse && plannedResponse.ok) {
        const plannedData = await plannedResponse.json();
        const rawPlannedRecipes = plannedData.data || [];
        
        const seenIds = new Set();
        plannedRecipes = rawPlannedRecipes.filter((recipe: Recipe) => {
          if (seenIds.has(recipe.id)) {
            console.warn(`Duplicate recipe ID found: ${recipe.id}, skipping duplicate`);
            return false;
          }
          seenIds.add(recipe.id);
          return true;
        });
      }

      let savedRecipes: Recipe[] = [];
      if (favoritesResponse && favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        savedRecipes = (favoritesData.favorites || []).map((fav: Favorite) => ({
          id: fav.recipeId,
          title: fav.recipeTitle || 'Recipe',
          description: '',
          image: fav.recipeImage || '/placeholder-recipe.svg',
          cookingTime: 30,
          difficulty: 'medium' as const,
          category: 'Various',
          isPublic: true,
          createdAt: fav.createdAt
        }));
      }

      setData({
        uploaded: userRecipes,
        saved: savedRecipes,
        planned: plannedRecipes,
        'shopping-list': [
          { id: 'sl1', name: 'Weekly Groceries', recipeCount: 5, createdAt: '2024-09-21' },
          { id: 'sl2', name: 'Dinner Party Prep', recipeCount: 3, createdAt: '2024-09-20' },
        ]
      });

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [status, session, fetchUserRecipes]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      loadUserData();
    }
  }, [status, loadUserData, router]);

  const filteredItems = data[activeTab].filter(item => {
    if (activeTab === 'shopping-list') {
      const shoppingList = item as ShoppingList;
      return shoppingList.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    const recipe = item as Recipe;
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Italian', 'Indian', 'Mediterranean', 'Dessert'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Recipes</h1>
            <p className="text-gray-600">Manage your uploaded, saved, and planned recipes</p>
          </div>
        </div>
        <Link
          href="/user/my_added_recipes/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Recipe</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('uploaded')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'uploaded' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Uploaded ({data.uploaded.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'saved' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Saved ({data.saved.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('planned')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'planned' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Planned ({data.planned.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('shopping-list')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'shopping-list' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>My Shopping List ({data['shopping-list'].length})</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'shopping-list' ? 'Search shopping lists...' : 'Search recipes...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        {activeTab !== 'shopping-list' && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'shopping-list' ? (
            (filteredItems as ShoppingList[]).map((list) => (
              <div key={list.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="relative h-48 flex items-center justify-center bg-gray-100 rounded-t-lg">
                  <ShoppingCart className="h-16 w-16 text-gray-300" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{list.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{list.recipeCount} recipes</p>
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Link
                      href={`#`}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      View List
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            (filteredItems as Recipe[]).map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={recipe.image || recipe.primaryImageUrl || '/placeholder-recipe.svg'}
                    alt={recipe.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  {activeTab === 'uploaded' && (
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recipe.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {recipe.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  )}
                  {activeTab === 'planned' && recipe.plannedDate && (
                    <div className="absolute top-2 right-2 space-y-1">
                      <span className="block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {new Date(recipe.plannedDate).toLocaleDateString()}
                      </span>
                      {recipe.mealType && (
                        <span className="block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {recipe.mealType}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{recipe.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
                  
                  {activeTab === 'planned' && recipe.notes && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <span className="font-medium text-yellow-800">Note:</span>
                      <span className="text-yellow-700 ml-1">{recipe.notes}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500">{recipe.cookingTime} min</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                    <span className="text-primary font-medium">{recipe.category}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {activeTab === 'planned' && recipe.weekRange ? (
                        <div>
                          <div>{recipe.weekRange}</div>
                          <div>Added {new Date(recipe.createdAt).toLocaleDateString()}</div>
                          {recipe.servings && (
                            <div className="mt-1 text-blue-600">
                              {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>Added {new Date(recipe.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/recipe/${recipe._id}`}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        View Recipe
                      </Link>
                      {activeTab === 'uploaded' && (
                        <button
                          onClick={() => handleDeleteRecipe(recipe._id)}
                          disabled={deleting === recipe._id}
                          className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                          aria-label="Delete recipe"
                        >
                          {deleting === recipe._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'shopping-list' ? 'No shopping lists found' : 'No recipes found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'uploaded' && "You haven't uploaded any recipes yet."}
            {activeTab === 'saved' && "You haven't saved any recipes yet."}
            {activeTab === 'planned' && "You don't have any planned recipes."}
            {activeTab === 'shopping-list' && "You don't have any shopping lists yet."}
          </p>
          {activeTab === 'uploaded' && (
            <Link
              href="/user/my_added_recipes/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Your First Recipe</span>
            </Link>
          )}
           {activeTab === 'saved' && (
            <Link
              href="/recipe"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore Recipes</span>
            </Link>
          )}
          {activeTab === 'planned' && (
            <Link
              href="/user/meal-plan/current"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Start Meal Planning</span>
            </Link>
          )}
          {activeTab === 'shopping-list' && (
            <Link
              href="#" // Link to a page to create a new shopping list
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Shopping List</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
