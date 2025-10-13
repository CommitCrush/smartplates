'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Pagination } from '@/components/ui/pagination';
import { useAllRecipes } from '@/hooks/useRecipes';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { RecipeFilters } from '@/components/recipe/RecipeFilters';
import { ActiveFilters } from '@/components/recipe/ActiveFilters';
import { fuzzySearchRecipes, filterRecipesByDifficulty } from '@/utils/fuzzySearch';
import type { Recipe } from '@/types/recipe';

export default function RecipePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedAllergy, setSelectedAllergy] = useState('');
  const [communityOnly, setCommunityOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Auth and routing
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Separate API-Aufruf für Dropdown-Filter vs. Search
  const hasSearchQuery = searchQuery.trim().length > 0;
  
  // Intelligente API-Aufrufe basierend auf Modus
  const apiOptions = useMemo(() => {
    if (hasSearchQuery) {
      // Search-Modus: alle Rezepte ungefiltert holen für präzise client-side Filterung
      return {
        number: '500', // Erhöht für alle Rezepte
        randomize: 'false',
        // KEINE API-Filter bei Search - nur client-side filtering
      };
    } else {
      // Dropdown-Filter-Modus: alle Rezepte laden für client-side Pagination
      const options: Record<string, string> = {
        type: selectedCategory,
        diet: selectedDiet,
        intolerances: selectedAllergy,
        number: '500', // Lade alle Rezepte für client-side Pagination
        page: '1', // Immer erste Seite da wir client-side paginieren
      };

      if (selectedDifficulty === 'easy') {
        options.maxReadyTime = '15';
      } else if (selectedDifficulty === 'medium') {
        options.maxReadyTime = '34';  // Updated: Medium bis 34 Min
      }

      // Randomize nur beim ersten Laden
      options.randomize = 'true';

      return options;
    }
  }, [selectedCategory, selectedDiet, selectedAllergy, selectedDifficulty, isAuthenticated, hasSearchQuery]); // Entfernt page dependency

  const { recipes: rawRecipes, error, loading, hasMore, total } = useAllRecipes('', apiOptions);

  // Client-side filtering for all filter combinations
  const allFilteredRecipes = useMemo(() => {
    console.log('🔍 Client-side filtering started:', {
      totalRecipes: rawRecipes.length,
      hasSearchQuery,
      searchQuery: `"${searchQuery}"`,
      selectedCategory,
      selectedDiet,
      selectedAllergy,
      selectedDifficulty
    });

    let filtered = rawRecipes;

    // 1. Search Filter (Title & Ingredients) - only when Search Query present
    if (hasSearchQuery && searchQuery.trim()) {
      filtered = fuzzySearchRecipes(filtered, searchQuery);
      console.log(`After Search "${searchQuery}":`, filtered.length);
    }

    // 2. Category Filter (client-side when Search active)
    if (hasSearchQuery && selectedCategory) {
      filtered = filtered.filter(recipe => 
        recipe.dishTypes?.some(type => 
          type.toLowerCase() === selectedCategory.toLowerCase()
        ) ||
        recipe.cuisines?.some(cuisine => 
          cuisine.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
      console.log(`After Category "${selectedCategory}":`, filtered.length);
    }

    // 3. Diet Filter (client-side when Search active)
    if (hasSearchQuery && selectedDiet) {
      filtered = filtered.filter(recipe => 
        recipe.diets?.some(diet => 
          diet.toLowerCase() === selectedDiet.toLowerCase()
        )
      );
      console.log(`After Diet "${selectedDiet}":`, filtered.length);
    }

    // 4. Allergy/Intolerance Filter (client-side when Search active)
    if (hasSearchQuery && selectedAllergy) {
      filtered = filtered.filter(recipe => {
        // Check if recipe does NOT contain the allergen
        const ingredients = recipe.extendedIngredients || [];
        return !ingredients.some(ingredient => {
          const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
          return ingredientName.includes(selectedAllergy.toLowerCase());
        });
      });
      console.log(`After Allergy filter "${selectedAllergy}":`, filtered.length);
    }

    // 5. Difficulty Filter (always client-side)
    if (selectedDifficulty) {
      filtered = filterRecipesByDifficulty(filtered, selectedDifficulty);
      console.log(`After Difficulty "${selectedDifficulty}":`, filtered.length);
    }

    // 6. Community Filter (always client-side) - includes both admin (chef) and user-created recipes
    if (communityOnly) {
      filtered = filtered.filter(recipe => 
        recipe.source === 'community' || recipe.source === 'chef'
      );
      console.log(`After Community filter (chef + user recipes):`, filtered.length);
    }

    console.log('🎯 Final filtered results:', filtered.length);
    return filtered;
  }, [rawRecipes, hasSearchQuery, searchQuery, selectedCategory, selectedDiet, selectedAllergy, selectedDifficulty, communityOnly]);

  // Client-side Pagination (only for Search results)
  const RECIPES_PER_PAGE = isAuthenticated ? 30 : 15; // Authenticated: 3×10, Viewer: 3×5
  const totalFilteredPages = Math.ceil(allFilteredRecipes.length / RECIPES_PER_PAGE);
  
  // Debug pagination
  console.log('Pagination Debug:', {
    totalRecipes: allFilteredRecipes.length,
    recipesPerPage: RECIPES_PER_PAGE,
    currentPage: page,
    totalPages: totalFilteredPages,
    isAuthenticated
  });
  
  const displayedRecipes = useMemo(() => {
    // Always apply client-side pagination
    const startIndex = (page - 1) * RECIPES_PER_PAGE;
    const endIndex = startIndex + RECIPES_PER_PAGE;
    const sliced = allFilteredRecipes.slice(startIndex, endIndex);
    
    console.log('Display Debug:', {
      startIndex,
      endIndex,
      slicedLength: sliced.length,
      page,
      recipesPerPage: RECIPES_PER_PAGE
    });
    
    return sliced;
  }, [allFilteredRecipes, page, RECIPES_PER_PAGE]); // Always paginate

  // Reset page when any filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedDiet, selectedAllergy, isAuthenticated]); // Added isAuthenticated

  // Auto-scroll to top when page changes OR when filters change
  useEffect(() => {
    if (page > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page]);

  // Auto-scroll to top when any filter changes (including search input)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedDiet, selectedAllergy]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedDiet('');
    setSelectedAllergy('');
    setCommunityOnly(false);
    setPage(1);
  };

  const generateUniqueKey = (recipe: Recipe) => {
    const objId = (recipe as unknown as { _id?: string | null })._id;
    return (typeof objId === 'string' && objId) || 
           (recipe.spoonacularId ? String(recipe.spoonacularId) : recipe.title);
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
            {isAuthenticated 
              ? 'Discover delicious recipes from our community - First page randomized, then paginated'
              : 'Browse our collection of amazing recipes - Always randomly displayed'
            }
          </p>
        </div>

        {/* Search and Filters */}
        <RecipeFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          selectedDiet={selectedDiet}
          setSelectedDiet={setSelectedDiet}
          selectedAllergy={selectedAllergy}
          setSelectedAllergy={setSelectedAllergy}
          communityOnly={communityOnly}
          setCommunityOnly={setCommunityOnly}
          onFilterChange={handleFilterChange}
        />

        {/* Active Filters Display */}
        <ActiveFilters
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          selectedDifficulty={selectedDifficulty}
          selectedDiet={selectedDiet}
          selectedAllergy={selectedAllergy}
          communityOnly={communityOnly}
          onRemoveSearch={() => setSearchQuery('')}
          onRemoveCategory={() => setSelectedCategory('')}
          onRemoveDifficulty={() => setSelectedDifficulty('')}
          onRemoveDiet={() => setSelectedDiet('')}
          onRemoveAllergy={() => setSelectedAllergy('')}
          onRemoveCommunity={() => setCommunityOnly(false)}
          onClearAll={clearAllFilters}
        />

  {/* Loading State */}
  {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
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
            {/* Debug Info */}
            <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
              Debug: Seite {page} von {totalFilteredPages} | 
              Zeige {displayedRecipes.length} von {allFilteredRecipes.length} Rezepten |
              Pro Seite: {RECIPES_PER_PAGE}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRecipes.map((recipe: Recipe) => (
                <RecipeCard key={generateUniqueKey(recipe)} recipe={recipe} />
              ))}
            </div>
            
            {/* Unified Pagination - always client-side */}
            {allFilteredRecipes.length > RECIPES_PER_PAGE && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalFilteredPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && displayedRecipes.length === 0 && (
          <Card className="p-12 text-center">
            <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recipes Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory || selectedDifficulty || selectedDiet || selectedAllergy
                ? 'Try adjusting your search filters'
                : 'No recipes available at the moment'
              }
            </p>
            {(searchQuery || selectedCategory || selectedDifficulty || selectedDiet || selectedAllergy) && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
