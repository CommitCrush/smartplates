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
import { useParams } from 'next/navigation';
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
import { RecipeDetailModal } from '@/components/meal-planning/modals/RecipeDetailModal';
import { getWeekStartDate, createEmptyMealPlan } from '@/types/meal-planning';
import type { IMealPlan, MealSlot as MealSlotType, MealPlanningSlot } from '@/types/meal-planning';
import { useSession } from 'next-auth/react';
// import { ObjectId } from 'mongodb';
// ...existing code...
import { 
  exportCalendarAsImage,
  exportMealPlanToPDF,
  exportGroceryListAsText
} from '@/utils/mealPlanExport';

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
          if (onShowRecipe) { 
            // Convert the meal data to MealSlot format
            const mealSlot: MealSlotType = {
              recipeId: meal.recipeId || '',
              recipeName: meal.recipeName || 'Unknown Recipe',
              servings: meal.servings || 2,
              prepTime: meal.prepTime || 30,
              cookingTime: meal.cookingTime || 0,
              notes: meal.notes || '',
              image: meal.image || ''
            };
            // Call the passed handler
            onShowRecipe(mealSlot);
            console.log('🍽️ Called onShowRecipe with meal:', mealSlot);
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
                    Paste "{copiedRecipe.recipeName || 'Recipe'}"
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
  const { data: session } = useSession();
  const mealPlanId = params.id as string;
  
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
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<MealSlotType | null>(null);
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

  // Update a specific meal plan and sync with global storage
  const updateMealPlan = (updatedPlan: IMealPlan) => {
    // Ensure weekStartDate is a Date object
    const weekStartDate = updatedPlan.weekStartDate instanceof Date 
      ? updatedPlan.weekStartDate 
      : new Date(updatedPlan.weekStartDate);
      
    const weekKey = weekStartDate.toISOString().split('T')[0];
    console.log('🔄 Updating meal plan for week:', weekKey, 'with', updatedPlan.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0), 'total meals');
    
    // Update global storage
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
  }, [mealPlanId, session?.user?.email]);

  // Function to refresh meal plan data
  const refreshCurrentMealPlan = useCallback(() => {
    const weekKey = getWeekStartDate(currentDate).toISOString().split('T')[0];
    
    console.log('🔄 RefreshCurrentMealPlan called for week:', weekKey, 'current viewMode:', viewMode);
    
    // First check if we have the meal plan in global storage
    const existingPlan = globalMealPlans.get(weekKey);
    if (existingPlan) {
      console.log('🔄 Found in globalMealPlans for week:', weekKey, 'with', existingPlan.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0), 'meals');
      
      // Force update local state
      setMealPlan(existingPlan);
      setMealPlans([existingPlan]);
      return;
    }
    
    // Check if current mealPlan is for this week (avoid creating new plans)
    if (mealPlan && mealPlan.weekStartDate) {
      const mealPlanWeekKey = getWeekStartDate(mealPlan.weekStartDate).toISOString().split('T')[0];
      if (mealPlanWeekKey === weekKey) {
        console.log('🔄 Current mealPlan is already for the correct week:', weekKey);
        
        // Add to global storage for consistency
        const updatedGlobalPlans = new Map(globalMealPlans);
        updatedGlobalPlans.set(weekKey, mealPlan);
        setGlobalMealPlans(updatedGlobalPlans);
        
        // Keep current meal plan
        setMealPlans([mealPlan]);
        return;
      }
    }
    
    console.log('⚠️ No meal plan found for week:', weekKey, '- keeping current state or creating minimal plan');
    
    // Only create a new plan if absolutely necessary 
    if (!mealPlan) {
      const currentPlan = getOrCreateMealPlan(currentDate);
      setMealPlan(currentPlan);
      setMealPlans([currentPlan]);
    }
  }, [currentDate, globalMealPlans, mealPlan, viewMode]);

  // Sync meal plan when view mode changes - placed after refreshCurrentMealPlan definition
  useEffect(() => {
    if (isLoading || !session?.user?.email) return;
    
    console.log('🔄 View mode changed to:', viewMode, 'refreshing meal plan for current date:', currentDate.toDateString());
    
    // Delay execution to avoid conflicts with other state updates
    const timeoutId = setTimeout(() => {
      refreshCurrentMealPlan();
    }, 100);
    
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

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'today') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
    // Meal plan will be updated by useEffect
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'today') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    // Meal plan will be updated by useEffect
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    
    // Update meal plan for current week
    const weekStart = getWeekStartDate(today);
    const newPlan = createEmptyMealPlan('current-user', weekStart);
    setMealPlan(newPlan);
    setMealPlans([newPlan]);
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
      const weekStart = getWeekStartDate(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
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
    setSelectedSlot(slot);
    setShowQuickAdd(true);
  };

  // Recipe modal handlers
  const handleShowRecipe = (meal: MealSlot) => {
    setSelectedRecipe(meal);
    setShowRecipeModal(true);
  };

  const handleCloseRecipeModal = () => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  };

  // Handle adding meal from MonthlyCalendar (date-based)
  const handleAddMealFromDate = (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    // Normalize the date to avoid timezone issues
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    // Find which week this date belongs to and convert to dayOfWeek index
    const weekStart = getWeekStartDate(normalizedDate);
    const daysDiff = Math.floor((normalizedDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('Adding meal for date:', normalizedDate.toDateString(), 'weekStart:', weekStart.toDateString(), 'daysDiff:', daysDiff);
    
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

  const handleRemoveMeal = (planId: string, day: number, mealType: string, index: number) => {
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
      
      console.log('Removing meal from day:', day, 'date:', targetDay.date.toDateString(), 'mealType:', mealType);
      
      // Update meal plan using centralized function
      updateMealPlan(updatedPlan);
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
        updateMealPlan(updatedPlan);
        
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
      if (options.exportFormat === 'pdf' && mealPlan) {
        await exportMealPlanToPDF(mealPlan, { format: 'pdf' });
      }
      if (options.includeShoppingList && mealPlan) {
        // Generate grocery list from meal plan ingredients
        const groceryList = mealPlan.days.flatMap(day => 
          [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks]
            .flatMap(meal => {
              // Get ingredients from recipe.extendedIngredients or direct ingredients array
              const ingredients = meal.recipe?.extendedIngredients || meal.ingredients || [];
              return ingredients;
            })
            .map(ingredient => ({
              name: ingredient.name || ingredient.nameClean || 'Unknown ingredient',
              amount: ingredient.amount?.toString() || '',
              unit: ingredient.unit || '',
              category: 'general'
            }))
        );
        
        if (groceryList.length > 0) {
          exportGroceryListAsText(groceryList);
        }
      }
      
      setShowSaveModal(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate stats - always use all meal plans for consistent stats across views
  const calculateStats = () => {
    const allMealPlans = Array.from(globalMealPlans.values());
    
    if (allMealPlans.length === 0) {
      return { totalRecipes: 0, plannedDays: 0 };
    }
    
    const totalRecipes = allMealPlans.reduce((total, plan) => 
      total + plan.days.reduce((dayTotal, day) => 
        dayTotal + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0
      ), 0
    );
    
    const plannedDays = allMealPlans.reduce((total, plan) => 
      total + plan.days.filter(day =>
        day.breakfast.length > 0 || day.lunch.length > 0 || day.dinner.length > 0 || day.snacks.length > 0
      ).length, 0
    );
    
    console.log('Stats calculated:', { totalRecipes, plannedDays, mealPlansCount: allMealPlans.length });
    
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Planning</h1>
            <p className="text-gray-600">Plan your weekly meals and create shopping lists</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowQuickAdd(true)}
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
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shopping List</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(mealPlan?.shoppingListGenerated) ? 'Yes' : 'No'}
                  </p>
                </div>
                <Save className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Section - Button-based Navigation */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <CardContent className="p-6">
            {/* View Mode Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">View:</span>
                <div className="flex rounded-lg border border-blue-200 bg-white p-1">
                  <Button
                    variant={viewMode === 'today' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => { 
                      handleToday(); 
                      setViewMode('today'); 
                      refreshCurrentMealPlan(); 
                    }}
                    className={`flex items-center gap-2 ${
                      viewMode === 'today' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    📅 Today
                  </Button>
                  <Button
                    variant={viewMode === 'weekly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => { setViewMode('weekly'); refreshCurrentMealPlan(); }}
                    className={`flex items-center gap-2 ${
                      viewMode === 'weekly' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    � Week
                  </Button>
                  <Button
                    variant={viewMode === 'monthly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => { setViewMode('monthly'); refreshCurrentMealPlan(); }}
                    className={`flex items-center gap-2 ${
                      viewMode === 'monthly' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    �️ Month
                  </Button>
                </div>
              </div>

              {/* Centered Actions with Search and Export */}
              <div className="flex items-center justify-center gap-3 flex-1">
                {/* Date Search - Made wider and better centered */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search date (YYYY-MM-DD, DD/MM/YYYY)"
                    value={dateSearchValue}
                    onChange={(e) => setDateSearchValue(e.target.value)}
                    onKeyPress={handleDateSearchKeyPress}
                    className="pl-10 w-96 h-8 bg-white border-blue-200 text-sm"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportMealPlan}
                  className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200"
                  title="Take Screenshot"
                >
                  📸 Screenshot
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200"
                  title="Export as PDF"
                >
                  📄 Save Plan
                </Button>
              </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200"
              >
                <ChevronLeft className="h-4 w-4" />
                {viewMode === 'today' && 'Previous Day'}
                {viewMode === 'weekly' && 'Previous Week'}
                {viewMode === 'monthly' && 'Previous Month'}
              </Button>

              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900">
                  {getDateRangeText()}
                </div>
                <div className="text-sm text-gray-500">
                  {viewMode === 'today' && 'Daily View'}
                  {viewMode === 'weekly' && 'Weekly View'}
                  {viewMode === 'monthly' && 'Monthly View'}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200"
              >
                {viewMode === 'today' && 'Next Day'}
                {viewMode === 'weekly' && 'Next Week'}
                {viewMode === 'monthly' && 'Next Month'}
                <ChevronRight className="h-4 w-4" />
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
          
          {viewMode === 'weekly' && mealPlan && (
            <div id="weekly-calendar-container" className="weekly-calendar-container">
              <WeeklyCalendar
              mealPlan={mealPlan}
              mealPlans={Array.from(globalMealPlans.values())}
              currentDate={currentDate}
              onMealPlanChange={(updatedPlan) => {
                console.log('WeeklyCalendar onMealPlanChange called');
                updateMealPlan(updatedPlan);
              }}
              onAddMeal={handleAddMeal}
              onRemoveMeal={handleRemoveMeal}
              onShowRecipe={handleShowRecipe}
              onCopyRecipe={handleCopyRecipe}
              copiedRecipe={copiedRecipe}
              onClearCopiedRecipe={handleClearCopiedRecipe}
            />
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
            onAddRecipe={(recipeId: string, recipeName: string, servings?: number, cookingTime?: number, image?: string) => {
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

        {/* Recipe Detail Modal */}
        <RecipeDetailModal
          meal={selectedRecipe}
          open={showRecipeModal}
          onOpenChange={(open) => {
            if (!open) handleCloseRecipeModal();
          }}
          dayName="Today"
          mealType="Unknown"
        />
        </div>
    </DndProvider>
  );
}