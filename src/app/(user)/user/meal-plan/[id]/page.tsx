/**
 * Meal Planning Page
 * 
 * Main page for meal planning with multiple view modes:
 * - Today View: Copy-only functionality (no drag and drop)
 * - Weekly View: Full drag & drop calendar
 * - Monthly View: Copy-only overview (no drag and drop)
 * Uses mock recipe service until real recipe system is ready
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, CalendarDays, Save, ChevronLeft, ChevronRight, Plus, Search, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { MealSlot } from '@/types/meal-planning';
import { useDrag, useDrop } from 'react-dnd';

// Quick interface for recipe data from cache
interface QuickRecipeData {
  id?: string | number;
  name?: string;
  title?: string;
  servings?: number;
  cookingTime?: number;
  readyInMinutes?: number;
  image?: string;
  extendedIngredients?: Array<{ original: string }>;
  diets?: string[];
}
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// Layout is provided by parent user layout
import { WeeklyCalendar } from '@/components/meal-planning/calendar/WeeklyCalendar';
import { MonthlyCalendar } from '@/components/meal-planning/calendar/MonthlyCalendar';

import { QuickAddRecipeModal } from '@/components/meal-planning/modals/QuickAddRecipeModal';
import { SavePlanModal, type SaveOptions } from '@/components/meal-planning/modals/SavePlanModal';
import { getWeekStartDate, createEmptyMealPlan } from '@/types/meal-planning';
import type { IMealPlan, MealSlot as MealSlotType, MealPlanningSlot } from '@/types/meal-planning';
import { useSession } from 'next-auth/react';
import { useMealPlanSync, triggerGlobalMealPlanSync } from '@/hooks/useMealPlanSync';
// import { ObjectId } from 'mongodb';
// ...existing code...
import { 
  exportCalendarAsImage,
  exportMealPlanToPDF,
  exportGroceryListAsText,
  exportGroceryListAsPDF
} from '@/utils/mealPlanExport';

// Define the NormalizedIngredient interface locally since we're not importing from the fetcher
interface NormalizedIngredient {
  name: string;
  amount?: string;
  unit?: string;
  category?: string;
  original?: string;
}

// ========================================
// Today View Component
// ========================================

interface TodayViewProps {
  currentDate: Date;
  mealPlans: IMealPlan[];
  onAddMeal: (slot: MealPlanningSlot) => void;
  onEditMeal: (slot: MealPlanningSlot) => void;
  onRemoveMeal: (planId: string, day: number, mealType: string, index: number) => void;
  onShowRecipe?: (meal: MealSlot) => void;
  onCopyRecipe?: (meal: MealSlot) => void;
  copiedRecipe?: MealSlot | null;
  onClearCopiedRecipe?: () => void;
  onMealPlanChange?: (mealPlan: IMealPlan) => void;
}

const TodayView: React.FC<TodayViewProps> = ({ 
  currentDate, 
  mealPlans, 
  onAddMeal, 
  onEditMeal, 
  onRemoveMeal, 
  onShowRecipe,
  onCopyRecipe,
  copiedRecipe,
  onClearCopiedRecipe,
  onMealPlanChange
}) => {
  // Find today's meals across all meal plans
  const todayMeals = mealPlans.flatMap(plan => 
    plan.days
      .filter(day => {
        return day.date.toDateString() === currentDate.toDateString();
      })
      .flatMap(day => [
        ...day.breakfast.map(meal => ({ ...meal, mealType: 'breakfast', planId: plan._id || '' })),
        ...day.lunch.map(meal => ({ ...meal, mealType: 'lunch', planId: plan._id || '' })),
        ...day.dinner.map(meal => ({ ...meal, mealType: 'dinner', planId: plan._id || '' })),
        ...day.snacks.map(meal => ({ ...meal, mealType: 'snacks', planId: plan._id || '' })),
      ])
  );

  const mealsByType = {
    breakfast: todayMeals.filter(meal => meal.mealType === 'breakfast'),
    lunch: todayMeals.filter(meal => meal.mealType === 'lunch'),
    dinner: todayMeals.filter(meal => meal.mealType === 'dinner'),
    snacks: todayMeals.filter(meal => meal.mealType === 'snacks'),
  };

  // TodayView uses copy-only functionality - no drag and drop handlers needed

  // Meal type configurations with different colors and styles
  const mealTypeConfig: Record<string, { emoji: string; title: string; bgColor: string; borderColor: string; cardBg: string; textColor: string; buttonColor: string; }> = {
    breakfast: {
      emoji: '🍳',
      title: 'Breakfast',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      cardBg: 'bg-white/80 backdrop-blur-sm',
      textColor: 'text-orange-800',
      buttonColor: 'bg-orange-500 hover:bg-orange-600'
    },
    lunch: {
      emoji: '🥗',
      title: 'Lunch', 
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      cardBg: 'bg-white/80 backdrop-blur-sm',
      textColor: 'text-green-800',
      buttonColor: 'bg-green-500 hover:bg-green-600'
    },
    dinner: {
      emoji: '🍽️',
      title: 'Dinner',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50', 
      borderColor: 'border-blue-200',
      cardBg: 'bg-white/80 backdrop-blur-sm',
      textColor: 'text-blue-800',
      buttonColor: 'bg-blue-500 hover:bg-blue-600'
    },
    snacks: {
      emoji: '🍎',
      title: 'Snacks',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-200', 
      cardBg: 'bg-white/80 backdrop-blur-sm',
      textColor: 'text-purple-800',
      buttonColor: 'bg-purple-500 hover:bg-purple-600'
    }
  };

  type ExtendedMeal = MealSlotType & { tags?: string[]; planId?: string };
  
  // TodayView is copy-only - no drag and drop interface needed

  const renderMealCard = (meal: ExtendedMeal, index: number, mealType: string, config: { emoji: string; cardBg: string; borderColor: string; textColor: string; buttonColor: string }) => {
    // No drag and drop functionality in TodayView - copy-only

    return (
      <div 
        key={index}
        className={`${config.cardBg} border ${config.borderColor} rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative`}
        onClick={() => {
          console.log('🍽️ Meal card clicked', { meal: meal.recipeName });
          // Navigate to the full recipe detail page instead of showing popup
          if (meal.recipeId) {
            window.open(`/recipe/${meal.recipeId}`, '_blank');
          }
        }}
      >
        {/* Copy Button - no drag handle needed in TodayView */}
        <div className="absolute top-2 right-2 opacity-60 hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              if (copiedRecipe && copiedRecipe.recipeId === meal.recipeId) {
                // Clear copied recipe if clicking on the same recipe
                onClearCopiedRecipe?.();
              } else {
                // Copy this recipe
                onCopyRecipe?.(meal);
              }
            }}
            title={copiedRecipe && copiedRecipe.recipeId === meal.recipeId ? "Clear copied recipe" : "Copy recipe"}
          >
            <Copy className={`h-3 w-3 ${copiedRecipe && copiedRecipe.recipeId === meal.recipeId ? 'text-blue-600' : 'text-gray-400'}`} />
          </Button>
        </div>

        {/* Meal Image Placeholder */}
        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          {meal.image ? (
            <Image 
              src={meal.image} 
              alt={meal.recipeName || 'Recipe image'}
              width={256}
              height={128}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="text-4xl opacity-50">
              {config.emoji}
            </div>
          )}
        </div>
        
        {/* Recipe Name */}
        <h4 className={`font-semibold text-lg mb-2 ${config.textColor}`}>
          {meal.recipeName}
        </h4>
        
        {/* Meal Details */}
        <div className="text-sm text-gray-600 mb-3 space-y-1">
          {meal.notes && (
            <div className="flex items-start gap-2">
              <span>📝</span>
              <span className="text-xs">{meal.notes}</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the recipe modal
              // Convert JavaScript day (0=Sunday) to meal planning day (0=Monday)
              const jsDay = currentDate.getDay();
              const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert Sunday(0) to 6, Mon(1) to 0, etc.
              onEditMeal({
                dayOfWeek,
                mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
                recipeId: meal.recipeId,
                recipeName: meal.recipeName,
                servings: meal.servings,
                prepTime: meal.prepTime,
                ingredients: meal.ingredients || [],
                tags: meal.tags || [],
                notes: meal.notes
              });
            }}
            className="flex-1 text-xs"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the recipe modal
              // Convert JavaScript day (0=Sunday) to meal planning day (0=Monday)
              const jsDay = currentDate.getDay();
              const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert Sunday(0) to 6, Mon(1) to 0, etc.
              onRemoveMeal(meal.planId || '', dayOfWeek, mealType, index);
            }}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      </div>
    );
  };

  const renderMealColumn = (mealType: keyof typeof mealTypeConfig, meals: MealSlotType[]) => {
    const config = mealTypeConfig[mealType];
    
    // No drop zone in TodayView - copy-only functionality
    
    return (
      <div 
        key={mealType} 
        className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-4 min-h-[500px]`}
      >
        {/* Column Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{config.emoji}</div>
          <h3 className={`text-xl font-bold ${config.textColor}`}>
            {config.title}
          </h3>
          <div className="text-sm text-gray-500">
            {meals.length} meal{meals.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Meals Grid */}
        <div className="space-y-4">
          {meals.length > 0 ? (
            <>
              {meals.map((meal, index) => renderMealCard(meal, index, mealType, config))}
              
              {/* Add More Button */}
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className={`border-dashed border-2 ${config.borderColor} ${config.textColor} hover:${config.bgColor} transition-colors`}
                  onClick={() => {
                    // Convert JavaScript day (0=Sunday) to meal planning day (0=Monday)
                    const jsDay = currentDate.getDay();
                    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert Sunday(0) to 6, Mon(1) to 0, etc.
                    onAddMeal({
                      dayOfWeek,
                      mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
                      recipeId: '',
                      recipeName: '',
                      servings: 2,
                      prepTime: 30,
                      ingredients: [],
                      tags: []
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Another {config.title}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <div className="text-6xl opacity-30 mb-4">{config.emoji}</div>
                <p>No {mealType} planned</p>
              </div>
              <div className="space-y-2">
                <Button
                  className={`${config.buttonColor} text-white`}
                  onClick={() => {
                    // Convert JavaScript day (0=Sunday) to meal planning day (0=Monday)
                    const jsDay = currentDate.getDay();
                    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert Sunday(0) to 6, Mon(1) to 0, etc.
                    onAddMeal({
                      dayOfWeek,
                      mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
                      recipeId: '',
                      recipeName: '',
                      servings: 2,
                      prepTime: 30,
                      ingredients: [],
                      tags: []
                    });
                  }}
                >
                  Add {config.title}
                </Button>
                
                {/* Paste Button - only show if there's a copied recipe */}
                {copiedRecipe && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-dashed border-2 ${config.borderColor} ${config.textColor} hover:${config.bgColor} transition-colors w-full`}
                    onClick={() => {
                      if (copiedRecipe && onMealPlanChange) {
                        // Find the current meal plan for today
                        const todayPlan = mealPlans.find(plan => 
                          plan.days.some(day => day.date.toDateString() === currentDate.toDateString())
                        );
                        
                        if (!todayPlan) return;
                        
                        // Create updated meal plan with pasted recipe
                        const updatedPlan = { ...todayPlan };
                        const todayDayIndex = updatedPlan.days.findIndex(day => 
                          day.date.toDateString() === currentDate.toDateString()
                        );
                        
                        if (todayDayIndex === -1) return;
                        
                        const todayDay = { ...updatedPlan.days[todayDayIndex] };
                        const targetMeals = [...todayDay[mealType as keyof typeof todayDay] as MealSlot[]];
                        
                        // Add the copied recipe to the target meal type
                        targetMeals.push({ ...copiedRecipe });
                        
                        // Update the day with new meal arrays
                        const updatedDay = {
                          ...todayDay,
                          [mealType]: targetMeals
                        };
                        
                        updatedPlan.days[todayDayIndex] = updatedDay;
                        updatedPlan.updatedAt = new Date();
                        
                        onMealPlanChange(updatedPlan);
                        
                        // Clear copied recipe after pasting
                        onClearCopiedRecipe?.();
                      }
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Paste &quot;{copiedRecipe.recipeName || 'Recipe'}&quot;
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {currentDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
        <p className="text-gray-600">Your meal plan for today</p>
      </div>

      {/* Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 lg:gap-8">
        {renderMealColumn('breakfast', mealsByType.breakfast)}
        {renderMealColumn('lunch', mealsByType.lunch)}
        {renderMealColumn('dinner', mealsByType.dinner)}
        {renderMealColumn('snacks', mealsByType.snacks)}
      </div>
    </div>
  );
};

// ========================================
// Main Meal Planning Component
// ========================================

type ViewMode = 'today' | 'weekly' | 'monthly';

export default function MealPlanningPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const mealPlanId = params.id as string;
  const { syncCounter, triggerSync } = useMealPlanSync();
  
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  // Local meal plans state placeholder (setter used elsewhere)
  const [, setMealPlans] = useState<IMealPlan[]>([]);
  const [mealPlan, setMealPlan] = useState<IMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [, setIsSaving] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MealPlanningSlot | null>(null);
  const [copiedRecipe, setCopiedRecipe] = useState<MealSlot | null>(null);
  const [dateSearchValue, setDateSearchValue] = useState<string>('');

  // Handle copying recipe
  const handleCopyRecipe = (meal: MealSlot) => {
    setCopiedRecipe(meal);
    console.log('Recipe copied:', meal.recipeName);
  };

  // Handle clearing copied recipe
  const handleClearCopiedRecipe = () => {
    setCopiedRecipe(null);
  };

  // Central meal plan storage - persists across navigation
  const [globalMealPlans, setGlobalMealPlans] = useState<Map<string, IMealPlan>>(new Map());
  
  // Force refresh key for weekly view persistence
  const [forceRefreshKey, setForceRefreshKey] = useState(0);
  
  // Shopping list count state
  const [shoppingListCount, setShoppingListCount] = useState<number>(0);
  
  // Function to fetch shopping list count
  const fetchShoppingListCount = useCallback(async () => {
    if (!session?.user?.email) return;
    
    try {
      console.log('🛒 Fetching shopping list count...');
      const response = await fetch('/api/saved-grocery-lists');
      
      if (response.ok) {
        const savedLists = await response.json();
        const count = Array.isArray(savedLists) ? savedLists.length : 0;
        setShoppingListCount(count);
        console.log(`🛒 Found ${count} saved shopping lists`);
      } else {
        console.warn('⚠️ Failed to fetch shopping lists:', response.status);
        setShoppingListCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching shopping list count:', error);
      setShoppingListCount(0);
    }
  }, [session?.user?.email]);

  // Function to refresh shopping list count (can be called after creating/deleting lists)
  const refreshShoppingListCount = useCallback(() => {
    fetchShoppingListCount();
  }, [fetchShoppingListCount]);
  
  // Load specific meal plan based on ID from URL
  useEffect(() => {
    const loadSpecificMealPlan = async () => {
      if (!session?.user?.email || !mealPlanId || mealPlanId === 'current') return;
      
      try {
        console.log(`🔄 Loading specific meal plan with ID: ${mealPlanId}`);
        const response = await fetch(`/api/meal-plans/${mealPlanId}`);
        
        if (response.ok) {
          const result = await response.json();
          const specificPlan = result.data;

          // Rigorous validation of the received data
          if (!specificPlan || typeof specificPlan !== 'object') {
            throw new Error('Invalid meal plan data received from server.');
          }
          if (!specificPlan.weekStartDate) {
            throw new Error('Meal plan data is missing "weekStartDate".');
          }
          if (!Array.isArray(specificPlan.days)) {
            throw new Error('Meal plan data is missing a valid "days" array.');
          }

          // Process the plan to ensure dates are Date objects with timezone-safe conversion
          const processedPlan: IMealPlan = {
            ...specificPlan,
            weekStartDate: new Date(specificPlan.weekStartDate),
            days: specificPlan.days.map((day: any) => {
              // Ensure dates are parsed as local dates, not UTC
              const dateStr = day.date;
              let localDate: Date;
              
              if (typeof dateStr === 'string') {
                // If it's an ISO string, parse it properly to maintain local date
                if (dateStr.includes('T')) {
                  // ISO string - extract just the date part to avoid timezone issues
                  const datePart = dateStr.split('T')[0];
                  const [year, month, day] = datePart.split('-').map(Number);
                  localDate = new Date(year, month - 1, day); // month is 0-indexed
                } else {
                  localDate = new Date(dateStr);
                }
              } else {
                localDate = new Date(dateStr);
              }
              
              return {
                ...day,
                date: localDate
              };
            })
          };
          
          console.log(`📋 Loaded specific meal plan: ${processedPlan.title || 'Untitled Plan'}`);
          
          // Update meal plan state
          setMealPlan(processedPlan);
          setMealPlans([processedPlan]);
          
          // Also update current date to match meal plan's first day
          setCurrentDate(new Date(processedPlan.weekStartDate));
          
          // Add to global plans
          const weekKey = getWeekStartDate(processedPlan.weekStartDate).toISOString().split('T')[0];
          const updatedGlobalPlans = new Map(globalMealPlans);
          updatedGlobalPlans.set(weekKey, processedPlan);
          setGlobalMealPlans(updatedGlobalPlans);
          
          setIsLoading(false);
        } else {
          console.error(`Failed to load meal plan with ID ${mealPlanId}:`, response.status, response.statusText);
          setError(`Failed to load meal plan: ${response.statusText}`);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`Error loading meal plan with ID ${mealPlanId}:`, error);
        setError('Failed to load meal plan due to an error');
        setIsLoading(false);
      }
    };
    
    loadSpecificMealPlan();
  }, [mealPlanId, session?.user?.email]);

  // Load all existing meal plans on component mount
  useEffect(() => {
    const loadAllMealPlans = async () => {
      if (!session?.user?.email) return;
      
      try {
        console.log('🔄 Loading all user meal plans from database...');
        const response = await fetch('/api/meal-plans');
        
        if (response.ok) {
          const result = await response.json();
          const allPlans = result.data || [];
          
          console.log(`📋 Loaded ${allPlans.length} meal plans from database`);
          
          // Create a new map with all plans
          const newGlobalPlans = new Map<string, IMealPlan>();
          
          allPlans.forEach((plan: any) => {
            // Convert date strings back to Date objects with timezone-safe conversion
            const processedPlan: IMealPlan = {
              ...plan,
              weekStartDate: new Date(plan.weekStartDate),
              days: plan.days.map((day: any) => {
                // Ensure dates are parsed as local dates, not UTC
                const dateStr = day.date;
                let localDate: Date;
                
                if (typeof dateStr === 'string') {
                  // If it's an ISO string, parse it properly to maintain local date
                  if (dateStr.includes('T')) {
                    // ISO string - extract just the date part to avoid timezone issues
                    const datePart = dateStr.split('T')[0];
                    const [year, month, day] = datePart.split('-').map(Number);
                    localDate = new Date(year, month - 1, day); // month is 0-indexed
                  } else {
                    localDate = new Date(dateStr);
                  }
                } else {
                  localDate = new Date(dateStr);
                }
                
                return {
                  ...day,
                  date: localDate
                };
              })
            };
            
            const weekKey = getWeekStartDate(processedPlan.weekStartDate).toISOString().split('T')[0];
            newGlobalPlans.set(weekKey, processedPlan);
            
            console.log(`📅 Added meal plan for week ${weekKey} with ${processedPlan.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0)} meals`);
          });
          
          setGlobalMealPlans(newGlobalPlans);
          
          // Also store all plans separately for statistics calculation
          const processedPlans = allPlans.map((plan: any) => {
            const processedPlan = {
              ...plan,
              weekStartDate: new Date(plan.weekStartDate),
              days: plan.days.map((day: any) => {
                // Ensure dates are parsed as local dates, not UTC
                const dateStr = day.date;
                let localDate: Date;
                
                if (typeof dateStr === 'string') {
                  // If it's an ISO string, parse it properly to maintain local date
                  if (dateStr.includes('T')) {
                    // ISO string - extract just the date part to avoid timezone issues
                    const datePart = dateStr.split('T')[0];
                    const [year, month, day] = datePart.split('-').map(Number);
                    localDate = new Date(year, month - 1, day); // month is 0-indexed
                  } else {
                    localDate = new Date(dateStr);
                  }
                } else {
                  localDate = new Date(dateStr);
                }
                
                return {
                  ...day,
                  date: localDate
                };
              })
            };
            return processedPlan;
          });
          setAllUserMealPlans(processedPlans);
          
          console.log(`✅ Successfully loaded ${newGlobalPlans.size} meal plans into global storage and ${processedPlans.length} plans for statistics`);
        } else {
          console.warn('⚠️ Failed to load meal plans:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ Error loading all meal plans:', error);
      }
    };
    
    loadAllMealPlans();
  }, [session?.user?.email]);

  // Sync mealPlan with globalMealPlans when globalMealPlans changes (with navigation intelligence)
  useEffect(() => {
    if (!mealPlanId || mealPlanId === 'current' || globalMealPlans.size === 0) return;
    
    // Find the meal plan that matches the ID in the URL
    const matchingPlan = Array.from(globalMealPlans.values()).find(plan => plan._id === mealPlanId);
    
    if (matchingPlan && (!mealPlan || mealPlan._id !== matchingPlan._id)) {
      // Check if we're currently navigating to a different week
      // If the current meal plan is for a different week than the URL plan, don't sync
      // This prevents navigation conflicts
      if (mealPlan && mealPlan.weekStartDate && matchingPlan.weekStartDate) {
        const currentWeekKey = getWeekStartDate(mealPlan.weekStartDate).toISOString().split('T')[0];
        const urlPlanWeekKey = getWeekStartDate(matchingPlan.weekStartDate).toISOString().split('T')[0];
        
        if (currentWeekKey !== urlPlanWeekKey) {
          console.log('🚫 Skipping sync to preserve navigation state:', {
            currentWeek: currentWeekKey,
            urlPlanWeek: urlPlanWeekKey
          });
          return;
        }
      }
      
      console.log('🔄 Syncing mealPlan with globalMealPlans for ID:', mealPlanId);
      console.log('📋 Found matching plan:', {
        id: matchingPlan._id,
        title: matchingPlan.title,
        totalMeals: matchingPlan.days.reduce((total, day) => 
          total + (day.breakfast?.length || 0) + (day.lunch?.length || 0) + 
          (day.dinner?.length || 0) + (day.snacks?.length || 0), 0
        )
      });
      setMealPlan(matchingPlan);
      setIsLoading(false);
    }
  }, [globalMealPlans, mealPlanId, mealPlan]);

  // Load shopping list count when component mounts or session changes
  useEffect(() => {
    if (session?.user?.email) {
      fetchShoppingListCount();
    }
  }, [session?.user?.email, fetchShoppingListCount]);

  // Get or create meal plan for a specific week
  const getOrCreateMealPlan = (date: Date): IMealPlan => {
    const weekStart = getWeekStartDate(date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    // First check if we already have it in memory
    if (globalMealPlans.has(weekKey)) {
      const existingPlan = globalMealPlans.get(weekKey)!;
      console.log('🔍 Found existing meal plan in memory for week:', weekKey, 'with', existingPlan.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0), 'total meals');
      return existingPlan;
    } 
    
    // Check if current mealPlan is for this week
    if (mealPlan && mealPlan.weekStartDate) {
      const mealPlanWeekKey = getWeekStartDate(mealPlan.weekStartDate).toISOString().split('T')[0];
      if (mealPlanWeekKey === weekKey) {
        console.log('🔍 Using current mealPlan for week:', weekKey, 'with', mealPlan.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0), 'total meals');
        
        // Store in global for future access
        const updatedGlobalPlans = new Map(globalMealPlans);
        updatedGlobalPlans.set(weekKey, mealPlan);
        setGlobalMealPlans(updatedGlobalPlans);
        
        return mealPlan;
      }
    }
    
    // Last resort: create new empty plan
    console.log('⚠️ Creating new empty meal plan for week:', weekKey, '(This may cause data loss!)');
    const newPlan = createEmptyMealPlan('current-user', weekStart);
    const updatedGlobalPlans = new Map(globalMealPlans);
    updatedGlobalPlans.set(weekKey, newPlan);
    setGlobalMealPlans(updatedGlobalPlans);
    return newPlan;
  };

  // Update a specific meal plan and sync with global storage + auto-save to database
  const updateMealPlan = async (updatedPlan: IMealPlan) => {
    console.log('🚀 updateMealPlan called with plan:', {
      id: updatedPlan._id,
      title: updatedPlan.title,
      totalMeals: updatedPlan.days.reduce((total, day) => 
        total + (day.breakfast?.length || 0) + (day.lunch?.length || 0) + 
        (day.dinner?.length || 0) + (day.snacks?.length || 0), 0
      ),
      daysWithMeals: updatedPlan.days.filter(day => 
        (day.breakfast?.length || 0) + (day.lunch?.length || 0) + 
        (day.dinner?.length || 0) + (day.snacks?.length || 0) > 0
      ).length
    });

    // Ensure weekStartDate is a Date object
    const weekStartDate = updatedPlan.weekStartDate instanceof Date 
      ? updatedPlan.weekStartDate 
      : new Date(updatedPlan.weekStartDate);
      
    const weekKey = weekStartDate.toISOString().split('T')[0];
    console.log('🔄 Updating meal plan for week:', weekKey, 'with', updatedPlan.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0), 'total meals');
    
    // Update global storage first (for immediate UI update)
    const updatedGlobalPlans = new Map(globalMealPlans);
    updatedGlobalPlans.set(weekKey, updatedPlan);
    setGlobalMealPlans(updatedGlobalPlans);
    
    // ALWAYS update local state if this plan matches current meal plan
    if (mealPlan && mealPlan._id === updatedPlan._id) {
      console.log('🔄 Syncing local mealPlan state with updated plan');
      setMealPlan(updatedPlan);
      setMealPlans([updatedPlan]);
    }
    
    // Also update if current week matches (for cross-week synchronization)
    const currentWeekKey = getWeekStartDate(currentDate).toISOString().split('T')[0];
    if (weekKey === currentWeekKey && (!mealPlan || mealPlan._id !== updatedPlan._id)) {
      console.log('🔄 Updating current week meal plan');
      setMealPlan(updatedPlan);
      setMealPlans([updatedPlan]);
    }
    
    // AUTO-SAVE TO DATABASE: Save changes immediately to MongoDB
    try {
      console.log('💾 Starting auto-save process...', {
        planId: updatedPlan._id,
        hasId: !!updatedPlan._id,
        idType: typeof updatedPlan._id
      });

      if (updatedPlan._id && updatedPlan._id !== 'temp-id') {
        console.log('💾 Auto-saving existing meal plan to database...', updatedPlan._id);
        
        // Prepare meal plan data for API - only send updateable fields
        const mealPlanData = {
          title: updatedPlan.title,
          days: updatedPlan.days.map(day => ({
            date: day.date instanceof Date ? day.date.toISOString() : day.date,
            breakfast: day.breakfast || [],
            lunch: day.lunch || [],
            dinner: day.dinner || [],
            snacks: day.snacks || [],
            dailyNotes: day.dailyNotes
          })),
          tags: updatedPlan.tags || [],
          totalCalories: updatedPlan.totalCalories,
          shoppingListGenerated: updatedPlan.shoppingListGenerated || false
        };

        console.log('📡 Sending PUT request to /api/meal-plans/' + updatedPlan._id, {
          totalDays: mealPlanData.days.length,
          totalMealsToSave: mealPlanData.days.reduce((total, day) => 
            total + (day.breakfast?.length || 0) + (day.lunch?.length || 0) + 
            (day.dinner?.length || 0) + (day.snacks?.length || 0), 0
          )
        });

        const response = await fetch(`/api/meal-plans/${updatedPlan._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mealPlanData)
        });

        console.log('📡 PUT Response status:', response.status, response.statusText);

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Meal plan auto-saved successfully to database');
          console.log('✅ Database response:', result);
          
          // 🔄 SYNC: Trigger synchronization across all meal planning pages
          triggerSync();
          console.log('🔄 Triggered global meal plan synchronization');
          
          // Refresh statistics after successful save
          await refreshAllMealPlansForStats();
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to auto-save meal plan to database:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
        }
      } else if (updatedPlan._id === 'temp-id' || !updatedPlan._id) {
        // Create new meal plan in database
        console.log('🆕 Creating new meal plan in database...');
        
        const createData = {
          weekStartDate: updatedPlan.weekStartDate instanceof Date 
            ? updatedPlan.weekStartDate.toISOString() 
            : updatedPlan.weekStartDate,
          title: updatedPlan.title,
          days: updatedPlan.days.map(day => ({
            ...day,
            date: day.date instanceof Date ? day.date.toISOString() : day.date
          }))
        };

        console.log('📡 Sending POST request to /api/meal-plans', createData);

        const response = await fetch('/api/meal-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData)
        });

        console.log('📡 POST Response status:', response.status, response.statusText);

        if (response.ok) {
          const result = await response.json();
          console.log('✅ New meal plan created in database with ID:', result.data._id);
          
          // Update the plan with the real database ID
          const savedPlan = {
            ...updatedPlan,
            _id: result.data._id
          };
          
          // Update both global and local storage with the database ID
          const finalGlobalPlans = new Map(globalMealPlans);
          finalGlobalPlans.set(weekKey, savedPlan);
          setGlobalMealPlans(finalGlobalPlans);
          
          if (mealPlan && (mealPlan._id === updatedPlan._id || weekKey === currentWeekKey)) {
            setMealPlan(savedPlan);
            setMealPlans([savedPlan]);
          }
          
          // Refresh statistics after successful creation
          await refreshAllMealPlansForStats();
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to create meal plan in database:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
        }
      } else {
        console.warn('⚠️ Skipping auto-save - no valid meal plan ID');
      }
    } catch (error) {
      console.error('❌ Auto-save error:', error);
      // Don't block the UI - just log the error
    }
  };

  // 📅 WEEK NAVIGATION: Handle Previous/Next Week navigation
  const handleWeekNavigation = async (direction: 'previous' | 'next' | 'current') => {
    if (!session?.user?.email) {
      console.log('❌ Week navigation blocked: missing session');
      return;
    }

    console.log(`📅 Week Navigation: Starting ${direction} navigation`);
    
    // Calculate target week based on current meal plan or current date
    const baseDate = mealPlan?.weekStartDate ? new Date(mealPlan.weekStartDate) : getWeekStartDate(currentDate);
    let targetWeekStart: Date;

    switch (direction) {
      case 'previous':
        targetWeekStart = new Date(baseDate);
        targetWeekStart.setDate(targetWeekStart.getDate() - 7);
        break;
      case 'next':
        targetWeekStart = new Date(baseDate);
        targetWeekStart.setDate(targetWeekStart.getDate() + 7);
        break;
      case 'current':
        targetWeekStart = getWeekStartDate(new Date());
        break;
      default:
        console.log('❌ Invalid navigation direction:', direction);
        return;
    }

    const targetWeekKey = targetWeekStart.toISOString().split('T')[0];
    console.log(`📅 Week Navigation: Moving ${direction} to week:`, targetWeekKey);

    try {
      // 1. Check if we already have this week's meal plan in memory
      if (globalMealPlans.has(targetWeekKey)) {
        const existingPlan = globalMealPlans.get(targetWeekKey)!;
        console.log('📅 Found existing meal plan in memory for target week');
        setMealPlan(existingPlan);
        setCurrentDate(targetWeekStart);
        setForceRefreshKey(prev => prev + 1);
        triggerGlobalMealPlanSync();
        return;
      }

      // 2. Try to load meal plan for this week from database
      console.log(`📅 Fetching meal plan for week: ${targetWeekStart.toISOString()}`);
      const response = await fetch(`/api/meal-plans?weekStart=${targetWeekStart.toISOString()}`);
      
      if (!response.ok) {
        console.log(`📅 API response not OK: ${response.status} ${response.statusText}`);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📅 API response received:', result);
      const plans = result.data || [];
      
      if (plans.length > 0) {
        const targetPlan = plans[0];
        console.log('📅 Loaded meal plan from database for target week');
        
        // Convert date strings to Date objects
        const normalizedPlan = {
          ...targetPlan,
          weekStartDate: new Date(targetPlan.weekStartDate),
          weekEndDate: new Date(targetPlan.weekEndDate),
          days: targetPlan.days.map((day: any) => ({
            ...day,
            date: new Date(day.date)
          }))
        };

        // Store in global plans
        const updatedGlobalPlans = new Map(globalMealPlans);
        updatedGlobalPlans.set(targetWeekKey, normalizedPlan);
        setGlobalMealPlans(updatedGlobalPlans);
        
        setMealPlan(normalizedPlan);
        setCurrentDate(targetWeekStart);
        setForceRefreshKey(prev => prev + 1);
        triggerGlobalMealPlanSync();
        return;
      } else {
        console.log('📅 No meal plans found for target week, will create new one');
      }

      // 3. Create new empty meal plan for this week (only if navigation is intentional)
      console.log('📅 Creating new meal plan for target week');
      const newPlan = createEmptyMealPlan(session.user.email, targetWeekStart);
      
      // Store in global plans
      const updatedGlobalPlans = new Map(globalMealPlans);
      updatedGlobalPlans.set(targetWeekKey, newPlan);
      setGlobalMealPlans(updatedGlobalPlans);
      
      setMealPlan(newPlan);
      setCurrentDate(targetWeekStart);
      setForceRefreshKey(prev => prev + 1);
      triggerGlobalMealPlanSync();

    } catch (error) {
      console.error('❌ Week navigation error:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      
      // Fallback to creating empty plan
      console.log('📅 Creating fallback empty meal plan due to error');
      const newPlan = createEmptyMealPlan(session?.user?.email || 'current-user', targetWeekStart);
      const updatedGlobalPlans = new Map(globalMealPlans);
      updatedGlobalPlans.set(targetWeekKey, newPlan);
      setGlobalMealPlans(updatedGlobalPlans);
      setMealPlan(newPlan);
      setCurrentDate(targetWeekStart);
      setForceRefreshKey(prev => prev + 1);
      triggerGlobalMealPlanSync();
    }
  };



  // Load meal plan by ID from URL parameter
  useEffect(() => {
    if (!mealPlanId || !session?.user?.email) return;
    
    const loadMealPlan = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if ID is a MongoDB ObjectId or a date string
        const isDateId = /^\d{4}-\d{2}-\d{2}$/.test(mealPlanId);
        
        if (isDateId) {
          // Legacy date-based ID - create meal plan for that week
          const weekDate = new Date(mealPlanId);
          const weekStart = getWeekStartDate(weekDate);
          console.log('Loading meal plan for date-based ID:', mealPlanId, 'week start:', weekStart);
          
          // For now, create a local meal plan
          const newPlan = createEmptyMealPlan(session.user.email, weekStart);
          setMealPlan(newPlan);
          setMealPlans([newPlan]);
          setCurrentDate(weekStart);
          
          // Add to global storage
          const weekKey = weekStart.toISOString().split('T')[0];
          const updatedGlobalPlans = new Map(globalMealPlans);
          updatedGlobalPlans.set(weekKey, newPlan);
          setGlobalMealPlans(updatedGlobalPlans);
          console.log('🗃️ Stored new date-based meal plan in global storage for week:', weekKey);
        } else {
          // Database ID - fetch from MongoDB
          console.log('Loading meal plan by database ID:', mealPlanId);
          
          const response = await fetch(`/api/meal-plans/${mealPlanId}`);
          if (response.ok) {
            const result = await response.json();
            const plan = result.data; // Extract the actual meal plan from API response
            
            // Convert date strings back to Date objects
            plan.weekStartDate = new Date(plan.weekStartDate);
            plan.days.forEach((day: { date: string | Date }) => {
              day.date = new Date(day.date);
            });
            
            console.log('📥 Loaded meal plan from database with', plan.days.reduce((total: number, day: any) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0), 'total meals');
            
            setMealPlan(plan);
            setMealPlans([plan]);
            setCurrentDate(plan.weekStartDate);
            
            // IMPORTANT: Add loaded plan to global storage to prevent loss during view changes
            const weekKey = getWeekStartDate(plan.weekStartDate).toISOString().split('T')[0];
            const updatedGlobalPlans = new Map(globalMealPlans);
            updatedGlobalPlans.set(weekKey, plan);
            setGlobalMealPlans(updatedGlobalPlans);
            console.log('🗃️ Stored loaded meal plan in global storage for week:', weekKey);
          } else if (response.status === 404) {
            // Meal plan not found - create a new one for current week
            const weekStart = getWeekStartDate(new Date());
            const newPlan = createEmptyMealPlan(session.user.email, weekStart);
            setMealPlan(newPlan);
            setMealPlans([newPlan]);
            setCurrentDate(weekStart);
            
            // Add to global storage
            const weekKey = weekStart.toISOString().split('T')[0];
            const updatedGlobalPlans = new Map(globalMealPlans);
            updatedGlobalPlans.set(weekKey, newPlan);
            setGlobalMealPlans(updatedGlobalPlans);
            console.log('🗃️ Stored 404 fallback meal plan in global storage for week:', weekKey);
          } else {
            throw new Error(`Failed to load meal plan: ${response.statusText}`);
          }
        }
      } catch (err) {
        console.error('Error loading meal plan:', err);
        setError(err instanceof Error ? err.message : 'Failed to load meal plan');
        
        // Fallback: create a new meal plan for current week
        const weekStart = getWeekStartDate(new Date());
        const newPlan = createEmptyMealPlan(session.user.email, weekStart);
        setMealPlan(newPlan);
        setMealPlans([newPlan]);
        setCurrentDate(weekStart);
        
        // Add to global storage
        const weekKey = weekStart.toISOString().split('T')[0];
        const updatedGlobalPlans = new Map(globalMealPlans);
        updatedGlobalPlans.set(weekKey, newPlan);
        setGlobalMealPlans(updatedGlobalPlans);
        console.log('🗃️ Stored error fallback meal plan in global storage for week:', weekKey);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMealPlan();
  }, [session?.user?.email]);

  // Function to refresh meal plan data - Enhanced with Weekly View specific handling
  const refreshCurrentMealPlan = useCallback(() => {
    const weekKey = getWeekStartDate(currentDate).toISOString().split('T')[0];
    
    console.log('🔄 RefreshCurrentMealPlan called for week:', weekKey, 'current viewMode:', viewMode);
    console.log('🔄 Current globalMealPlans keys:', Array.from(globalMealPlans.keys()));
    console.log('🔄 Current mealPlan exists:', !!mealPlan, 'with meals:', mealPlan?.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0) || 0);
    
    // WEEKLY VIEW SPECIFIC HANDLING - Force refresh from globalMealPlans
    if (viewMode === 'weekly') {
      console.log('📅 Weekly view detected - performing ENHANCED refresh');
      
      // Check ALL meal plans in global storage for this week
      let foundPlan = null;
      for (const [storedWeekKey, storedPlan] of globalMealPlans.entries()) {
        if (storedWeekKey === weekKey) {
          foundPlan = storedPlan;
          break;
        }
      }
      
      if (foundPlan) {
        const mealCount = foundPlan.days.reduce((total, day) => 
          total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0
        );
        console.log(`✅ Weekly: Found plan in globalMealPlans with ${mealCount} meals`);
        
        // Force complete state update for weekly view
        const clonedPlan = { 
          ...foundPlan, 
          days: foundPlan.days.map(day => ({
            ...day,
            breakfast: [...day.breakfast],
            lunch: [...day.lunch],
            dinner: [...day.dinner],
            snacks: [...day.snacks]
          }))
        };
        
        setMealPlan(clonedPlan);
        setMealPlans([clonedPlan]);
        setForceRefreshKey(prev => prev + 1);
        
        console.log('✅ Weekly view state FORCE updated');
        return;
      }
      
      // Check if current meal plan is correct but not in global storage
      if (mealPlan && mealPlan.weekStartDate) {
        const mealPlanWeekKey = getWeekStartDate(mealPlan.weekStartDate).toISOString().split('T')[0];
        if (mealPlanWeekKey === weekKey) {
          const mealCount = mealPlan.days.reduce((total, day) => 
            total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0
          );
          
          if (mealCount > 0) {
            console.log(`✅ Weekly: Current mealPlan has ${mealCount} meals for correct week`);
            
            // Add to global storage
            const updatedGlobalPlans = new Map(globalMealPlans);
            updatedGlobalPlans.set(weekKey, { ...mealPlan });
            setGlobalMealPlans(updatedGlobalPlans);
            
            // Force refresh state
            setMealPlan({ ...mealPlan });
            setMealPlans([{ ...mealPlan }]);
            setForceRefreshKey(prev => prev + 1);
            
            console.log('✅ Weekly: Added current plan to global storage and refreshed');
            return;
          }
        }
      }
      
      console.log('⚠️ Weekly: No data found for week:', weekKey, '- creating empty plan');
      
      // Create empty plan for weekly view if nothing exists
      const emptyPlan = createEmptyMealPlan(session?.user?.email || 'current-user', getWeekStartDate(currentDate));
      setMealPlan(emptyPlan);
      setMealPlans([emptyPlan]);
      setForceRefreshKey(prev => prev + 1);
      return;
    }
    
    // GENERAL VIEW HANDLING (Today/Monthly)
    // First check if we have the meal plan in global storage
    const existingPlan = globalMealPlans.get(weekKey);
    if (existingPlan) {
      console.log('🔄 Found in globalMealPlans for week:', weekKey, 'with', existingPlan.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0), 'meals');
      
      // Force update local state with proper synchronization
      setMealPlan(existingPlan);
      setMealPlans([existingPlan]);
      return;
    }
    
    // Check if current mealPlan is for this week (avoid creating new plans)
    if (mealPlan && mealPlan.weekStartDate) {
      const mealPlanWeekKey = getWeekStartDate(mealPlan.weekStartDate).toISOString().split('T')[0];
      if (mealPlanWeekKey === weekKey) {
        console.log('🔄 Current mealPlan is already for the correct week:', weekKey);
        
        // IMPORTANT: Add to global storage for persistence across view changes
        const updatedGlobalPlans = new Map(globalMealPlans);
        updatedGlobalPlans.set(weekKey, mealPlan);
        setGlobalMealPlans(updatedGlobalPlans);
        console.log('🗃️ Added current meal plan to global storage for persistence');
        
        // Keep current meal plan
        setMealPlans([mealPlan]);
        return;
      }
    }
    
    // Look through all stored plans for cross-week functionality
    for (const [storedWeekKey, storedPlan] of globalMealPlans.entries()) {
      if (storedWeekKey === weekKey) {
        console.log('🔄 Found matching week plan in global storage:', storedWeekKey);
        setMealPlan(storedPlan);
        setMealPlans([storedPlan]);
        return;
      }
    }
    
    console.log('⚠️ No meal plan found for week:', weekKey, '- keeping current state');
    
    // Note: Weekly mode is handled in the earlier conditional block above
    // This section handles today/monthly views only
  }, [currentDate, globalMealPlans, mealPlan, viewMode]);

  // Sync meal plan when view mode changes - Enhanced for better data persistence
  useEffect(() => {
    if (isLoading || !session?.user?.email) return;
    
    console.log('🔄 View mode changed to:', viewMode, 'refreshing meal plan for current date:', currentDate.toDateString());
    console.log('🔄 Current meal plan before refresh:', mealPlan ? `${mealPlan.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0)} meals` : 'null');
    console.log('🔄 Global plans available:', Array.from(globalMealPlans.keys()));
    
    // Ensure current meal plan is saved to global storage before switching views
    if (mealPlan) {
      const currentWeekKey = getWeekStartDate(mealPlan.weekStartDate).toISOString().split('T')[0];
      const updatedGlobalPlans = new Map(globalMealPlans);
      updatedGlobalPlans.set(currentWeekKey, mealPlan);
      setGlobalMealPlans(updatedGlobalPlans);
      console.log('🗃️ Saved current meal plan to global storage before view switch');
    }
    
    // Delay execution to avoid conflicts with other state updates
    const timeoutId = setTimeout(() => {
      refreshCurrentMealPlan();
    }, 150); // Slightly longer delay for better synchronization
    
    return () => clearTimeout(timeoutId);
  }, [viewMode]); // Only depend on viewMode to avoid infinite loops

  // Date search functionality
  const handleDateSearch = (value: string) => {
    setDateSearchValue(value);
    
    if (!value) return;
    
    // Parse different date formats
    let targetDate: Date | null = null;
    
    // Try YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      targetDate = new Date(value);
    }
    // Try DD/MM/YYYY format
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split('/');
      targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Try MM/DD/YYYY format
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [month, day, year] = value.split('/');
      targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Try DD.MM.YYYY format
    else if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
      const [day, month, year] = value.split('.');
      targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Try partial year-month: YYYY-MM
    else if (/^\d{4}-\d{2}$/.test(value)) {
      const [year, month] = value.split('-');
      targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    
    // Navigate to the appropriate view and date
    if (targetDate && !isNaN(targetDate.getTime())) {
      setCurrentDate(targetDate);
      
      // Update meal plan for current week
      const weekStart = getWeekStartDate(targetDate);
      const newPlan = createEmptyMealPlan('current-user', weekStart);
      setMealPlan(newPlan);
      setMealPlans([newPlan]);
    }
  };

  // Handle Enter key press for date search
  const handleDateSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDateSearch(dateSearchValue);
    }
  };

  // Navigation handlers - Updated to use centralized week navigation for weekly view
  const handlePrevious = () => {
    if (viewMode === 'weekly') {
      handleWeekNavigation('previous');
    } else {
      // Existing logic for daily/monthly views
      const newDate = new Date(currentDate);
      if (viewMode === 'today') {
        newDate.setDate(newDate.getDate() - 1);
      } else if (viewMode === 'monthly') {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      setCurrentDate(newDate);
      
      const targetWeekStart = getWeekStartDate(newDate);
      const weekKey = targetWeekStart.toISOString().split('T')[0];
      
      const existingPlan = globalMealPlans.get(weekKey);
      if (existingPlan) {
        setMealPlan(existingPlan);
        setMealPlans([existingPlan]);
      }
    }
  };

  const handleNext = () => {
    if (viewMode === 'weekly') {
      handleWeekNavigation('next');
    } else {
      // Existing logic for daily/monthly views
      const newDate = new Date(currentDate);
      if (viewMode === 'today') {
        newDate.setDate(newDate.getDate() + 1);
      } else if (viewMode === 'monthly') {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      setCurrentDate(newDate);
      
      const targetWeekStart = getWeekStartDate(newDate);
      const weekKey = targetWeekStart.toISOString().split('T')[0];
      
      const existingPlan = globalMealPlans.get(weekKey);
      if (existingPlan) {
        setMealPlan(existingPlan);
        setMealPlans([existingPlan]);
      }
    }
  };

  const handleToday = () => {
    if (viewMode === 'weekly') {
      handleWeekNavigation('current');
    } else {
      // Existing logic for daily/monthly views
      const today = new Date();
      setCurrentDate(today);
      
      const todayWeekStart = getWeekStartDate(today);
      const weekKey = todayWeekStart.toISOString().split('T')[0];
      
      const existingPlan = globalMealPlans.get(weekKey);
      if (existingPlan) {
        setMealPlan(existingPlan);
        setMealPlans([existingPlan]);
      } else {
        const newPlan = getOrCreateMealPlan(today);
        setMealPlan(newPlan);
        setMealPlans([newPlan]);
      }
    }
  };

  // Get formatted date range text
  const getDateRangeText = () => {
    if (viewMode === 'today') {
      return currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } else if (viewMode === 'weekly') {
      // FIXED: Use meal plan's actual week start date instead of calculating from currentDate
      const weekStart = mealPlan?.weekStartDate ? new Date(mealPlan.weekStartDate) : getWeekStartDate(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      console.log('📅 getDateRangeText: Using week start', weekStart.toDateString(), 'from meal plan:', !!mealPlan?.weekStartDate);
      
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (viewMode === 'monthly') {
      return currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    }
    return '';
  };

  // Meal management handlers
  const handleAddMeal = (slot: MealPlanningSlot) => {
    console.log('🍽️ handleAddMeal called with slot:', slot);
    setSelectedSlot(slot);
    setShowQuickAdd(true);
  };

  // Recipe navigation handlers
  const handleShowRecipe = (meal: MealSlot) => {
    console.log('👁️ handleShowRecipe called for meal:', meal.recipeName);
    // Navigate to the full recipe detail page instead of showing popup
    if (meal.recipeId) {
      window.open(`/recipe/${meal.recipeId}`, '_blank');
    }
  };

  // Handle adding meal from MonthlyCalendar (date-based)
  const handleAddMealFromDate = (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    console.log('📅 handleAddMealFromDate called:', { date, mealType });
    
    // Normalize the date to avoid timezone issues
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    // Find which week this date belongs to and convert to dayOfWeek index
    const weekStart = getWeekStartDate(normalizedDate);
    const daysDiff = Math.floor((normalizedDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('📅 Adding meal for date:', normalizedDate.toDateString(), 'weekStart:', weekStart.toDateString(), 'daysDiff:', daysDiff);
    
    // Ensure we have a meal plan for this week
    const weekKey = weekStart.toISOString().split('T')[0];
    if (!globalMealPlans.has(weekKey)) {
      const newPlan = createEmptyMealPlan('current-user', weekStart);
      const updatedGlobalPlans = new Map(globalMealPlans);
      updatedGlobalPlans.set(weekKey, newPlan);
      setGlobalMealPlans(updatedGlobalPlans);
    }

    const slot: MealPlanningSlot = {
      dayOfWeek: daysDiff, // 0-6 (Monday to Sunday)
      mealType: mealType,
      recipeId: '',
      recipeName: '',
      servings: 2,
      prepTime: 30,
      targetDate: normalizedDate // Store the actual target date
    };
    
    setSelectedSlot(slot);
    setShowQuickAdd(true);
  };

  const handleRemoveMeal = async (planId: string, day: number, mealType: string, index: number) => {
    console.log('🗑️ handleRemoveMeal called:', { planId, day, mealType, index });
    
    // Find the correct meal plan (could be from any week if called from monthly view)
    const targetPlan = mealPlan;
    
    // If no current meal plan or if removing from a different week, find the correct one
    if (!targetPlan) {
      console.warn('No meal plan available for removal');
      return;
    }

    const updatedPlan = { ...targetPlan };
    const targetDay = updatedPlan.days[day];
    
    if (targetDay) {
      const meals = targetDay[mealType as keyof typeof targetDay] as MealSlot[];
      meals.splice(index, 1);
      updatedPlan.updatedAt = new Date();
      
      console.log('🗑️ Removing meal from day:', day, 'date:', targetDay.date.toDateString(), 'mealType:', mealType);
      
      // Update meal plan using centralized function with auto-save
      await updateMealPlan(updatedPlan);
    }
  };

  const handleQuickAddSubmit = async (recipeData: QuickRecipeData) => {
    if (!selectedSlot || selectedSlot.dayOfWeek === undefined || !selectedSlot.mealType) return;

    try {
      console.log('handleQuickAddSubmit: Adding recipe from cache:', recipeData);
      // Resolve recipe ID to canonical Mongo ID when possible
      let resolvedId: string | number | undefined = recipeData.id || recipeData.name;
      try {
        if (resolvedId) {
          const res = await fetch('/api/recipes/resolve-id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: String(resolvedId) })
          });
          if (res.ok) {
            const data = await res.json();
            resolvedId = data.mongoId || resolvedId;
          }
        }
  } catch {
        console.warn('resolve-id failed, using fallback id');
      }

      // Map cached recipe data to MealSlot format
      const mealSlot = {
        recipeId: String(resolvedId ?? ''),
        recipeName: recipeData.name || recipeData.title,
        servings: recipeData.servings || 2,
        prepTime: recipeData.cookingTime || recipeData.readyInMinutes || 30,
        cookingTime: recipeData.cookingTime || recipeData.readyInMinutes || 30,
        image: recipeData.image || '',
        ingredients: recipeData.extendedIngredients?.map((ing) => ({ name: ing.original })) || [],
        tags: recipeData.diets || [],
        notes: ''
      };
      
      // Determine which week's meal plan to update - use targetDate if available (from monthly calendar)
      const targetDate = selectedSlot.targetDate || currentDate;
      const targetWeekStart = getWeekStartDate(targetDate);
      const weekKey = targetWeekStart.toISOString().split('T')[0];
      
      console.log('handleQuickAddSubmit: Using targetDate:', targetDate.toDateString(), 'weekStart:', targetWeekStart.toDateString(), 'weekKey:', weekKey);
      console.log('handleQuickAddSubmit: selectedSlot.dayOfWeek:', selectedSlot.dayOfWeek, 'targetDate set by user:', selectedSlot.targetDate?.toDateString());
      
      // Get or create the meal plan for this week
      const targetPlan = getOrCreateMealPlan(targetDate);
      const updatedPlan = { ...targetPlan };
      const targetDay = updatedPlan.days[selectedSlot.dayOfWeek]; // Use array index
      
      console.log('Adding meal to day:', selectedSlot.dayOfWeek, 'date:', targetDay?.date.toDateString(), 'mealType:', selectedSlot.mealType);
      console.log('Week plan days:', updatedPlan.days.map((d, i) => `${i}: ${d.date.toDateString()}`));
      
      if (targetDay) {
        const meals = targetDay[selectedSlot.mealType as keyof typeof targetDay] as MealSlot[];
        meals.push(mealSlot);
        updatedPlan.updatedAt = new Date();
        
        // Update meal plan using centralized function
        await updateMealPlan(updatedPlan);
        
        console.log('Meal added successfully to', targetDay.date.toDateString());
        console.log('Global meal plans now contain:', Array.from(globalMealPlans.keys()));
      }
      
      setShowQuickAdd(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  // Export handlers
  const handleExportMealPlan = async () => {
    try {
      let elementSelector = '';
      if (viewMode === 'today') {
        elementSelector = 'today-view-container';
      } else if (viewMode === 'weekly') {
        elementSelector = 'weekly-calendar-container'; // Use the container wrapper
      } else if (viewMode === 'monthly') {
        elementSelector = 'monthly-calendar-container';
      }
      
      if (elementSelector) {
        const filename = `meal-plan-${viewMode}-${format(currentDate, 'yyyy-MM-dd')}`;
        console.log('🔄 Attempting screenshot of:', elementSelector);
        await exportCalendarAsImage(elementSelector, { format: 'png', filename });
        console.log('📸 Screenshot captured successfully:', filename);
      } else {
        console.error('No valid element selector found for viewMode:', viewMode);
        alert('Unable to determine calendar view for screenshot.');
      }
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert(`Screenshot failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  const handleSavePlan = async (options: SaveOptions) => {
    setIsSaving(true);
    
    try {
      console.log('🔄 Starting save plan with options:', options);
      
      // Enhanced PDF Export
      if (options.exportFormat === 'pdf' && mealPlan) {
        console.log('📄 Generating enhanced PDF export...');
        await exportMealPlanToPDF(mealPlan, { 
          format: 'pdf',
          filename: options.mealPlanTitle ? 
            `${options.mealPlanTitle.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf` :
            `SmartPlates-MealPlan-${format(new Date(), 'yyyy-MM-dd')}.pdf`
        });
        console.log('✅ Enhanced PDF export completed');
      }
      
      // Google Calendar Integration
      if (options.saveToGoogleCalendar && mealPlan) {
        console.log('📅 Adding meal plan to Google Calendar...');
        
        try {
          // Import the Google Calendar service
          const { exportToGoogleCalendar } = await import('@/services/googleCalendarService');
          
          const result = await exportToGoogleCalendar(mealPlan);
          
          if (result.success) {
            console.log('✅ Google Calendar export successful:', result.message);
            alert(`✅ Success! ${result.message}`);
          } else {
            console.error('❌ Google Calendar export failed:', result.message);
            alert(`❌ Google Calendar export failed: ${result.message}`);
          }
        } catch (calendarError) {
          console.error('❌ Google Calendar integration error:', calendarError);
          alert('❌ Failed to add to Google Calendar. Please check your browser settings and try again.');
        }
      }
      
      // Enhanced Grocery List Export
      if (options.includeShoppingList && mealPlan) {
        console.log('🛒 Generating enhanced grocery list...');
        
        // Collect ingredients from all meal types with enhanced ingredient fetching
        const ingredientMap = new Map<string, { amount: string; unit: string; category: string }>();
        
        // 1. Collect all recipe IDs from the meal plan
        const recipeIds: string[] = [];
        mealPlan.days.forEach(day => {
          [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks].forEach(meal => {
            if (meal.recipeId) {
              recipeIds.push(meal.recipeId);
            }
          });
        });
        
        console.log(`🔍 Found ${recipeIds.length} recipes to fetch ingredients for:`, recipeIds);
        
        // 2. Batch fetch ingredients from all three collections via API
        const response = await fetch('/api/ingredients/batch-fetch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ recipeIds }),
        });

        const recipeIngredientsMap = new Map<string, NormalizedIngredient[]>();
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Convert object back to Map
            Object.entries(result.data).forEach(([recipeId, ingredients]) => {
              recipeIngredientsMap.set(recipeId, ingredients as NormalizedIngredient[]);
            });
            console.log(`✅ API: Fetched ingredients for ${recipeIngredientsMap.size} recipes`);
          } else {
            console.warn('⚠️ API returned empty result:', result);
          }
        } else {
          console.error('❌ API call failed:', response.status, response.statusText);
        }
        
        // 3. Process each meal and get ingredients
        mealPlan.days.forEach(day => {
          [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks].forEach(meal => {
            console.log(`🔍 Processing meal: ${meal.recipeName} (ID: ${meal.recipeId})`);
            
            // Try to get ingredients from multiple sources
            let ingredients: NormalizedIngredient[] = [];
            
            // First: Check if we fetched ingredients from database
            if (meal.recipeId && recipeIngredientsMap.has(meal.recipeId)) {
              ingredients = recipeIngredientsMap.get(meal.recipeId)!;
              console.log(`✅ Using ${ingredients.length} ingredients from database for ${meal.recipeName}`);
            }
            // Fallback: Use existing meal.ingredients if available
            else if (meal.ingredients && meal.ingredients.length > 0) {
              ingredients = meal.ingredients.map((ing: any) => ({
                name: ing.name || ing.original || 'Unknown ingredient',
                amount: ing.amount?.toString() || '',
                unit: ing.unit || '',
                category: ing.category || ing.aisle || 'General',
                original: ing.original || ing.name
              }));
              console.log(`✅ Using ${ingredients.length} ingredients from meal.ingredients for ${meal.recipeName}`);
            }
            // Last resort: Use recipe.extendedIngredients if available
            else if (meal.recipe?.extendedIngredients && meal.recipe.extendedIngredients.length > 0) {
              ingredients = meal.recipe.extendedIngredients.map((ing: any) => ({
                name: ing.name || ing.nameClean || ing.original || 'Unknown ingredient',
                amount: ing.amount?.toString() || ing.measures?.metric?.amount?.toString() || '',
                unit: ing.unit || ing.measures?.metric?.unitShort || '',
                category: ing.aisle || 'General',
                original: ing.original || ing.name
              }));
              console.log(`✅ Using ${ingredients.length} ingredients from meal.recipe.extendedIngredients for ${meal.recipeName}`);
            }
            
            if (ingredients.length === 0) {
              console.log(`⚠️ No ingredients found for meal: ${meal.recipeName} (ID: ${meal.recipeId})`);
            }
            
            // Add ingredients to the map
            ingredients.forEach((ingredient) => {
              const cleanName = ingredient.name.toLowerCase().trim();
              
              if (ingredientMap.has(cleanName)) {
                // Ingredient already exists, could combine amounts here
                const existing = ingredientMap.get(cleanName)!;
                // For now, just keep the first occurrence
                console.log(`🔄 Ingredient already exists: ${cleanName}`);
              } else {
                ingredientMap.set(cleanName, {
                  amount: ingredient.amount || '',
                  unit: ingredient.unit || '',
                  category: ingredient.category || 'General'
                });
                console.log(`➕ Added ingredient: ${cleanName} (${ingredient.amount} ${ingredient.unit})`);
              }
            });
          });
        });
        
        console.log(`📊 Total unique ingredients collected: ${ingredientMap.size}`);
        
        // Convert to array and sort by category
        const groceryList = Array.from(ingredientMap.entries()).map(([name, details]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
          amount: details.amount,
          unit: details.unit,
          category: details.category
        })).sort((a, b) => {
          // Sort by category first, then by name
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.name.localeCompare(b.name);
        });
        
        if (groceryList.length > 0) {
          const filename = options.mealPlanTitle ? 
            `${options.mealPlanTitle.replace(/\s+/g, '-')}-grocery-list-${format(new Date(), 'yyyy-MM-dd')}.pdf` :
            `SmartPlates-GroceryList-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
          
          // Export as professional PDF with SmartPlates branding
          exportGroceryListAsPDF(groceryList, filename);
          console.log('✅ Enhanced grocery list PDF exported with professional styling');
        } else {
          console.log('⚠️ No ingredients found for grocery list');
          alert('No ingredients found in your meal plan to create a grocery list.');
        }
      }
      
      // Close modal
      setShowSaveModal(false);
      
      // Show success message
      const actions = [];
      if (options.exportFormat === 'pdf') actions.push('PDF downloaded');
      if (options.saveToGoogleCalendar) actions.push('Google Calendar events created');
      if (options.includeShoppingList) actions.push('Grocery list downloaded');
      
      if (actions.length > 0) {
        const message = `✅ Success! ${actions.join(', ')}.`;
        console.log(message);
      }
      
    } catch (error) {
      console.error('❌ Save plan failed:', error);
      alert(`❌ Save failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Function to refresh all meal plans for statistics
  const refreshAllMealPlansForStats = async () => {
    if (!session?.user?.email) return;
    
    try {
      const response = await fetch('/api/meal-plans');
      if (response.ok) {
        const result = await response.json();
        const allPlans = result.data || [];
        
        const processedPlans = allPlans.map((plan: any) => ({
          ...plan,
          weekStartDate: new Date(plan.weekStartDate),
          days: plan.days.map((day: any) => ({
            ...day,
            date: new Date(day.date)
          }))
        }));
        
        setAllUserMealPlans(processedPlans);
        console.log(`📊 Updated statistics with ${processedPlans.length} meal plans`);
      }
    } catch (error) {
      console.error('❌ Error refreshing meal plans for stats:', error);
    }
  };

  // State for all user meal plans (for statistics)
  const [allUserMealPlans, setAllUserMealPlans] = useState<IMealPlan[]>([]);

  // Calculate stats - use all user meal plans for accurate statistics
  const calculateStats = () => {
    if (allUserMealPlans.length === 0) {
      return { totalRecipes: 0, plannedDays: 0 };
    }
    
    const totalRecipes = allUserMealPlans.reduce((total, plan) => 
      total + plan.days.reduce((dayTotal, day) => 
        dayTotal + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0
      ), 0
    );
    
    const plannedDays = allUserMealPlans.reduce((total, plan) => 
      total + plan.days.filter(day =>
        day.breakfast.length > 0 || day.lunch.length > 0 || day.dinner.length > 0 || day.snacks.length > 0
      ).length, 0
    );
    
    console.log('Stats calculated from all user plans:', { totalRecipes, plannedDays, mealPlansCount: allUserMealPlans.length });
    
    return { totalRecipes, plannedDays };
  };

  const { totalRecipes, plannedDays } = calculateStats();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Meal Plan</h2>
          <p className="text-gray-500">Please wait while we fetch your meal plan...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Meal Plan</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Planning</h1>
            <p className="text-gray-600">Plan your weekly meals and create shopping lists</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('/user/my-recipe/new', '_blank')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Upload Recipe
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalRecipes}
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Planned Days</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {plannedDays}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-[#b0cc9b]" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/user/shopping-list')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shopping Lists</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {shoppingListCount}
                  </p>
                </div>
                <Save className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Section - Button-based Navigation */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            {/* View Mode Selector */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">View:</span>
                <div className="flex rounded-lg border border-blue-200 bg-white p-1 w-full sm:w-auto">
                  <Button
                    variant={viewMode === 'today' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => { 
                      handleToday(); 
                      setViewMode('today'); 
                      refreshCurrentMealPlan(); 
                    }}
                    className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none justify-center ${
                      viewMode === 'today' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span className="hidden sm:inline">📅</span> Today
                  </Button>
                  <Button
                    variant={viewMode === 'weekly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => { 
                      console.log('🔄 Switching to weekly view...');
                      setViewMode('weekly'); 
                      // Enhanced refresh for weekly view
                      setTimeout(() => {
                        refreshCurrentMealPlan();
                        setForceRefreshKey(prev => prev + 1);
                      }, 100);
                    }}
                    className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none justify-center ${
                      viewMode === 'weekly' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span className="hidden sm:inline">📅</span> Week
                  </Button>
                  <Button
                    variant={viewMode === 'monthly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => { setViewMode('monthly'); refreshCurrentMealPlan(); }}
                    className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none justify-center ${
                      viewMode === 'monthly' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span className="hidden sm:inline">🗓️</span> Month
                  </Button>
                </div>
              </div>

              {/* Centered Actions with Search and Export */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 flex-1 lg:max-w-lg xl:max-w-xl">
                {/* Date Search - Responsive width */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search date (YYYY-MM-DD)"
                    value={dateSearchValue}
                    onChange={(e) => setDateSearchValue(e.target.value)}
                    onKeyPress={handleDateSearchKeyPress}
                    className="pl-10 h-8 sm:h-9 bg-white border-blue-200 text-sm w-full"
                  />
                </div>
    
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 whitespace-nowrap h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
                  title="Export as PDF"
                >
                  <span className="hidden sm:inline">📄</span> Save Plan
                </Button>
              </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="flex items-center gap-1 sm:gap-2 bg-white hover:bg-blue-50 border-blue-200 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">
                  {viewMode === 'today' && 'Previous Day'}
                  {viewMode === 'weekly' && 'Previous Week'}
                  {viewMode === 'monthly' && 'Previous Month'}
                </span>
                <span className="sm:hidden">
                  {viewMode === 'today' && 'Prev'}
                  {viewMode === 'weekly' && 'Prev'}
                  {viewMode === 'monthly' && 'Prev'}
                </span>
              </Button>

              <div className="text-center flex-1 px-2">
                <div className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 truncate">
                  {getDateRangeText()}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {viewMode === 'today' && 'Daily View'}
                  {viewMode === 'weekly' && 'Weekly View'}
                  {viewMode === 'monthly' && 'Monthly View'}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="flex items-center gap-1 sm:gap-2 bg-white hover:bg-blue-50 border-blue-200 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
              >
                <span className="hidden sm:inline">
                  {viewMode === 'today' && 'Next Day'}
                  {viewMode === 'weekly' && 'Next Week'}
                  {viewMode === 'monthly' && 'Next Month'}
                </span>
                <span className="sm:hidden">
                  {viewMode === 'today' && 'Next'}
                  {viewMode === 'weekly' && 'Next'}
                  {viewMode === 'monthly' && 'Next'}
                </span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Views */}
        <div className="bg-white rounded-lg border shadow-sm">
          {viewMode === 'today' && (
            <div id="today-view-container" className="p-8 today-view-container">
              <TodayView
                currentDate={currentDate}
                mealPlans={Array.from(globalMealPlans.values())}
                onAddMeal={handleAddMeal}
                onEditMeal={(slot) => {
                  setSelectedSlot(slot);
                  setShowQuickAdd(true);
                }}
                onRemoveMeal={handleRemoveMeal}
                onShowRecipe={handleShowRecipe}
                onCopyRecipe={handleCopyRecipe}
                copiedRecipe={copiedRecipe}
                onClearCopiedRecipe={handleClearCopiedRecipe}
                onMealPlanChange={updateMealPlan}
              />
            </div>
          )}
          
          {viewMode === 'weekly' && (
            <div id="weekly-calendar-container" className="weekly-calendar-container">
              {mealPlan ? (
                <WeeklyCalendar
                key={`weekly-${mealPlan._id}-${forceRefreshKey}-${mealPlan.weekStartDate?.toISOString()}`}
                mealPlan={mealPlan}
                mealPlans={Array.from(globalMealPlans.values())}
                currentDate={currentDate}
                onMealPlanChange={async (updatedPlan) => {
                  console.log('🔔 WeeklyCalendar onMealPlanChange called with plan:', {
                    id: updatedPlan._id,
                    title: updatedPlan.title,
                    totalMeals: updatedPlan.days.reduce((total, day) => 
                      total + (day.breakfast?.length || 0) + (day.lunch?.length || 0) + 
                      (day.dinner?.length || 0) + (day.snacks?.length || 0), 0
                    )
                  });
                  await updateMealPlan(updatedPlan);
                  console.log('✅ WeeklyCalendar onMealPlanChange updateMealPlan completed');
                }}
                onAddMeal={handleAddMeal}
                onEditMeal={(editSlot) => {
                  console.log('📝 WeeklyCalendar edit meal requested:', editSlot);
                  setSelectedSlot(editSlot);
                  setShowQuickAdd(true);
                }}
                onWeekNavigation={handleWeekNavigation}
                onRemoveMeal={handleRemoveMeal}
                onShowRecipe={handleShowRecipe}
                onCopyRecipe={handleCopyRecipe}
                copiedRecipe={copiedRecipe}
                onClearCopiedRecipe={handleClearCopiedRecipe}
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Loading meal plan...</p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-400">
                      Meal Plan ID: {mealPlanId || 'Not provided'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Global Plans Loaded: {globalMealPlans.size}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {viewMode === 'monthly' && (
            <div id="monthly-calendar-container" className="monthly-calendar-container">
              <MonthlyCalendar
              currentDate={currentDate}
              mealPlans={Array.from(globalMealPlans.values())}
              onAddRecipe={handleAddMealFromDate}
              onRemoveMeal={handleRemoveMeal}
              onShowRecipe={handleShowRecipe}
              onCopyRecipe={handleCopyRecipe}
              copiedRecipe={copiedRecipe}
              onClearCopiedRecipe={handleClearCopiedRecipe}
              onEditMeal={(meal: MealSlot, date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
                // Normalize the date to avoid timezone issues
                const normalizedDate = new Date(date);
                normalizedDate.setHours(0, 0, 0, 0);
                
                // Convert date to proper slot format for editing
                const weekStart = getWeekStartDate(normalizedDate);
                const daysDiff = Math.floor((normalizedDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
                
                const slot: MealPlanningSlot = {
                  dayOfWeek: daysDiff,
                  mealType: mealType,
                  recipeId: meal.recipeId,
                  recipeName: meal.recipeName,
                  servings: meal.servings,
                  prepTime: meal.prepTime,
                  notes: meal.notes
                };
                
                setSelectedSlot(slot);
                setShowQuickAdd(true);
              }}
            />
            </div>
          )}
        </div>

        {/* Modals */}
        {showQuickAdd && selectedSlot && (
          <QuickAddRecipeModal
            isOpen={showQuickAdd}
            onClose={() => {
              setShowQuickAdd(false);
              setSelectedSlot(null);
            }}
            onAddRecipe={(recipeId: string, recipeName: string, servings: number, cookingTime: number, image?: string) => {
              handleQuickAddSubmit({ id: recipeId, name: recipeName, servings, cookingTime, image });
            }}
            mealType={selectedSlot.mealType || 'breakfast'}
            dayName={selectedSlot.dayOfWeek !== undefined ? format(addDays(currentDate, selectedSlot.dayOfWeek), 'EEEE') : 'Unknown Day'}
          />
        )}

        {showSaveModal && (
          <SavePlanModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSavePlan}
          />
        )}
        </div>
    </DndProvider>
  );
}