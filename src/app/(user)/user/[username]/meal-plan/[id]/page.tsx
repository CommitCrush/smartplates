'use client';

// Reuse the main MealPlanningPage implementation from the existing route
import MealPlanningPage from '@/app/(user)/user/meal-plan/[id]/page';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function MealPlanningPageWrapper() {
	const params = useParams();
	const username = (params?.username as string) || 'me';

	// Hide the ID in the URL bar without triggering a navigation
	useEffect(() => {
		try {
			const base = `/user/${encodeURIComponent(username)}/meal-plan`;
			if (typeof window !== 'undefined' && window.location.pathname !== base) {
				window.history.replaceState(null, '', base);
			}
			} catch {
			// no-op if history API unavailable
		}
	}, [username]);

	return <MealPlanningPage />;
}
