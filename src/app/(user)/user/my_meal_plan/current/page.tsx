/**
 * Current Meal Plan Page
 * 
 * Fetches or creates the current week's meal plan and redirects to it
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CurrentMealPlanPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrCreateCurrentMealPlan = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.id) {
        router.replace('/auth/login');
        return;
      }

      try {
        // Get current week start date
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        // Try to fetch existing meal plan for current week
        const response = await fetch(`/api/meal-plans?weekStartDate=${startOfWeek.toISOString()}&userId=${session.user.id}`);
        
        if (response.ok) {
          const payload = await response.json();
          const mealPlans = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload?.mealPlans) ? payload.mealPlans : []);
          if (mealPlans.length > 0 && mealPlans[0]?._id) {
            // Redirect to existing meal plan
            router.replace(`/user/my_meal_plan/${mealPlans[0]._id}`);
            return;
          }
        }

        // If no existing meal plan, create one
        const createResponse = await fetch('/api/meal-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            weekStartDate: startOfWeek.toISOString(),
            title: `Week of ${startOfWeek.toLocaleDateString()}`
          }),
        });

        if (createResponse.ok) {
          const payload = await createResponse.json();
          const newMealPlan = payload?.data || payload; // handle { success, data } or raw
          if (newMealPlan?._id) {
            router.replace(`/user/my_meal_plan/${newMealPlan._id}`);
          } else {
            throw new Error('Meal plan created but no ID returned');
          }
        } else {
          throw new Error('Failed to create meal plan');
        }
      } catch (error) {
        console.error('Error fetching/creating meal plan:', error);
        setError('Failed to load meal plan. Please try again.');
      }
    };

    fetchOrCreateCurrentMealPlan();
  }, [router, session, status]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Meal Plan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your meal plan...</p>
      </div>
    </div>
  );
}