/**
 * Meal Plans Overview Page
 * 
 * Lists all user's meal plans with options to view, edit, and create new ones
 */

'use client';

import { redirect } from 'next/navigation';

export default function MealPlansPage() {
  // Redirect to saved meal plans page for now
  // Later this could be a dedicated meal plans overview
  redirect('/user/my_saved_meal_plan');
}