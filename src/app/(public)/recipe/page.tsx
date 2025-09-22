'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, ChefHat, ChevronDown, Plus } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { useAllRecipes } from '@/services/mockRecipeService';
import Link from 'next/link';

export default function RecipePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState('');
  const [dietDropdownOpen, setDietDropdownOpen] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState('');
  const [allergyDropdownOpen, setAllergyDropdownOpen] = useState(false);
  const allergyDropdownRef = useRef<HTMLDivElement>(null);
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
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);
  const dietDropdownRef = useRef<HTMLDivElement>(null);
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

  // Use Spoonacular API for all recipes
  const { recipes, error, loading } = useAllRecipes(searchQuery, {
    type: selectedCategory,
    diet: selectedDiet,
    intolerances: selectedAllergy,
    number: showMore ? 60 : 30,
    // Spoonacular API does not support difficulty, so we filter client-side
  });

  // Close dropdowns when clicking outside
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <div ref={categoryDropdownRef} className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-between"
              >
                <span>{categories.find(c => c.value === selectedCategory)?.label || 'All Categories'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setCategoryDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 first:rounded-t-md last:rounded-b-md"
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Diet Filter */}
            <div ref={dietDropdownRef} className="relative">
              <button
                onClick={() => setDietDropdownOpen(!dietDropdownOpen)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-between"
              >
                <span>{diets.find(d => d.value === selectedDiet)?.label || 'All Diets'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {dietDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10">
                  {diets.map((diet) => (
                    <button
                      key={diet.value}
                      onClick={() => {
                        setSelectedDiet(diet.value);
                        setDietDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 first:rounded-t-md last:rounded-b-md"
                    >
                      {diet.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Allergy Filter */}
            <div ref={allergyDropdownRef} className="relative">
              <button
                onClick={() => setAllergyDropdownOpen(!allergyDropdownOpen)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-between"
              >
                <span>{allergies.find(a => a.value === selectedAllergy)?.label || 'Allergies (None)'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {allergyDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10">
                  {allergies.map((allergy) => (
                    <button
                      key={allergy.value}
                      onClick={() => {
                        setSelectedAllergy(allergy.value);
                        setAllergyDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 first:rounded-t-md last:rounded-b-md"
                    >
                      {allergy.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Difficulty Filter */}
            <div ref={difficultyDropdownRef} className="relative">
              <button
                onClick={() => setDifficultyDropdownOpen(!difficultyDropdownOpen)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-between"
              >
                <span>{difficulties.find(d => d.value === selectedDifficulty)?.label || 'All Difficulties'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {difficultyDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty.value}
                      onClick={() => {
                        setSelectedDifficulty(difficulty.value);
                        setDifficultyDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 first:rounded-t-md last:rounded-b-md"
                    >
                      {difficulty.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Upload Button */}
            <div>
              <Link href="/recipe/upload">
                <button className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <Plus className="h-4 w-4" />
                  Upload Recipe
                </button>
              </Link>
            </div>
          </div>
        </div>

  {/* Loading State */}
  {loading && (
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
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        )}

        {/* Recipe Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes
                .filter((recipe) => {
                  if (!selectedDifficulty) return true;
                  if (selectedDifficulty === 'easy') return recipe.totalTime <= 15;
                  if (selectedDifficulty === 'medium') return recipe.totalTime > 15 && recipe.totalTime <= 30;
                  if (selectedDifficulty === 'hard') return recipe.totalTime > 30;
                  return true;
                })
                .map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </div>
            {!showMore && recipes.length >= 30 && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => {
                    // Require login to load more
                    if (!window.localStorage.getItem('userLoggedIn')) {
                      alert('Bitte registrieren oder einloggen, um mehr Rezepte zu sehen.');
                      return;
                    }
                    setShowMore(true);
                  }}
                  variant="outline"
                  size="lg"
                >
                  Mehr Rezepte anzeigen
                </Button>
              </div>
            )}
          </>
        )}

  {/* Empty State */}
  {!loading && !error && recipes.length === 0 && (
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
