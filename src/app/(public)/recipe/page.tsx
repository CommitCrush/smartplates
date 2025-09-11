'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Users, Star, Heart, ChefHat } from 'lucide-react';
import { Recipe } from '@/types/recipe';

export default function RecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'snack', label: 'Snack' },
  ];

  const difficulties = [
    { value: '', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  useEffect(() => {
    fetchRecipes();
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);

      const response = await fetch(`/api/recipes?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRecipes(data.data);
      } else {
        setError('Failed to load recipes');
      }
    } catch (err) {
      setError('Error loading recipes');
      console.error('Recipes error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breakfast':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'lunch':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'dinner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'dessert':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <ChefHat className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Recipe Collection
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Discover delicious recipes from our community of passionate cooks
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-background-card border border-border rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-neutral-200 dark:bg-neutral-700 rounded-t-lg"></div>
                <div className="p-6">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-16"></div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-12"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-8 text-center">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Button onClick={fetchRecipes}>Retry</Button>
          </Card>
        )}

        {/* Recipe Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                {/* Recipe Image */}
                <div className="h-48 bg-gradient-to-br from-primary-100 to-coral-100 dark:from-primary-900 dark:to-coral-900 flex items-center justify-center">
                  <span className="text-4xl">🍽️</span>
                </div>

                <div className="p-6">
                  {/* Recipe Title */}
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{recipe.title}</h3>
                  
                  {/* Recipe Description */}
                  <p className="text-foreground-muted text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getCategoryColor(recipe.category)}>
                      {recipe.category}
                    </Badge>
                    <Badge className={getDifficultyColor(recipe.difficulty)}>
                      {recipe.difficulty}
                    </Badge>
                    {recipe.dietaryRestrictions.slice(0, 1).map((restriction) => (
                      <Badge key={restriction} variant="outline" className="text-xs">
                        {restriction}
                      </Badge>
                    ))}
                  </div>

                  {/* Recipe Meta */}
                  <div className="flex items-center justify-between text-sm text-foreground-muted mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.totalTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{recipe.servings} servings</span>
                    </div>
                  </div>

                  {/* Rating and Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="font-medium">{recipe.rating}</span>
                      <span className="text-foreground-muted">({recipe.ratingsCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-coral-600">
                      <Heart className="h-4 w-4" />
                      <span>{recipe.likesCount}</span>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-foreground-muted">
                      by <span className="font-medium">{recipe.authorName}</span>
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && recipes.length === 0 && (
          <Card className="p-12 text-center">
            <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recipes Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory || selectedDifficulty
                ? 'Try adjusting your search filters'
                : 'No recipes available at the moment'
              }
            </p>
            {(searchQuery || selectedCategory || selectedDifficulty) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedDifficulty('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
