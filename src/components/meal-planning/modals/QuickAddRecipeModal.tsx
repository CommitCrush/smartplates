'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAllRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/types/recipe';
import { Search, Plus, ChevronDown, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { Pagination } from '@/components/ui/pagination';

interface QuickAddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecipe: (id: string, title: string, servings: number, cookTime: number, image?: string) => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  dayName: string;
  className?: string;
}

export function QuickAddRecipeModal({
  isOpen,
  onClose,
  onAddRecipe,
  mealType,
  dayName,
  className,
}: QuickAddRecipeModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedAllergy, setSelectedAllergy] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [maxReadyTime, setMaxReadyTime] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);
  const [dietDropdownOpen, setDietDropdownOpen] = useState(false);
  const [allergyDropdownOpen, setAllergyDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);
  const dietDropdownRef = useRef<HTMLDivElement>(null);
  const allergyDropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'main course', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'soup', label: 'Soup' },
  ];

  const difficulties = [
    { value: '', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  const diets = [
    { value: '', label: 'All Diets' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten free', label: 'Gluten-Free' },
    { value: 'ketogenic', label: 'Ketogenic' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'primal', label: 'Primal' },
    { value: 'whole30', label: 'Whole30' },
  ];

  const allergies = [
    { value: '', label: 'Allergies (None)' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'egg', label: 'Egg' },
    { value: 'gluten', label: 'Gluten' },
    { value: 'peanut', label: 'Peanut' },
    { value: 'seafood', label: 'Seafood' },
    { value: 'sesame', label: 'Sesame' },
    { value: 'soy', label: 'Soy' },
    { value: 'sulfite', label: 'Sulfite' },
    { value: 'tree nut', label: 'Tree Nut' },
    { value: 'wheat', label: 'Wheat' },
  ];

  useEffect(() => {
    if (selectedDifficulty === 'easy') {
      setMaxReadyTime('15');
    } else if (selectedDifficulty === 'medium') {
      setMaxReadyTime('30');
    } else {
      setMaxReadyTime(undefined);
    }
    setPage(1);
  }, [selectedDifficulty]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedDiet, selectedAllergy]);

  const fetchOptions = useMemo(
    () => ({
      type: selectedCategory,
      diet: selectedDiet,
      intolerances: selectedAllergy,
      ...(maxReadyTime && { maxReadyTime }),
      number: '500', // Lade alle Rezepte für client-side Pagination (wie Recipe Page)
      page: '1', // Immer erste Seite da wir client-side paginieren
    }),
    [selectedCategory, selectedDiet, selectedAllergy, maxReadyTime] // Entfernt page dependency
  );

  const { recipes, loading, error, total } = useAllRecipes(searchQuery, fetchOptions);

  const filteredRecipes = useMemo(() => {
    if (!selectedDifficulty) return recipes;
    
    return recipes.filter((recipe) => {
      const cookTime = recipe.readyInMinutes || 0;
      
      if (selectedDifficulty === 'easy') return true;
      if (selectedDifficulty === 'medium') return cookTime >= 15 && cookTime <= 30;
      if (selectedDifficulty === 'hard') return cookTime > 30;
      
      return true;
    });
  }, [recipes, selectedDifficulty]);

  // Client-side Pagination (wie Recipe Page)
  const RECIPES_PER_PAGE = 15;
  const totalFilteredPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  
  const displayedRecipes = useMemo(() => {
    const startIndex = (page - 1) * RECIPES_PER_PAGE;
    const endIndex = startIndex + RECIPES_PER_PAGE;
    return filteredRecipes.slice(startIndex, endIndex);
  }, [filteredRecipes, page]);

  const handleAddRecipe = (recipe: Recipe) => {
    const recipeId = recipe.spoonacularId ? String(recipe.spoonacularId) : recipe.title;
    onAddRecipe(
      recipeId,
      recipe.title,
      recipe.servings || 2,
      recipe.readyInMinutes || 30,
      recipe.image
    );
    onClose();
  };

  function getRecipeImage(url?: string) {
    if (!url || typeof url !== 'string') {
      return { src: '/placeholder-recipe.svg', useNextImage: true };
    }
    
    if (url.includes('spoonacular.com')) {
      return { src: url, useNextImage: false };
    }
    
    return { src: url, useNextImage: true };
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (difficultyDropdownRef.current && !difficultyDropdownRef.current.contains(event.target as Node)) {
        setDifficultyDropdownOpen(false);
      }
      if (dietDropdownRef.current && !dietDropdownRef.current.contains(event.target as Node)) {
        setDietDropdownOpen(false);
      }
      if (allergyDropdownRef.current && !allergyDropdownRef.current.contains(event.target as Node)) {
        setAllergyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDiet('');
    setSelectedAllergy('');
    setSelectedDifficulty('');
    setPage(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-6xl h-[80vh] flex flex-col", className)}>
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Recipe to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Choose a recipe for {dayName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pb-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative" ref={categoryDropdownRef}>
              <Button
                variant="outline"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-2"
              >
                {categories.find(c => c.value === selectedCategory)?.label || 'All Categories'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-white border rounded-md shadow-lg min-w-40">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setCategoryDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={difficultyDropdownRef}>
              <Button
                variant="outline"
                onClick={() => setDifficultyDropdownOpen(!difficultyDropdownOpen)}
                className="flex items-center gap-2"
              >
                {difficulties.find(d => d.value === selectedDifficulty)?.label || 'All Difficulties'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {difficultyDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-white border rounded-md shadow-lg min-w-40">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty.value}
                      onClick={() => {
                        setSelectedDifficulty(difficulty.value);
                        setDifficultyDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      {difficulty.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={dietDropdownRef}>
              <Button
                variant="outline"
                onClick={() => setDietDropdownOpen(!dietDropdownOpen)}
                className="flex items-center gap-2"
              >
                {diets.find(d => d.value === selectedDiet)?.label || 'All Diets'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {dietDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-white border rounded-md shadow-lg min-w-40">
                  {diets.map((diet) => (
                    <button
                      key={diet.value}
                      onClick={() => {
                        setSelectedDiet(diet.value);
                        setDietDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      {diet.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={allergyDropdownRef}>
              <Button
                variant="outline"
                onClick={() => setAllergyDropdownOpen(!allergyDropdownOpen)}
                className="flex items-center gap-2"
              >
                {allergies.find(a => a.value === selectedAllergy)?.label || 'Allergies (None)'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {allergyDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-white border rounded-md shadow-lg min-w-40">
                  {allergies.map((allergy) => (
                    <button
                      key={allergy.value}
                      onClick={() => {
                        setSelectedAllergy(allergy.value);
                        setAllergyDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      {allergy.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="flex-1 flex items-center justify-center text-red-600">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-3 gap-4 pb-4">
                  {displayedRecipes.map((recipe) => {
                    const safeKey = recipe.spoonacularId ? String(recipe.spoonacularId) : recipe.title;
                    const imageConfig = getRecipeImage(recipe.image);

                    return (
                      <div
                        key={safeKey}
                        className="group bg-white border rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        <div className="w-full h-40 bg-gray-100 overflow-hidden">
                          {recipe.image ? (
                            imageConfig.useNextImage ? (
                              <Image
                                src={imageConfig.src}
                                alt={recipe.title}
                                width={300}
                                height={160}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={imageConfig.src}
                                alt={recipe.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
                              🍽️
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm leading-tight pr-2 flex-1">
                              {recipe.title}
                            </h4>
                            <Button
                              size="sm"
                              onClick={() => handleAddRecipe(recipe)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{recipe.readyInMinutes || 30} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{recipe.servings || 2}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {filteredRecipes.length > 0 && totalFilteredPages > 1 && (
                <div className="pt-4 border-t border-gray-200">
                  <Pagination
                    currentPage={page}
                    totalPages={totalFilteredPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
