/**
 * Google Calendar Integration API
 * 
 * Creates calendar events for meal plans
 * POST /api/google-calendar/create-meal-events
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { IMealPlan } from '@/types/meal-planning';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mealPlan, title }: { mealPlan: IMealPlan; title?: string } = body;

    if (!mealPlan || !mealPlan.days) {
      return NextResponse.json(
        { error: 'Valid meal plan required' },
        { status: 400 }
      );
    }

    // Create calendar events data structure
    const events = [];

    // Create calendar events for each meal
    for (const [dayIndex, day] of mealPlan.days.entries()) {
      const dayDate = new Date(day.date);
      
      // Breakfast event
      if (day.breakfast.length > 0) {
        const breakfastEvent = {
          summary: `Breakfast: ${day.breakfast.map(meal => meal.recipeName).join(', ')}`,
          description: `Meal plan: ${title || mealPlan.title}\n\nRecipes:\n${day.breakfast.map(meal => 
            `- ${meal.recipeName}${meal.notes ? ` (${meal.notes})` : ''}`
          ).join('\n')}`,
          start: {
            dateTime: new Date(dayDate.setHours(8, 0, 0)).toISOString(),
            timeZone: 'Europe/Berlin',
          },
          end: {
            dateTime: new Date(dayDate.setHours(9, 0, 0)).toISOString(),
            timeZone: 'Europe/Berlin',
          },
          colorId: '4', // Light blue
        };
        events.push(breakfastEvent);
      }

      // Lunch event
      if (day.lunch.length > 0) {
        const lunchEvent = {
          summary: `Lunch: ${day.lunch.map(meal => meal.recipeName).join(', ')}`,
          description: `Meal plan: ${title || mealPlan.title}\n\nRecipes:\n${day.lunch.map(meal => 
            `- ${meal.recipeName}${meal.notes ? ` (${meal.notes})` : ''}`
          ).join('\n')}`,
          start: {
            dateTime: new Date(dayDate.setHours(12, 0, 0)).toISOString(),
            timeZone: 'Europe/Berlin',
          },
          end: {
            dateTime: new Date(dayDate.setHours(13, 0, 0)).toISOString(),
            timeZone: 'Europe/Berlin',
          },
          colorId: '2', // Green
        };
        events.push(lunchEvent);
      }

      // Dinner event
      if (day.dinner.length > 0) {
        const dinnerEvent = {
          summary: `Dinner: ${day.dinner.map(meal => meal.recipeName).join(', ')}`,
          description: `Meal plan: ${title || mealPlan.title}\n\nRecipes:\n${day.dinner.map(meal => 
            `- ${meal.recipeName}${meal.notes ? ` (${meal.notes})` : ''}`
          ).join('\n')}`,
          start: {
            dateTime: new Date(dayDate.setHours(18, 0, 0)).toISOString(),
            timeZone: 'Europe/Berlin',
          },
          end: {
            dateTime: new Date(dayDate.setHours(19, 0, 0)).toISOString(),
            timeZone: 'Europe/Berlin',
          },
          colorId: '1', // Red
        };
        events.push(dinnerEvent);
      }

      // Snacks event (if any)
      if (day.snacks.length > 0) {
        const snacksEvent = {
          summary: `Snacks: ${day.snacks.map(meal => meal.recipeName).join(', ')}`,
          description: `Meal plan: ${title || mealPlan.title}\n\nSnacks:\n${day.snacks.map(meal => 
            `- ${meal.recipeName}${meal.notes ? ` (${meal.notes})` : ''}`
          ).join('\n')}`,
          start: {
            dateTime: new Date(dayDate.setHours(15, 0, 0)).toISOString(),
            timeZone: 'Europe/Berlin',
          },
          end: {
            dateTime: new Date(dayDate.setHours(15, 30, 0)).toISOString(),
            timeZone: 'Europe/Berlin',
          },
          colorId: '5', // Orange
        };
        events.push(snacksEvent);
      }
    }

    // Generate Google Calendar URLs for manual adding
    const calendarUrls = events.map(event => {
      const startDate = new Date(event.start.dateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDate = new Date(event.end.dateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.summary,
        dates: `${startDate}/${endDate}`,
        details: event.description,
        ctz: 'Europe/Berlin'
      });
      
      return {
        summary: event.summary,
        url: `https://calendar.google.com/calendar/render?${params.toString()}`
      };
    });

    console.log(`Created ${events.length} Google Calendar event URLs for meal plan`);

    return NextResponse.json({
      success: true,
      message: `${events.length} calendar events prepared`,
      events: calendarUrls,
      note: 'Google Calendar URLs generated. Users can click to add events manually.'
    });

  } catch (error) {
    console.error('Google Calendar error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create calendar events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}