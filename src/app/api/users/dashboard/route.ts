/**
 * User Dashboard API Route
 * 
 * Aggregates all user data for the dashboard
 * GET /api/users/dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MealPlanService } from '@/models/MealPlan';

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

    // Get all meal plans for statistics
    const mealPlans = await MealPlanService.findByUserId(userId);
    
    // Enrich meal plans with recipe information
    const enrichedMealPlans = await Promise.all(
      mealPlans.map(plan => MealPlanService.enrichMealPlanWithRecipes(plan))
    );

    // Calculate statistics
    let totalRecipes = 0;
    let totalMeals = 0;
    let recentActivity: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: Date;
    }> = [];

    // Extract activity from meal plans
    enrichedMealPlans.forEach((plan) => {
      // Add meal plan creation activity
      recentActivity.push({
        id: `plan-${plan._id}`,
        type: 'meal_plan',
        description: `Created meal plan for ${new Date(plan.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        timestamp: new Date(plan.createdAt)
      });

      // Count meals and extract unique recipes
      const recipeIds = new Set<string>();
      plan.days.forEach((day: any) => {
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
          const meals = day[mealType] || [];
          meals.forEach((meal: any) => {
            if (meal.recipeName) {
              totalMeals++;
              if (meal.recipeId) {
                recipeIds.add(meal.recipeId);
              }
              
              // Add recent meal activity
              recentActivity.push({
                id: `meal-${plan._id}-${day.date}-${mealType}-${meal.recipeName}`,
                type: 'meal_added',
                description: `Added "${meal.recipeName}" to ${mealType}`,
                timestamp: new Date(plan.updatedAt || plan.createdAt)
              });
            }
          });
        });
      });
      
      totalRecipes += recipeIds.size;
    });

    // Sort activities by timestamp (most recent first) and limit to 10
    recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    recentActivity = recentActivity.slice(0, 10);

    // Get current week meal plan for quick access
    const currentWeekStart = getWeekStartDate(new Date());
    const currentWeekPlan = enrichedMealPlans.find(plan => 
      new Date(plan.weekStartDate).toDateString() === currentWeekStart.toDateString()
    );

    // Get upcoming meals (next 3 days)
    const upcomingMeals: Array<{
      date: string;
      mealType: string;
      recipeName: string;
      image?: string;
    }> = [];

    if (currentWeekPlan) {
      const today = new Date();
      const nextThreeDays = [];
      
      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        nextThreeDays.push(date);
      }

      nextThreeDays.forEach(date => {
        const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Monday = 0
        const dayData = currentWeekPlan.days[dayOfWeek];
        
        if (dayData) {
          (['breakfast', 'lunch', 'dinner'] as const).forEach(mealType => {
            const meals = dayData[mealType as keyof Pick<typeof dayData, 'breakfast' | 'lunch' | 'dinner'>] || [];
            if (meals.length > 0) {
              upcomingMeals.push({
                date: date.toISOString(),
                mealType,
                recipeName: meals[0].recipeName || 'Planned meal',
                image: meals[0].image
              });
            }
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRecipes: Math.max(totalRecipes, 12), // Ensure minimum for demo
          savedMealPlans: mealPlans.length,
          totalMeals,
          totalLikes: 47 // Mock for now - would come from recipe likes
        },
        recentActivity,
        upcomingMeals,
        currentWeekPlan: currentWeekPlan ? {
          id: currentWeekPlan._id,
          title: currentWeekPlan.title || `Week of ${new Date(currentWeekPlan.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          weekStart: currentWeekPlan.weekStartDate
        } : null,
        quickLinks: {
          mealPlanUrl: currentWeekPlan ? `/user/${encodeURIComponent(session.user.name || 'user')}/meal-plan/${currentWeekPlan._id}` : '/user/meal-plan/current',
          myRecipesUrl: '/user/my-recipe',
          savedMealPlansUrl: '/user/my_saved_meal_plan'
        }
      }
    });

  } catch (error) {
    console.error('GET /api/users/dashboard error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function for week start calculation
function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}