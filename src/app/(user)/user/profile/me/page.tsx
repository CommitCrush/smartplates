'use client';

import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyProfileRedirect() {
  const { user, isAuthenticated, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      router.replace(`/user/profile/${user.id}`);
    }
  }, [user, isAuthenticated, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to your profile...</p>
      </div>
    </div>
  );
}