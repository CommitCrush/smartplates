/**
 * Username Meal Plan Index
 * Client-redirects to the current meal plan, which then renders the [id] page
 * and replaces the URL back to /user/[username]/meal-plan to hide the ID.
 */

'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function MealPlanIndexPage() {
  const router = useRouter();
  const params = useParams();
  const username = (params?.username as string) || 'me';

  useEffect(() => {
    if (!username) return;
    router.replace(`/user/${encodeURIComponent(username)}/meal-plan/current`);
  }, [router, username]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-600">Loading meal plan…</div>
    </div>
  );
}
