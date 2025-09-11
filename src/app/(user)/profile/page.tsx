/**
 * Profile page redirect
 * Redirects to user-specific profile page
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }
  
  // Redirect to user-specific profile
  redirect(`/user/profile/${encodeURIComponent(session.user.email)}`);
}