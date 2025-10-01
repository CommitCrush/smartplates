/**
 * Google Calendar Integration Service
 * 
 * Handles integration with Google Calendar API for meal planning events
 * Note: This is a client-side implementation for demonstration
 */

import type { IMealPlan } from '@/types/meal-planning';

interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId?: string;
}

// Default meal times
const MEAL_TIMES = {
  breakfast: { hour: 8, minute: 0, duration: 60 },
  lunch: { hour: 12, minute: 30, duration: 60 },
  dinner: { hour: 18, minute: 0, duration: 90 },
  snacks: { hour: 15, minute: 0, duration: 30 }
};

// Color IDs for different meal types in Google Calendar
const MEAL_COLORS = {
  breakfast: '6', // Orange
  lunch: '5',     // Yellow
  dinner: '1',    // Blue
  snacks: '2'     // Green
};

/**
 * Generate Google Calendar events from meal plan
 */
function generateCalendarEvents(mealPlan: IMealPlan): GoogleCalendarEvent[] {
  const events: GoogleCalendarEvent[] = [];
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  mealPlan.days.forEach(day => {
    const dayStr = day.date.toISOString().split('T')[0];

    // Process each meal type
    Object.entries(MEAL_TIMES).forEach(([mealType, timeInfo]) => {
      const meals = day[mealType as keyof typeof day] as any[];
      
      if (meals && meals.length > 0) {
        meals.forEach((meal, index) => {
          const startTime = new Date(`${dayStr}T${timeInfo.hour.toString().padStart(2, '0')}:${timeInfo.minute.toString().padStart(2, '0')}:00`);
          const endTime = new Date(startTime.getTime() + (timeInfo.duration * 60 * 1000));

          // Adjust time if multiple meals of same type
          if (index > 0) {
            startTime.setMinutes(startTime.getMinutes() + (index * 15));
            endTime.setMinutes(endTime.getMinutes() + (index * 15));
          }

          events.push({
            summary: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${meal.recipeName || 'Meal'}`,
            description: [
              meal.recipeName ? `Recipe: ${meal.recipeName}` : '',
              meal.servings ? `Servings: ${meal.servings}` : '',
              meal.cookingTime ? `Cooking time: ${meal.cookingTime} minutes` : '',
              meal.prepTime ? `Prep time: ${meal.prepTime} minutes` : '',
              meal.notes ? `Notes: ${meal.notes}` : '',
              '',
              'Created with SmartPlates Meal Planning'
            ].filter(Boolean).join('\n'),
            start: {
              dateTime: startTime.toISOString(),
              timeZone
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone
            },
            colorId: MEAL_COLORS[mealType as keyof typeof MEAL_COLORS]
          });
        });
      }
    });
  });

  return events;
}

/**
 * Create Google Calendar link for adding events
 */
export function generateGoogleCalendarLink(mealPlan: IMealPlan): string {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const events = generateCalendarEvents(mealPlan);
  
  if (events.length === 0) {
    return '';
  }

  // For multiple events, we'll create a link for the first event
  // and provide instructions for the rest
  const firstEvent = events[0];
  
  const params = new URLSearchParams({
    text: firstEvent.summary,
    dates: `${firstEvent.start.dateTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${firstEvent.end.dateTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    details: firstEvent.description || '',
    ctz: firstEvent.start.timeZone
  });

  return `${baseUrl}&${params.toString()}`;
}

/**
 * Export meal plan to Google Calendar (browser-based)
 */
export async function exportToGoogleCalendar(mealPlan: IMealPlan): Promise<{
  success: boolean;
  message?: string;
  links?: string[];
}> {
  try {
    const events = generateCalendarEvents(mealPlan);
    
    if (events.length === 0) {
      return {
        success: false,
        message: 'No meals found in the meal plan to export.'
      };
    }

    // Generate calendar links for each event
    const links: string[] = [];
    
    events.forEach(event => {
      const params = new URLSearchParams({
        text: event.summary,
        dates: `${event.start.dateTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${event.end.dateTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
        details: event.description || '',
        ctz: event.start.timeZone
      });
      
      links.push(`https://calendar.google.com/calendar/render?action=TEMPLATE&${params.toString()}`);
    });

    // Open the first few events in new tabs
    const maxTabs = Math.min(3, links.length);
    for (let i = 0; i < maxTabs; i++) {
      window.open(links[i], '_blank');
    }

    return {
      success: true,
      message: `${events.length} meal events prepared for Google Calendar. ${maxTabs} tabs opened. You may need to allow popups.`,
      links
    };

  } catch (error) {
    console.error('Google Calendar export failed:', error);
    return {
      success: false,
      message: 'Failed to export to Google Calendar. Please try again.'
    };
  }
}

/**
 * Generate .ics file for calendar import
 */
export function generateICSFile(mealPlan: IMealPlan): Blob {
  const events = generateCalendarEvents(mealPlan);
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmartPlates//Meal Planning//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach((event, index) => {
    const uid = `meal-${Date.now()}-${index}@smartplates.app`;
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}Z`,
      `DTSTART:${event.start.dateTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}Z`,
      `DTEND:${event.end.dateTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}Z`,
      `SUMMARY:${event.summary}`,
      `DESCRIPTION:${event.description?.replace(/\n/g, '\\n') || ''}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  return new Blob([icsContent.join('\r\n')], { 
    type: 'text/calendar;charset=utf-8' 
  });
}

/**
 * Download meal plan as .ics file
 */
export function downloadICSFile(mealPlan: IMealPlan): void {
  const blob = generateICSFile(mealPlan);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `meal-plan-${mealPlan.weekStartDate.toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}