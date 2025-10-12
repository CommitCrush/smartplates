'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActiveFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  selectedDifficulty: string;
  selectedDiet: string;
  selectedAllergy: string;
  onRemoveSearch: () => void;
  onRemoveCategory: () => void;
  onRemoveDifficulty: () => void;
  onRemoveDiet: () => void;
  onRemoveAllergy: () => void;
  onClearAll: () => void;
}

// Mapping for correct display of filter labels (as in dropdowns)
const DIFFICULTY_LABELS: { [key: string]: string } = {
  'easy': 'Easy',
  'medium': 'Medium', 
  'hard': 'Hard',
};

// Helper function for category display names
const getCategoryDisplayName = (category: string): string => {
  const categoryDisplayMap: { [key: string]: string } = {
    'main course': 'Lunch',     // API value → User-friendly display
    'dinner': 'Dinner',
    'breakfast': 'Breakfast', 
    'dessert': 'Dessert',
    'snack': 'Snack'
  };
  
  return categoryDisplayMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

// Typo correction for search display
const getCorrectSpelling = (query: string): string => {
  const commonMisspellings: { [key: string]: string[] } = {
    'pasta': ['pata', 'past', 'pasta'],
    'chicken': ['chiken', 'chicen', 'chikken', 'chicken'],
    'tomato': ['tomate', 'tomatoe', 'tomatos', 'tomato'],
    'potato': ['potatoe', 'kartoffel', 'kartoffeln', 'potato'],
    'cheese': ['chese', 'ches', 'käse', 'cheese'],
    'mushroom': ['mushrom', 'pilz', 'pilze', 'mushroom'],
    'salmon': ['salomon', 'lachs', 'salmon'],
    'beef': ['beaf', 'bef', 'rindfleisch', 'beef'],
    'pork': ['prok', 'schwein', 'schweinefleisch', 'pork'],
    'soup': ['sope', 'supe', 'soupe', 'suppe', 'soup'],
  };

  const normalizedQuery = query.toLowerCase().trim();
  
  for (const [correct, variants] of Object.entries(commonMisspellings)) {
    if (variants.includes(normalizedQuery)) {
      return correct;
    }
  }
  
  return query; // Return original if no correction found
};

export function ActiveFilters({
  searchQuery,
  selectedCategory,
  selectedDifficulty,
  selectedDiet,
  selectedAllergy,
  onRemoveSearch,
  onRemoveCategory,
  onRemoveDifficulty,
  onRemoveDiet,
  onRemoveAllergy,
  onClearAll,
}: ActiveFiltersProps) {
  const activeFilters = [];

  // Search Query (with corrected spelling)
  if (searchQuery.trim()) {
    const correctedSpelling = getCorrectSpelling(searchQuery);
    activeFilters.push({
      id: 'search',
      label: `"${correctedSpelling}"`,
      onRemove: onRemoveSearch,
    });
  }

  // Category Filter
  if (selectedCategory) {
    activeFilters.push({
      id: 'category',
      label: getCategoryDisplayName(selectedCategory),
      onRemove: onRemoveCategory,
    });
  }

  // Difficulty Filter
  if (selectedDifficulty) {
    activeFilters.push({
      id: 'difficulty',
      label: DIFFICULTY_LABELS[selectedDifficulty] || selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1),
      onRemove: onRemoveDifficulty,
    });
  }

  // Diet Filter
  if (selectedDiet) {
    activeFilters.push({
      id: 'diet',
      label: selectedDiet.charAt(0).toUpperCase() + selectedDiet.slice(1),
      onRemove: onRemoveDiet,
    });
  }

  // Allergy Filter
  if (selectedAllergy) {
    activeFilters.push({
      id: 'allergy',
      label: `No ${selectedAllergy.charAt(0).toUpperCase() + selectedAllergy.slice(1)}`,
      onRemove: onRemoveAllergy,
    });
  }

  // If no filters are active, show nothing
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Filter Buttons - left aligned */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {activeFilters.map((filter) => (
          <Button
            key={filter.id}
            variant="secondary"
            size="sm"
            className="h-8 px-3 py-1 text-sm bg-background border border-border hover:bg-muted text-foreground"
            onClick={filter.onRemove}
          >
            {filter.label}
            <X className="ml-2 h-3 w-3" />
          </Button>
        ))}
      </div>
      
      {/* Clear All Button - below, appears from the first filter */}
      {activeFilters.length > 0 && (
        <div className="flex justify-start">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 py-1 text-sm border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={onClearAll}
          >
            Clear All
            <X className="ml-2 h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}