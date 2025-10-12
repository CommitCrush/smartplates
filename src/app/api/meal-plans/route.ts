/**
 * Meal Plans API Routes
 * 
 * Handles CRUD operations for meal plans
 * GET /api/meal-plans - Get user's meal plans
 * POST /api/meal-plans - Create new meal plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MealPlanService } from '@/models/MealPlan';
import { getWeekStartDate } from '@/types/meal-planning';

// ========================================
// GET /api/meal-plans
// ========================================
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart') || searchParams.get('weekStartDate');
    const isTemplate = searchParams.get('template') === 'true';

    // Use email as fallback for userId if id is not available
    const userId = session.user.id || session.user.email!;

    let mealPlans;

    if (isTemplate) {
      // Get user templates
      mealPlans = await MealPlanService.findUserTemplates(userId);
    } else if (weekStart) {
      // Get specific week
      const weekStartDate = getWeekStartDate(new Date(weekStart));
      const mealPlan = await MealPlanService.findByUserAndWeek(userId, weekStartDate);
      mealPlans = mealPlan ? [mealPlan] : [];
    } else {
      // Get all user meal plans
      mealPlans = await MealPlanService.findByUserId(userId);
    }

    // Enrich meal plans with recipe information
    const enrichedMealPlans = await Promise.all(
      mealPlans.map(plan => MealPlanService.enrichMealPlanWithRecipes(plan))
    );

    console.log(`📋 Found ${enrichedMealPlans.length} meal plans for user ${userId}`);

    return NextResponse.json({
      success: true,
      data: enrichedMealPlans.map(plan => ({
        ...plan,
        _id: plan._id?.toString()
      })),
      count: enrichedMealPlans.length
    });

  } catch (error) {
    console.error('GET /api/meal-plans error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch meal plans',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ========================================
// POST /api/meal-plans
// ========================================
export async function POST(request: NextRequest) {
  let weekStartDate: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🔍 POST /api/meal-plans - Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (!session?.user?.id && !session?.user?.email) {
      console.error('❌ Authentication failed - no valid session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📝 Request body received:', {
      hasWeekStartDate: !!body.weekStartDate,
      hasTitle: !!body.title,
      hasDays: !!body.days,
      daysLength: body.days?.length
    });
    
    const { title, isTemplate, copyFromWeek } = body;
    weekStartDate = body.weekStartDate; // Store for error handling

    if (!weekStartDate) {
      return NextResponse.json(
        { error: 'weekStartDate is required' },
        { status: 400 }
      );
    }

    // Use email as fallback for userId if id is not available
    const userId = session.user.id || session.user.email!;
    console.log('👤 Using userId:', userId);

    // Check if meal plan already exists for this week
    const weekStart = getWeekStartDate(new Date(weekStartDate));
    const existingPlan = await MealPlanService.findByUserAndWeek(userId, weekStart);

    if (existingPlan) {
      // Return existing meal plan instead of creating a duplicate
      console.log(`✅ Returning existing meal plan for week ${weekStart.toISOString()}`);
      return NextResponse.json({
        success: true,
        data: existingPlan,
        message: 'Existing meal plan found for this week'
      }, { status: 200 });
    }

    const mealPlanData: any = {
      userId: userId,
      weekStartDate: weekStart,
      title: title || `Week of ${weekStart.toLocaleDateString()}`,
      isTemplate: isTemplate || false
    };

    // If copying from another week
    if (copyFromWeek) {
      const sourceMealPlan = await MealPlanService.findByUserAndWeek(userId, new Date(copyFromWeek));

      if (sourceMealPlan) {
        mealPlanData.days = sourceMealPlan.days.map((day: any) => ({
          ...day,
          date: new Date(mealPlanData.weekStartDate.getTime() + 
            (day.date.getDay() * 24 * 60 * 60 * 1000))
        }));
      }
    }

    console.log('💾 Creating meal plan with data:', {
      userId: userId,
      weekStartDate: mealPlanData.weekStartDate,
      title: mealPlanData.title
    });

    // Create meal plan using service
    const savedMealPlan = await MealPlanService.create(mealPlanData);
    console.log('✅ Meal plan saved successfully with ID:', savedMealPlan._id);

    return NextResponse.json({
      success: true,
      data: {
        ...savedMealPlan,
        _id: savedMealPlan._id?.toString()
      },
      message: 'Meal plan created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ POST /api/meal-plans error:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      weekStartDate
    });
    
    // Handle duplicate key error (user already has meal plan for this week)
    if (error instanceof Error && (error.message.includes('duplicate key') || error.message.includes('E11000'))) {
      return NextResponse.json(
        { 
          error: 'Meal plan already exists for this week',
          details: 'You can only have one meal plan per week. Try updating the existing plan.'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}