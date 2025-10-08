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
  const [showMore, setShowMore] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedAllergy, setSelectedAllergy] = useState('');
  const [maxReadyTime, setMaxReadyTime] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  // Auth and routing
  const { isAuthenticated } = useAuth();
  const router = useRouter();

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

  const fetchOptions = useMemo(() => {
    const options: Record<string, string> = {
      type: selectedCategory,
      diet: selectedDiet,
      intolerances: selectedAllergy,
      number: isAuthenticated ? '30' : '15',
      page: String(page),
    };

    if (maxReadyTime) {
      options.maxReadyTime = maxReadyTime;
    }

    if (!isAuthenticated || page === 1) {
      options.randomize = 'true';
    }

    return options;
  }, [selectedCategory, selectedDiet, selectedAllergy, maxReadyTime, page, isAuthenticated]);

  const { recipes, error, loading, hasMore, total } = useAllRecipes('', fetchOptions);

  // Apply filters using utility functions (including search)
  const filteredRecipes = useMemo(() => {
    console.log('🔍 Filtering recipes:', {
      totalRecipes: recipes.length,
      searchQuery,
      selectedDifficulty
    });

    let filtered = filterRecipesByDifficulty(recipes, selectedDifficulty);
    console.log('After difficulty filter:', filtered.length);

    filtered = fuzzySearchRecipes(filtered, searchQuery);
    console.log('After fuzzy search:', filtered.length);

    const result = filtered.slice(0, 30);
    console.log('Final result:', result.length);

    return result;
  }, [recipes, selectedDifficulty, searchQuery]);

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
    setShowMore(false);
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
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={generateUniqueKey(recipe)} recipe={recipe} />
              ))}
            </div>
            
            {/* Pagination for authenticated users */}
            {isAuthenticated && recipes.length > 0 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil((total || recipes.length) / 30)}
                  onPageChange={setPage}
                />
              </div>
            )}
            
            {/* Load More button for viewers */}
            {!isAuthenticated && (hasMore ?? (!showMore && recipes.length >= 15)) && (
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

        {/* Empty State */}
        {!loading && !error && filteredRecipes.length === 0 && (
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
