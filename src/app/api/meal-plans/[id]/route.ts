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
import { MealPlanService } from '@/models/MealPlan';

// ========================================
// GET /api/meal-plans/[id]
// ========================================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;
    
    // Use email as fallback for userId if id is not available
    const userId = session.user.id || session.user.email!;

    // Get meal plan by ID
    const mealPlan = await MealPlanService.findById(id);

    if (!mealPlan || mealPlan.userId !== userId) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Enrich meal plan with recipe information
    const enrichedMealPlan = await MealPlanService.enrichMealPlanWithRecipes(mealPlan);

    // Convert to plain object to avoid Mongoose-specific properties and ensure _id is a string
    const mealPlanObject = JSON.parse(JSON.stringify(enrichedMealPlan));

    return NextResponse.json({
      success: true,
      data: mealPlanObject
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
    
    console.log('🔍 PUT /api/meal-plans/[id] - Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (!session?.user?.id && !session?.user?.email) {
      console.error('❌ PUT Authentication failed - no valid session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const body = await request.json();
    
    console.log('📝 PUT Request details:', {
      mealPlanId: params.id,
      hasBody: !!body,
      bodyKeys: Object.keys(body),
      daysLength: body.days?.length
    });
    
    const { days, title, tags, totalCalories, shoppingListGenerated } = body;

    // Use email as fallback for userId if id is not available
    const userId = session.user.id || session.user.email!;
    console.log('👤 PUT Using userId:', userId);

    // Check if meal plan exists and belongs to user
    const existingMealPlan = await MealPlanService.findById(params.id);

    console.log('📋 PUT Meal plan lookup result:', {
      found: !!existingMealPlan,
      mealPlanId: existingMealPlan?._id,
      mealPlanUserId: existingMealPlan?.userId
    });

    if (!existingMealPlan || existingMealPlan.userId !== userId) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (days) updateData.days = days;
    if (title !== undefined) updateData.title = title;
    if (tags) updateData.tags = tags;
    if (totalCalories !== undefined) updateData.totalCalories = totalCalories;
    if (shoppingListGenerated !== undefined) updateData.shoppingListGenerated = shoppingListGenerated;

    // Update meal plan
    const updatedMealPlan = await MealPlanService.updateById(params.id, updateData);

    console.log('✅ PUT Meal plan updated successfully:', {
      id: updatedMealPlan?._id,
      title: updatedMealPlan?.title,
      daysCount: updatedMealPlan?.days?.length
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedMealPlan,
        _id: updatedMealPlan?._id?.toString()
      },
      message: 'Meal plan updated successfully'
    });

  } catch (error) {
    console.error('❌ PUT /api/meal-plans/[id] error:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
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
    
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = await context.params;

    // Use email as fallback for userId if id is not available
    const userId = session.user.id || session.user.email!;

    // Check if meal plan exists and belongs to user
    const existingMealPlan = await MealPlanService.findById(params.id);

    if (!existingMealPlan || existingMealPlan.userId !== userId) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Delete meal plan
    const deleted = await MealPlanService.deleteById(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete meal plan' },
        { status: 500 }
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