/**
 * Planned Recipes API Route
 * 
 * Retrieves all planned recipes from user's meal plans
 * GET /api/users/planned-recipes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MealPlanService, type IMealPlan, type MealSlot } from '@/models/MealPlan';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use email as fallback for userId if id is not available
    const userId = session.user.id || session.user.email!;

    // Get all meal plans for this user
    const mealPlans = await MealPlanService.findByUserId(userId);
    
    // Enrich meal plans with recipe information
    const enrichedMealPlans = await Promise.all(
      mealPlans.map(plan => MealPlanService.enrichMealPlanWithRecipes(plan))
    );

    // Extract all planned recipes with their planning details
    const plannedRecipes: Array<{
      id: string;
      title: string;
      description?: string;
      image?: string;
      cookingTime?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
      category?: string;
      isPublic?: boolean;
      createdAt: string;
      plannedDate: string;
      weekRange: string;
      mealType: string;
      servings?: number;
      notes?: string;
      originalRecipeId?: string;
    }> = [];

    enrichedMealPlans.forEach((plan: IMealPlan) => {
      const weekStart = new Date(plan.weekStartDate);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      const weekRange = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

      plan.days.forEach((day: any) => {
        const dayDate = new Date(day.date);
        
        // Process all meal types
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
          const meals = day[mealType] as MealSlot[];

          if (meals && Array.isArray(meals)) {
            meals.forEach((meal, mealIndex) => {
              if (meal.recipeName) {
                // Create a unique ID that includes plan ID, date, meal type, and meal index to avoid duplicates
                const uniqueId = `planned-${plan._id}-${dayDate.toISOString().split('T')[0]}-${mealType}-${mealIndex}`;
                
                plannedRecipes.push({
                  id: uniqueId,
                  title: meal.recipeName,
                  description: meal.notes || `Planned for ${mealType}`,
                  image: meal.image || '/placeholder-recipe.svg',
                  cookingTime: meal.totalTime || meal.cookingTime || meal.prepTime || 30,
                  difficulty: meal.difficulty || 'medium' as const,
                  category: meal.category || 'Planned',
                  isPublic: true,
                  createdAt: plan.createdAt?.toISOString() || new Date().toISOString(),
                  plannedDate: dayDate.toISOString(),
                  weekRange,
                  mealType: mealType.charAt(0).toUpperCase() + mealType.slice(1),
                  servings: meal.servings,
                  notes: meal.notes,
                  originalRecipeId: meal.recipeId // Keep the original recipe ID for reference
                });
              }
            });
          }
        });
      });
    });

    // Sort by planned date (most recent first)
    plannedRecipes.sort((a, b) => new Date(b.plannedDate).getTime() - new Date(a.plannedDate).getTime());

    console.log(`📅 Planned recipes count - User: ${userId}, Total planned recipes: ${plannedRecipes.length}`);

    return NextResponse.json({
      success: true,
      data: plannedRecipes,
      count: plannedRecipes.length
    });

  } catch (error) {
    console.error('GET /api/users/planned-recipes error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch planned recipes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}