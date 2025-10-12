/**
 * Account Actions API Route
 * Handles data export and account deletion
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findUserByEmail, deleteUser } from '@/models/User';
import { getCollection, COLLECTIONS } from '@/lib/db';

// POST endpoint for data export
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action === 'export') {
      // Find user by email
      const user = await findUserByEmail(session.user.email);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Get user's recipes
      const recipesCollection = await getCollection(COLLECTIONS.RECIPES);
      const userRecipes = await recipesCollection.find({
        createdBy: user._id
      }).toArray();

      // Get user's meal plans
      const mealPlansCollection = await getCollection(COLLECTIONS.MEAL_PLANS);
      const userMealPlans = await mealPlansCollection.find({
        userId: user._id
      }).toArray();

      // Create export data
      const exportData = {
        user: {
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          dietaryRestrictions: user.dietaryRestrictions || [],
          favoriteCategories: user.favoriteCategories || [],
        },
        recipes: userRecipes,
        mealPlans: userMealPlans,
        exportDate: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: exportData,
        message: 'Data exported successfully'
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Account action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for account deletion
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { confirmDelete } = await request.json();

    if (!confirmDelete) {
      return NextResponse.json(
        { error: 'Deletion confirmation required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await findUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user's recipes
    const recipesCollection = await getCollection(COLLECTIONS.RECIPES);
    await recipesCollection.deleteMany({
      createdBy: user._id
    });

    // Delete user's meal plans
    const mealPlansCollection = await getCollection(COLLECTIONS.MEAL_PLANS);
    await mealPlansCollection.deleteMany({
      userId: user._id
    });

    // Delete user account
    const deleted = await deleteUser(user._id!);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}