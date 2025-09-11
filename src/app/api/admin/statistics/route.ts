/**
 * Admin Statistics API Route - Mock Data Implementation
 * 
 * Provides mock statistics data for the admin dashboard.
 * In a real implementation, this would query the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/authMiddleware';

interface AdminStatistics {
  users: {
    total: number;
    new_this_month: number;
    active_users: number;
  };
  recipes: {
    total: number;
    published: number;
    pending_review: number;
  };
  commissions: {
    total_cookware_items: number;
    active_partnerships: number;
    monthly_revenue: number;
  };
  activity: {
    daily_logins: number;
    recipes_created_today: number;
    meal_plans_created: number;
  };
}

async function getStatistics(request: Request): Promise<NextResponse> {
  try {
    // Mock statistics data - In real app, this would come from database queries
    const statistics: AdminStatistics = {
      users: {
        total: 156,
        new_this_month: 23,
        active_users: 89,
      },
      recipes: {
        total: 342,
        published: 298,
        pending_review: 44,
      },
      commissions: {
        total_cookware_items: 87,
        active_partnerships: 12,
        monthly_revenue: 1247.50,
      },
      activity: {
        daily_logins: 34,
        recipes_created_today: 7,
        meal_plans_created: 15,
      },
    };

    return NextResponse.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics' 
      },
      { status: 500 }
    );
  }
}

// Protected route - Admin only
export const GET = withAuth(getStatistics, true);
