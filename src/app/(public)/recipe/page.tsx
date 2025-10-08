'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, ChefHat, ChevronDown } from 'lucide-react';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Pagination } from '@/components/ui/pagination';
import { useAllRecipes } from '@/hooks/useRecipes';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';

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
  const [maxReadyTime, setMaxReadyTime] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  // Auth and routing
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Refs for closing dropdowns on outside click
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);
  const dietDropdownRef = useRef<HTMLDivElement>(null);
  const allergyDropdownRef = useRef<HTMLDivElement>(null);

  // Filter option lists
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
    { value: 'main course', label: 'Lunch' },
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
    if (selectedDifficulty === 'easy') {
      setMaxReadyTime('15'); // Easy: bis 15 Minuten
    } else if (selectedDifficulty === 'medium') {
      setMaxReadyTime('30'); // Medium: bis 30 Minuten (wird client-seitig auf 15-30 gefiltert)
    } else {
      setMaxReadyTime(undefined);
    }
    // Reset pagination when difficulty changes
    setPage(1);
  }, [selectedDifficulty]);

  const fetchOptions = useMemo(() => {
    const options: Record<string, string> = {
      type: selectedCategory,
      diet: selectedDiet,
      intolerances: selectedAllergy,
      number: isAuthenticated ? '30' : '15', // 30 for users, 15 for viewers
      page: String(page),
    };

    if (maxReadyTime) {
      options.maxReadyTime = maxReadyTime;
    }

    // Randomization logic:
    // - Viewers (not authenticated): always randomized on every page
    // - Users (authenticated): only randomized on first page OR when filters change
    if (!isAuthenticated || page === 1) {
      options.randomize = 'true';
    }

    return options;
  }, [selectedCategory, selectedDiet, selectedAllergy, maxReadyTime, page, isAuthenticated]);

  const { recipes, error, loading, hasMore, total } = useAllRecipes(searchQuery, fetchOptions);

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
            {isAuthenticated 
              ? 'Discover delicious recipes from our community - First page randomized, then paginated'
              : 'Browse our collection of amazing recipes - Always randomly displayed'
            }
          </p>
        </div>


  {/* Search and Filters - sticky */}
  <div className="bg-background-card border border-border rounded-lg p-6 mb-8 sticky top-16 z-30 shadow-lg">
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
                        setPage(1);
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
                        setPage(1);
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
                        setPage(1);
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
          </div>
        </div>

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
              {recipes
                .filter((recipe) => {
                  if (!selectedDifficulty) return true;
                  
                  const cookTime = recipe.readyInMinutes || 0;
                  
                  // Easy: bis 15 Minuten (bereits durch API gefiltert)
                  if (selectedDifficulty === 'easy') return true;
                  
                  // Medium: 15 bis 30 Minuten (client-seitig filtern)
                  if (selectedDifficulty === 'medium') return cookTime >= 15 && cookTime <= 30;
                  
                  // Hard: ab 30 Minuten
                  if (selectedDifficulty === 'hard') return cookTime > 30;
                  
                  return true;
                })
                .filter((recipe) => {
                  // Intelligente Fuzzy-Suchfilterung
                  if (!searchQuery) return true;
                  
                  const query = searchQuery.toLowerCase().trim();
                  const title = recipe.title.toLowerCase();
                  
                  // Hilfsfunktion für Ähnlichkeitsprüfung (Levenshtein Distance)
                  const calculateSimilarity = (str1: string, str2: string): number => {
                    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
                    
                    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
                    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
                    
                    for (let j = 1; j <= str2.length; j++) {
                      for (let i = 1; i <= str1.length; i++) {
                        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                        matrix[j][i] = Math.min(
                          matrix[j][i - 1] + 1, // deletion
                          matrix[j - 1][i] + 1, // insertion
                          matrix[j - 1][i - 1] + indicator // substitution
                        );
                      }
                    }
                    
                    const distance = matrix[str2.length][str1.length];
                    const maxLength = Math.max(str1.length, str2.length);
                    return (maxLength - distance) / maxLength; // Similarity score 0-1
                  };

                  // Hilfsfunktion für Wort-basierte Suche
                  const findSimilarWords = (searchTerm: string, text: string, threshold: number = 0.7): boolean => {
                    const searchWords = searchTerm.split(' ').filter(word => word.length > 2);
                    const textWords = text.split(/\s+|,|\.|;/).filter(word => word.length > 2);
                    
                    return searchWords.some(searchWord => {
                      return textWords.some(textWord => {
                        // Exakte Übereinstimmung oder Teilstring
                        if (textWord.includes(searchWord) || searchWord.includes(textWord)) {
                          return true;
                        }
                        
                        // Ähnlichkeitsprüfung für längere Wörter (>3 Zeichen)
                        if (searchWord.length > 3 && textWord.length > 3) {
                          const similarity = calculateSimilarity(searchWord, textWord);
                          return similarity >= threshold;
                        }
                        
                        return false;
                      });
                    });
                  };

                  // Erweiterte Suche mit verschiedenen Methoden
                  
                  // 1. Exakte Übereinstimmung (höchste Priorität)
                  const exactTitleMatch = title.includes(query);
                  if (exactTitleMatch) return true;

                  // 2. Exakte Zutat-Übereinstimmung
                  const ingredients = recipe.extendedIngredients || [];
                  const exactIngredientMatch = ingredients.some(ingredient => {
                    const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
                    return ingredientName.includes(query);
                  });
                  if (exactIngredientMatch) return true;

                  // 3. Fuzzy-Suche im Titel (bei längeren Suchbegriffen)
                  if (query.length > 3) {
                    const fuzzyTitleMatch = findSimilarWords(query, title, 0.75);
                    if (fuzzyTitleMatch) return true;

                    // 4. Fuzzy-Suche in Zutaten
                    const fuzzyIngredientMatch = ingredients.some(ingredient => {
                      const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
                      return findSimilarWords(query, ingredientName, 0.75);
                    });
                    if (fuzzyIngredientMatch) return true;
                  }

                  // 5. Häufige Tippfehler und Synonyme
                  const commonMisspellings: { [key: string]: string[] } = {
                    'pasta': ['pata', 'past', 'nudel', 'nudeln'],
                    'chicken': ['chiken', 'chicen', 'chikken', 'hähnchen', 'huhn'],
                    'tomato': ['tomate', 'tomaten', 'tomatoe', 'tomatos'],
                    'cheese': ['chese', 'käse', 'ches', 'chees'],
                    'chocolate': ['choclate', 'schokolade', 'schoko', 'chocolat'],
                    'mushroom': ['mushrom', 'pilz', 'pilze', 'champignon', 'mushrooms'],
                    'potato': ['potatoe', 'kartoffel', 'kartoffeln', 'potatos'],
                    'salmon': ['salomon', 'lachs', 'salmoon'],
                    'beef': ['rindfleisch', 'rind', 'beaf'],
                    'pork': ['schwein', 'schweinefleisch', 'prok'],
                    'soup': ['sope', 'supe', 'soupe', 'suppe'],
                  };

                  // Prüfe auf häufige Tippfehler
                  const checkMisspellings = (): boolean => {
                    for (const [correct, variants] of Object.entries(commonMisspellings)) {
                      // Prüfe, ob Suchbegriff eine Variante ist
                      const isVariant = variants.some(variant => 
                        query === variant || query.includes(variant) || variant.includes(query)
                      );
                      
                      if (isVariant) {
                        // Prüfe, ob das korrekte Wort im Rezept vorkommt
                        const hasCorrectWord = title.includes(correct) || 
                          ingredients.some(ingredient => {
                            const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
                            return ingredientName.includes(correct);
                          });
                        if (hasCorrectWord) {
                          console.log(`🔧 Tippfehler korrigiert: "${query}" → "${correct}" für Rezept: "${recipe.title}"`);
                          return true;
                        }
                      }
                    }
                    return false;
                  };

                  const misspellingMatch = checkMisspellings();
                  if (misspellingMatch) return true;

                  // 6. Erweiterte Ähnlichkeitssuche für kurze Begriffe
                  if (query.length >= 4) {
                    // Suche nach ähnlichen Wörtern in Titel
                    const titleWords = title.split(/\s+/);
                    const titleSimilarityMatch = titleWords.some(word => {
                      if (word.length >= 4) {
                        const similarity = calculateSimilarity(query, word);
                        if (similarity >= 0.7) {
                          console.log(`🎯 Ähnlichkeit gefunden: "${query}" → "${word}" (${Math.round(similarity * 100)}%) in "${recipe.title}"`);
                          return true;
                        }
                      }
                      return false;
                    });
                    if (titleSimilarityMatch) return true;

                    // Suche nach ähnlichen Wörtern in Zutaten
                    const ingredientSimilarityMatch = ingredients.some(ingredient => {
                      const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
                      const ingredientWords = ingredientName.split(/\s+/);
                      return ingredientWords.some(word => {
                        if (word.length >= 4) {
                          const similarity = calculateSimilarity(query, word);
                          if (similarity >= 0.7) {
                            console.log(`🥘 Zutat-Ähnlichkeit: "${query}" → "${word}" (${Math.round(similarity * 100)}%) in "${recipe.title}"`);
                            return true;
                          }
                        }
                        return false;
                      });
                    });
                    if (ingredientSimilarityMatch) return true;
                  }

                  // Debug-Log für Entwicklung
                  if (process.env.NODE_ENV === 'development' && query === 'chiken') {
                    console.log(`❌ Kein Match für "${query}" in "${recipe.title}"`);
                    console.log('Titel:', title);
                    console.log('Zutaten:', ingredients.map(i => i.name || i.originalName));
                  }

                  return false;
                })
                .slice(0, 30) // Limit to 30 recipes (3 columns × 10 rows)
                .map((recipe) => {
                  const objId = (recipe as unknown as { _id?: string | null })._id;
                  const safeKey = (typeof objId === 'string' && objId) || (recipe.spoonacularId ? String(recipe.spoonacularId) : recipe.title);
                  return <RecipeCard key={safeKey} recipe={recipe} />;
                })}
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
                  setSelectedDiet('');
                  setSelectedAllergy('');
                  setPage(1);
                  setShowMore(false);
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
