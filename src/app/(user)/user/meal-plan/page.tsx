/**
 * Legacy Meal Plan Index
 * Server-redirects to /user/[username]/meal-plan using the session display name.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export default async function LegacyMealPlanIndex() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');
  const username = slugify(session.user.name || 'me');
  redirect(`/user/${encodeURIComponent(username)}/meal-plan`);
}