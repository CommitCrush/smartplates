'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Users } from 'lucide-react';

interface RecipeFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedDiet: string;
  setSelectedDiet: (diet: string) => void;
  selectedAllergy: string;
  setSelectedAllergy: (allergy: string) => void;
  communityOnly: boolean;
  setCommunityOnly: (communityOnly: boolean) => void;
  onFilterChange: () => void;
}

export function RecipeFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedDiet,
  setSelectedDiet,
  selectedAllergy,
  setSelectedAllergy,
  communityOnly,
  setCommunityOnly,
  onFilterChange
}: RecipeFiltersProps) {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);
  const [dietDropdownOpen, setDietDropdownOpen] = useState(false);
  const [allergyDropdownOpen, setAllergyDropdownOpen] = useState(false);

  // Refs for closing dropdowns
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);
  const dietDropdownRef = useRef<HTMLDivElement>(null);
  const allergyDropdownRef = useRef<HTMLDivElement>(null);

  // Filter options
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

  // Close dropdowns on outside click
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

  return (
    <div className="bg-background-card border border-border rounded-lg p-6 mb-8 sticky top-16 z-30 shadow-lg">
      {/* Top Row: Search + Community Button */}
      <div className="flex gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1">
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

        {/* Community Button */}
        <button
          onClick={() => {
            setCommunityOnly(!communityOnly);
            onFilterChange();
          }}
          className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-between whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm">
              {communityOnly ? 'Community (Chef + User)' : 'Community Recipes'}
            </span>
          </div>
          {communityOnly && (
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          )}
        </button>
      </div>

      {/* Bottom Row: All Filter Dropdowns in one row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    onFilterChange();
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
                    onFilterChange();
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
                    onFilterChange();
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
                    onFilterChange();
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
  );
}
