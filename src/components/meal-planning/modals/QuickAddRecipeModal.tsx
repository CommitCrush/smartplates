/**
 * Quick Add Recipe Modal
 * 
 * Modal for searching and adding recipes to meal slots
 * Uses mock recipe service until real recipe system is ready
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Clock, 
  Users, 
  Filter, 
  X, 
  Plus,
  Star,
  Utensils 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAllRecipes } from '@/services/mockRecipeService'; // Now uses Spoonacular API
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ========================================
// Types
// ========================================

interface QuickAddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecipe: (recipeId: string, recipeName: string, servings?: number) => void;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  dayName?: string;
  className?: string;
}

// ========================================
// Main Component
// ========================================

export function QuickAddRecipeModal({
  isOpen,
  onClose,
  onAddRecipe,
  mealType = 'breakfast',
  dayName = 'today',
  className
}: QuickAddRecipeModalProps) {
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxCookingTime, setMaxCookingTime] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [selectedAllergy, setSelectedAllergy] = useState<string>('all');
  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snacks'];
  const mealTypeEmoji: Record<string, string> = {
    breakfast: '🍳',
    lunch: '🥪',
    dinner: '🍽️',
    snacks: '🍪',
  };

  // Load recipes when modal opens
  const { recipes, error, loading } = useAllRecipes(searchQuery, {
    type: selectedCategory !== 'all' ? selectedCategory : undefined,
    diet: selectedDiet !== 'all' ? selectedDiet : undefined,
    maxReadyTime: maxCookingTime !== 'all' ? Number(maxCookingTime) : undefined
  });

  // Filter recipes when search/filters change
  useEffect(() => {
    let filtered = [...recipes];
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(recipe =>
        recipe.title?.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        (recipe.tags && recipe.tags.some((tag: string) => tag.toLowerCase().includes(query)))
      );
    }
    // Filter by mealType automatically
      // Use 'category' for Spoonacular recipes, 'mealType' for local recipes
      if (mealType && mealType !== 'snacks') {
    filtered = filtered.filter(recipe => recipe.category === mealType);
      }
      if (selectedCategory !== 'all') {
    filtered = filtered.filter(recipe => recipe.category === selectedCategory);
      }
    if (selectedDiet !== 'all') {
      filtered = filtered.filter(recipe => recipe.tags?.includes(selectedDiet));
    }
    if (maxCookingTime !== 'all') {
      filtered = filtered.filter(recipe => recipe.totalTime <= Number(maxCookingTime));
    }
    if (selectedAllergy !== 'all') {
      filtered = filtered.filter(recipe =>
        !(recipe.description && recipe.description.toLowerCase().includes(selectedAllergy))
      );
    }
    setFilteredRecipes(filtered);
  }, [recipes, searchQuery, selectedCategory, maxCookingTime, selectedDiet, selectedAllergy, mealType]);

  // Helper: Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMaxCookingTime('all');
    setSelectedDiet('all');
    setSelectedAllergy('all');
  };

  // Helper: Suggest top 5 recipes
  const suggestedRecipes = useMemo(() => {
    return recipes.slice(0, 5);
  }, [recipes]);

  // Helper: Add recipe
  const handleAddRecipe = (recipe: any) => {
    onAddRecipe(recipe.id, recipe.title, recipe.servings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-2xl w-full', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{mealTypeEmoji[mealType]}</span>
            Add Recipe to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Choose a recipe for {dayName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search and Filters */}
          <div className="flex-shrink-0 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search recipes, ingredients, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-white border-gray-300 hover:border-gray-400 focus:border-primary">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all" className="hover:bg-gray-50">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem 
                      key={category} 
                      value={category.toLowerCase()}
                      className="hover:bg-gray-50"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={maxCookingTime} onValueChange={setMaxCookingTime}>
                <SelectTrigger className="w-40 bg-white border-gray-300 hover:border-gray-400 focus:border-primary">
                  <SelectValue placeholder="Max Time" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all" className="hover:bg-gray-50">Any Time</SelectItem>
                  <SelectItem value="15" className="hover:bg-gray-50">Under 15 min</SelectItem>
                  <SelectItem value="30" className="hover:bg-gray-50">Under 30 min</SelectItem>
                  <SelectItem value="60" className="hover:bg-gray-50">Under 1 hour</SelectItem>
                  <SelectItem value="120" className="hover:bg-gray-50">Under 2 hours</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDiet} onValueChange={setSelectedDiet}>
                <SelectTrigger className="w-36 bg-white border-gray-300 hover:border-gray-400 focus:border-primary">
                  <SelectValue placeholder="Diet" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all" className="hover:bg-gray-50">Any Diet</SelectItem>
                  <SelectItem value="vegetarian" className="hover:bg-gray-50">🌱 Vegetarian</SelectItem>
                  <SelectItem value="vegan" className="hover:bg-gray-50">🌿 Vegan</SelectItem>
                  <SelectItem value="gluten free" className="hover:bg-gray-50">🌾 Gluten-Free</SelectItem>
                  <SelectItem value="keto" className="hover:bg-gray-50">🥑 Keto</SelectItem>
                  <SelectItem value="paleo" className="hover:bg-gray-50">🍖 Paleo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedAllergy} onValueChange={setSelectedAllergy}>
                <SelectTrigger className="w-36 bg-white border-gray-300 hover:border-gray-400 focus:border-primary">
                  <SelectValue placeholder="Avoid" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all" className="hover:bg-gray-50">No Restrictions</SelectItem>
                  <SelectItem value="nuts" className="hover:bg-gray-50">🥜 Nuts</SelectItem>
                  <SelectItem value="dairy" className="hover:bg-gray-50">🥛 Dairy</SelectItem>
                  <SelectItem value="eggs" className="hover:bg-gray-50">🥚 Eggs</SelectItem>
                  <SelectItem value="soy" className="hover:bg-gray-50">🌱 Soy</SelectItem>
                  <SelectItem value="shellfish" className="hover:bg-gray-50">🦐 Shellfish</SelectItem>
                  <SelectItem value="fish" className="hover:bg-gray-50">🐟 Fish</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          {/* Quick Suggestions */}
          {suggestedRecipes.length > 0 && !searchQuery && selectedCategory === 'all' && (
            <div className="flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Popular {mealType} recipes
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {suggestedRecipes.map(recipe => (
                  <Button
                    key={recipe.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddRecipe(recipe)}
                    className="flex-shrink-0 whitespace-nowrap"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {recipe.title}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Recipe Results */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Utensils className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-gray-500">Loading recipes...</p>
                </div>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">No recipes found</p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRecipes.map(recipe => (
                  <div
                    key={recipe._id || recipe.title}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary/40 hover:shadow-md transition-all group bg-background-card"
                  >
                    {/* Recipe Image */}
                    <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {recipe.image ? (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl opacity-30">🍽️</div>
                      )}
                    </div>

                    {/* Title & Add Button */}
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-base leading-tight pr-2 flex-1">
                        {recipe.title}
                      </h4>
                      <Button
                        size="sm"
                        onClick={() => handleAddRecipe(recipe)}
                        className="opacity-100 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        aria-label={`Add ${recipe.title}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                      {recipe.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {recipe.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{recipe.totalTime} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{recipe.servings}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-gray-500">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
          </p>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default QuickAddRecipeModal;