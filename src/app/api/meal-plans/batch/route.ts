/**
 * Batch Operations API for Meal Plans
 * 
 * Optimized endpoint for bulk meal plan operations
 * Reduces individual API calls and improves performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';
import type { IMealPlan } from '@/types/meal-planning';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operation, planIds, data } = await request.json();

    if (!operation || !Array.isArray(planIds) || planIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid operation or plan IDs' },
        { status: 400 }
      );
    }

    const collection = await getCollection(COLLECTIONS.MEAL_PLANS);

    // Convert string IDs to ObjectIds
    const objectIds = planIds.map((id: string) => toObjectId(id));

    // Verify all plans belong to the user
    const userPlans = await collection.find({
      _id: { $in: objectIds },
      userId: session.user.email
    }).toArray();

    if (userPlans.length !== planIds.length) {
      return NextResponse.json(
        { error: 'Some plans not found or unauthorized' },
        { status: 403 }
      );
    }

    let result;

    switch (operation) {
      case 'delete':
        result = await collection.deleteMany({
          _id: { $in: objectIds },
          userId: session.user.email
        });
        
        return NextResponse.json({
          success: true,
          deletedCount: result.deletedCount,
          message: `Successfully deleted ${result.deletedCount} meal plan(s)`
        });

      case 'copy':
        const { startDate, weeksToAdvance = 1 } = data || {};
        
        if (!startDate) {
          return NextResponse.json(
            { error: 'Start date required for copy operation' },
            { status: 400 }
          );
        }

        const copiedPlans = [];
        
        for (let i = 0; i < userPlans.length; i++) {
          const plan = userPlans[i];
          const targetDate = new Date(startDate);
          targetDate.setDate(targetDate.getDate() + (i * weeksToAdvance * 7));

          const newPlan = {
            ...plan,
            name: `${plan.name} (Copy)`,
            startDate: targetDate.toISOString(),
            createdAt: new Date(),
            updatedAt: new Date(),
            isTemplate: false // Copies are never templates
          };

          // Remove _id so MongoDB generates new one
          const { _id, ...planWithoutId } = newPlan;
          copiedPlans.push(planWithoutId);
        }

        const insertResult = await collection.insertMany(copiedPlans);
        
        return NextResponse.json({
          success: true,
          copiedCount: insertResult.insertedCount,
          message: `Successfully copied ${insertResult.insertedCount} meal plan(s)`
        });

      case 'makeTemplates':
        const updateResult = await collection.updateMany(
          {
            _id: { $in: objectIds },
            userId: session.user.email,
            isTemplate: { $ne: true } // Only convert non-templates
          },
          {
            $set: {
              isTemplate: true,
              updatedAt: new Date()
            }
          }
        );

        return NextResponse.json({
          success: true,
          updatedCount: updateResult.modifiedCount,
          message: `Successfully converted ${updateResult.modifiedCount} plan(s) to template(s)`
        });

      case 'export':
        // Return the plans data for client-side export
        const exportPlans = userPlans.map((plan: any) => ({
          title: plan.title || plan.name,
          weekStartDate: plan.weekStartDate || plan.startDate,
          days: plan.days || plan.weekData,
          isTemplate: plan.isTemplate,
          createdAt: plan.createdAt
        }));

        return NextResponse.json({
          success: true,
          plans: exportPlans,
          message: `Successfully exported ${exportPlans.length} meal plan(s)`
        });

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Batch operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform batch operation' },
      { status: 500 }
    );
  }
}