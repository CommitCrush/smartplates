/**
 * Current Meal Plan Page
 * 
 * Redirects to or creates the current week's meal plan
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CurrentMealPlanPage() {
  const router = useRouter();

  useEffect(() => {
    // Get current week ID (simple implementation)
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Monday
    const weekId = startOfWeek.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Redirect to current week's meal plan
    router.replace(`/user/my_meal_plan/${weekId}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}