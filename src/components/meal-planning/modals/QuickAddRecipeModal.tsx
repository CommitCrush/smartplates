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
import { useAllRecipes } from '@/services/mockRecipeService';
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [maxCookingTime, setMaxCookingTime] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [selectedAllergy, setSelectedAllergy] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>(['all', 'breakfast', 'lunch', 'dinner', 'snacks']);

  // Load recipes when modal opens
  const { recipes, error, loading } = useAllRecipes(searchQuery, {
    type: selectedCategory !== 'all' ? selectedCategory : undefined,
    diet: selectedDiet !== 'all' ? selectedDiet : undefined,
    maxReadyTime: maxCookingTime !== 'all' ? Number(maxCookingTime) : undefined
  });

  // Filter recipes when search/filters change
  useEffect(() => {
    let filtered = [...recipes];
    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(query) ||
        (recipe.description && recipe.description.toLowerCase().includes(query)) ||
        (recipe.ingredients && recipe.ingredients.some(ingredient => ingredient.name.toLowerCase().includes(query)))
      );
    }
    // MealType/Kategorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => recipe.mealType === selectedCategory);
    }
    // Diät
    if (selectedDiet !== 'all') {
      filtered = filtered.filter(recipe => recipe.tags?.map(tag => tag.toLowerCase()).includes(selectedDiet.toLowerCase()));
    }
    // Kochzeit
    if (maxCookingTime !== 'all') {
      filtered = filtered.filter(recipe => recipe.totalTime <= Number(maxCookingTime));
    }
    setFilteredRecipes(filtered);
  }, [recipes, searchQuery, selectedCategory, maxCookingTime, selectedDiet]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const allRecipes = await MockRecipeService.getAllRecipes();
      setRecipes(allRecipes);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryList = await MockRecipeService.getCategories();
      setCategories(categoryList);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const filterRecipes = () => {
    let filtered = [...recipes];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(query)
        ) ||
        recipe.tags.some(tag => 
          tag.toLowerCase().includes(query)
        )
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => 
        recipe.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    // Cooking time filter
    if (maxCookingTime !== 'all') {
      const maxTime = parseInt(maxCookingTime);
      filtered = filtered.filter(recipe => 
        (recipe.cookingTime + recipe.prepTime) <= maxTime
      );
    }

    // Diet filter
    if (selectedDiet !== 'all') {
      filtered = filtered.filter(recipe => {
        switch (selectedDiet) {
          case 'vegetarian':
            return recipe.isVegetarian;
          case 'vegan':
            return recipe.tags.some(tag => tag.toLowerCase().includes('vegan'));
          case 'gluten-free':
            return recipe.tags.some(tag => tag.toLowerCase().includes('gluten-free'));
          case 'keto':
            return recipe.tags.some(tag => tag.toLowerCase().includes('keto'));
          case 'paleo':
            return recipe.tags.some(tag => tag.toLowerCase().includes('paleo'));
          default:
            return true;
        }
      });
    }

    // Allergy filter (exclude recipes with specific allergens)
    if (selectedAllergy !== 'all') {
      filtered = filtered.filter(recipe => {
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

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-32 bg-white border-gray-300 hover:border-gray-400 focus:border-primary">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all" className="hover:bg-gray-50">Any Level</SelectItem>
                  <SelectItem value="easy" className="hover:bg-gray-50">Easy</SelectItem>
                  <SelectItem value="medium" className="hover:bg-gray-50">Medium</SelectItem>
                  <SelectItem value="hard" className="hover:bg-gray-50">Hard</SelectItem>
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
                  <SelectItem value="gluten-free" className="hover:bg-gray-50">🌾 Gluten-Free</SelectItem>
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
            {isLoading ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredRecipes.map(recipe => {
                  const totalTime = recipe.cookingTime + recipe.prepTime;
                  
                  return (
                    <div
                      key={recipe.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm leading-tight pr-2 flex-1">
                          {recipe.title}
                        </h4>
                        <Button
                          size="sm"
                          onClick={() => handleAddRecipe(recipe)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {recipe.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{totalTime}min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{recipe.servings}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{recipe.rating}</span>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {recipe.difficulty}
                          </Badge>
                          {recipe.isVegetarian && (
                            <Badge variant="outline" className="text-xs px-1 py-0 text-green-600">
                              Veggie
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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