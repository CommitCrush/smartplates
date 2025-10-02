/**
 * Individual Meal Plan API Routes
 * 
 * Handles operations on specific meal plans
 * GET /api/meal-plans/[id] - Get specific meal plan
 * PUT /api/meal-plans/[id] - Update meal plan
 * DELETE /api/meal-plans/[id] - Delete meal plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import MealPlan from '@/models/MealPlan';
import { connectToDatabase } from '@/lib/mongodb';

// ========================================
// GET /api/meal-plans/[id]
// ========================================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;
    
    await connectToDatabase();

    // Check if id is a valid ObjectId or handle it as a string
    let mealPlan;
    try {
      mealPlan = await MealPlan.findOne({
        _id: id,
        userId: session.user.id
      }).exec();
    } catch (mongoError) {
      // If ObjectId is invalid, return 404
      console.error('Invalid ObjectId:', id, mongoError);
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mealPlan
    });

  } catch (error) {
    console.error('GET /api/meal-plans/[id] error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ========================================
// PUT /api/meal-plans/[id]
// ========================================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const body = await request.json();
    const { days, title, tags, totalCalories, shoppingListGenerated } = body;

    await connectToDatabase();

    const mealPlan = await MealPlan.findOne({
      _id: params.id,
      userId: session.user.id
    }).exec();

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Update meal plan fields
    if (days) mealPlan.days = days;
    if (title !== undefined) mealPlan.title = title;
    if (tags) mealPlan.tags = tags;
    if (totalCalories !== undefined) mealPlan.totalCalories = totalCalories;
    if (shoppingListGenerated !== undefined) mealPlan.shoppingListGenerated = shoppingListGenerated;
    
    mealPlan.updatedAt = new Date();

    const updatedMealPlan = await mealPlan.save();

    return NextResponse.json({
      success: true,
      data: updatedMealPlan,
      message: 'Meal plan updated successfully'
    });

  } catch (error) {
    console.error('PUT /api/meal-plans/[id] error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ========================================
// DELETE /api/meal-plans/[id]
// ========================================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    await connectToDatabase();

    const deletedMealPlan = await MealPlan.findOneAndDelete({
      _id: params.id,
      userId: session.user.id
    }).exec();

    if (!deletedMealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Meal plan deleted successfully',
      data: { id: params.id }
    });

  } catch (error) {
    console.error('DELETE /api/meal-plans/[id] error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}