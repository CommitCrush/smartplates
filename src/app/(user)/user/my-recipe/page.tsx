/**
 * User My Recipes Page
 * 
 * Shows all user's planned, uploaded, and saved recipes in organized tabs
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BookOpen, Heart, Upload, Calendar, Plus, Search, Filter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  isPublic: boolean;
  createdAt: string;
  plannedDate?: string;
}

type TabType = 'uploaded' | 'saved' | 'planned';

export default function MyRecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('uploaded');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [recipes, setRecipes] = useState<{
    uploaded: Recipe[];
    saved: Recipe[];
    planned: Recipe[];
  }>({
    uploaded: [],
    saved: [],
    planned: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      loadUserRecipes();
    }
  }, [status, router]);

  const loadUserRecipes = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockRecipes = {
        uploaded: [
          {
            id: '1',
            title: 'My Famous Pasta Carbonara',
            description: 'A family recipe passed down for generations',
            image: '/placeholder-recipe.svg',
            cookingTime: 25,
            difficulty: 'medium' as const,
            category: 'Italian',
            isPublic: true,
            createdAt: '2024-09-20'
          },
          {
            id: '2',
            title: 'Homemade Pizza Margherita',
            description: 'Fresh mozzarella and basil on homemade dough',
            image: '/placeholder-recipe.svg',
            cookingTime: 45,
            difficulty: 'hard' as const,
            category: 'Italian',
            isPublic: false,
            createdAt: '2024-09-18'
          }
        ],
        saved: [
          {
            id: '3',
            title: 'Chicken Tikka Masala',
            description: 'Creamy and flavorful Indian curry',
            image: '/placeholder-recipe.svg',
            cookingTime: 40,
            difficulty: 'medium' as const,
            category: 'Indian',
            isPublic: true,
            createdAt: '2024-09-19'
          },
          {
            id: '4',
            title: 'Chocolate Chip Cookies',
            description: 'Classic homemade cookies',
            image: '/placeholder-recipe.svg',
            cookingTime: 15,
            difficulty: 'easy' as const,
            category: 'Dessert',
            isPublic: true,
            createdAt: '2024-09-17'
          }
        ],
        planned: [
          {
            id: '5',
            title: 'Greek Salad',
            description: 'Fresh Mediterranean salad with feta',
            image: '/placeholder-recipe.svg',
            cookingTime: 10,
            difficulty: 'easy' as const,
            category: 'Mediterranean',
            isPublic: true,
            createdAt: '2024-09-16',
            plannedDate: '2024-09-25'
          }
        ]
      };
      setRecipes(mockRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes[activeTab].filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
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
          <span>Uploaded ({recipes.uploaded.length})</span>
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
          <span>Saved ({recipes.saved.length})</span>
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
          <span>Planned ({recipes.planned.length})</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
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
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <Image
                  src={recipe.image}
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
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {new Date(recipe.plannedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{recipe.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
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
                  <span className="text-xs text-gray-500">
                    Added {new Date(recipe.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/recipe/${recipe.id}`}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    View Recipe
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'uploaded' && "You haven't uploaded any recipes yet."}
            {activeTab === 'saved' && "You haven't saved any recipes yet."}
            {activeTab === 'planned' && "You don't have any planned recipes."}
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
              <Search className="h-4 w-4" />
              <span>Explore Recipes</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}