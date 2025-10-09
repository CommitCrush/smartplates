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
import { fuzzySearchRecipes, filterRecipesByDifficulty } from '@/utils/fuzzySearch';
import type { Recipe } from '@/types/recipe';

export default function RecipePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedAllergy, setSelectedAllergy] = useState('');
  const [page, setPage] = useState(1);

  // Auth and routing
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Separate API-Aufruf für Dropdown-Filter vs. Search
  const hasSearchQuery = searchQuery.trim().length > 0;
  
  // Intelligente API-Aufrufe basierend auf Modus
  const apiOptions = useMemo(() => {
    if (hasSearchQuery) {
      // Search-Modus: alle Rezepte holen
      return {
        number: '100',
        randomize: 'false',
      };
    } else {
      // Dropdown-Filter-Modus: normale API-basierte Paginierung
      const options: Record<string, string> = {
        type: selectedCategory,
        diet: selectedDiet,
        intolerances: selectedAllergy,
        number: isAuthenticated ? '30' : '15',
        page: String(page),
      };

      if (selectedDifficulty === 'easy') {
        options.maxReadyTime = '15';
      } else if (selectedDifficulty === 'medium') {
        options.maxReadyTime = '30';
      }

      if (!isAuthenticated || page === 1) {
        options.randomize = 'true';
      }

      return options;
    }
  }, [selectedCategory, selectedDiet, selectedAllergy, selectedDifficulty, page, isAuthenticated, hasSearchQuery]);

  const { recipes: rawRecipes, error, loading, hasMore, total } = useAllRecipes('', apiOptions);

  // Client-side Filterung (nur für Search + Difficulty)
  const allFilteredRecipes = useMemo(() => {
    if (!hasSearchQuery) {
      // Dropdown-Filter: verwende API-gefilterte Rezepte direkt
      return filterRecipesByDifficulty(rawRecipes, selectedDifficulty);
    }

    // Search-Modus: vollständige Client-side Filterung
    console.log('🔍 Search-Modus - Client-side filtering:', {
      totalRecipes: rawRecipes.length,
      searchQuery: `"${searchQuery}"`,
      selectedDifficulty
    });

    let filtered = rawRecipes;

    // 1. Difficulty Filter
    if (selectedDifficulty) {
      filtered = filterRecipesByDifficulty(filtered, selectedDifficulty);
      console.log(`Nach Difficulty "${selectedDifficulty}":`, filtered.length);
    }

    // 2. Fuzzy Search (Title & Ingredients)
    if (searchQuery.trim()) {
      filtered = fuzzySearchRecipes(filtered, searchQuery);
      console.log(`Nach Search "${searchQuery}":`, filtered.length);
    }

    console.log('🎯 Search-Ergebnisse final:', filtered.length);
    return filtered;
  }, [rawRecipes, selectedDifficulty, searchQuery, hasSearchQuery]);

  // Client-side Pagination (nur für Search-Ergebnisse)
  const RECIPES_PER_PAGE = 30; // 3 Spalten × 10 Reihen
  const totalFilteredPages = Math.ceil(allFilteredRecipes.length / RECIPES_PER_PAGE);
  
  const displayedRecipes = useMemo(() => {
    if (!hasSearchQuery) {
      // Dropdown-Filter: verwende API-paginierte Rezepte
      return allFilteredRecipes;
    }

    // Search-Modus: client-side Pagination
    const startIndex = (page - 1) * RECIPES_PER_PAGE;
    return allFilteredRecipes.slice(startIndex, startIndex + RECIPES_PER_PAGE);
  }, [allFilteredRecipes, page, hasSearchQuery]);

  // Reset page when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedDiet('');
    setSelectedAllergy('');
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
          onFilterChange={handleFilterChange}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRecipes.map((recipe: Recipe) => (
                <RecipeCard key={generateUniqueKey(recipe)} recipe={recipe} />
              ))}
            </div>
            
            {/* Pagination Logic basierend auf Modus */}
            {hasSearchQuery ? (
              // Search-Modus: Client-side Pagination
              allFilteredRecipes.length > RECIPES_PER_PAGE && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalFilteredPages}
                    onPageChange={setPage}
                  />
                </div>
              )
            ) : (
              // Dropdown-Filter-Modus: API-basierte Pagination
              <>
                {isAuthenticated && rawRecipes.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <Pagination
                      currentPage={page}
                      totalPages={Math.ceil((total || rawRecipes.length) / 30)}
                      onPageChange={setPage}
                    />
                  </div>
                )}
                
                {!isAuthenticated && hasMore && rawRecipes.length >= 15 && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => {
                        router.push('/register');
                      }}
                      variant="outline"
                      size="lg"
                    >
                      Registrieren für mehr Rezepte
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && displayedRecipes.length === 0 && (
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
