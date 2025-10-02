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
import MealPlan from '@/models/MealPlan';
import { getWeekStartDate } from '@/types/meal-planning';
import { connectToDatabase } from '@/lib/mongodb';

// ========================================
// GET /api/meal-plans
// ========================================
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart') || searchParams.get('weekStartDate');
    const isTemplate = searchParams.get('template') === 'true';

    let query: any = { userId: session.user.id };

    if (isTemplate) {
      query = { ...query, isTemplate: true };
    } else if (weekStart) {
      const weekStartDate = getWeekStartDate(new Date(weekStart));
      query = { ...query, weekStartDate: weekStartDate };
    }

    const mealPlans = await MealPlan.find(query).sort({ weekStartDate: -1 }).exec();

    return NextResponse.json({
      success: true,
      data: mealPlans,
      count: mealPlans.length
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
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { weekStartDate, title, isTemplate, copyFromWeek } = body;

    await connectToDatabase();

    // Check if meal plan already exists for this week using getWeekStartDate for consistency
    const weekStart = getWeekStartDate(new Date(weekStartDate));
    const existingPlan = await MealPlan.findOne({
      userId: session.user.id,
      weekStartDate: weekStart
    }).exec();

    if (existingPlan) {
      // Return existing meal plan instead of creating a duplicate
      console.log(`Returning existing meal plan for week ${weekStart.toISOString()}`);
      return NextResponse.json({
        success: true,
        data: existingPlan,
        message: 'Existing meal plan found for this week'
      }, { status: 200 });
    }

    const mealPlanData: any = {
      userId: session.user.id,
      weekStartDate: weekStart,
      title: title || `Week of ${weekStart.toLocaleDateString()}`,
      isTemplate: isTemplate || false
    };

    // If copying from another week
    if (copyFromWeek) {
      const sourceMealPlan = await MealPlan.findOne({
        userId: session.user.id,
        weekStartDate: new Date(copyFromWeek)
      }).exec();

      if (sourceMealPlan) {
        mealPlanData.days = sourceMealPlan.days.map((day: any) => ({
          ...day,
          date: new Date(mealPlanData.weekStartDate.getTime() + 
            (day.date.getDay() * 24 * 60 * 60 * 1000))
        }));
      }
    }

    // Create the meal plan
    const weekEndDate = new Date(mealPlanData.weekStartDate.getTime() + (6 * 24 * 60 * 60 * 1000));
    const weekDates = Array.from({length: 7}, (_, i) => {
      const date = new Date(mealPlanData.weekStartDate);
      date.setDate(mealPlanData.weekStartDate.getDate() + i);
      return date;
    });
    
    const mealPlan = new MealPlan({
      userId: session.user.id,
      weekStartDate: mealPlanData.weekStartDate,
      weekEndDate,
      title: mealPlanData.title || `Week of ${mealPlanData.weekStartDate.toLocaleDateString()}`,
      days: weekDates.map(date => ({
        date,
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      })),
      ...mealPlanData
    });

    const savedMealPlan = await mealPlan.save();

    return NextResponse.json({
      success: true,
      data: savedMealPlan,
      message: 'Meal plan created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/meal-plans error:', error);
    
    // Handle duplicate key error (user already has meal plan for this week)
    if (error instanceof Error && (error.message.includes('duplicate key') || error.message.includes('E11000'))) {
      // Try to find the existing meal plan and return it
      try {
        const existingPlan = await MealPlan.findOne({
          userId: session.user.id,
          weekStartDate: new Date(weekStartDate)
        }).exec();
        
        if (existingPlan) {
          return NextResponse.json({
            success: true,
            data: existingPlan,
            message: 'Existing meal plan found'
          }, { status: 200 });
        }
      } catch (findError) {
        console.error('Error finding existing meal plan:', findError);
      }
      
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