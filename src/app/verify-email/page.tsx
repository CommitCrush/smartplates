/**
 * Email Verification Page
 * Handles email verification via URL parameters with automatic login
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('/login');
  const [countdown, setCountdown] = useState(3);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          
          // Check if user was automatically logged in
          if (data.redirectTo === '/dashboard') {
            setRedirectUrl('/dashboard');
          } else {
            setRedirectUrl('/login?verified=true');
          }
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token, router]);

  // Countdown and redirect logic
  useEffect(() => {
    if (status !== 'loading' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // For dashboard redirect, use window.location to force page reload and session refresh
      if (redirectUrl === '/dashboard') {
        window.location.href = '/dashboard';
      } else {
        router.push(redirectUrl);
      }
    }
  }, [countdown, status, router, redirectUrl]);

  const handleRedirect = () => {
    // For dashboard redirect, use window.location to force page reload and session refresh
    if (redirectUrl === '/dashboard') {
      window.location.href = '/dashboard';
    } else {
      router.push(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full">
            {status === 'loading' && (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Email Verification
          </h2>
          
          <div className="mt-4">
            {status === 'loading' && (
              <p className="text-gray-600">
                Verifying your email address...
              </p>
            )}
            
            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">{message}</p>
                
                {redirectUrl === '/dashboard' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-medium">
                      ✅ You are now logged in!
                    </p>
                    <p className="text-gray-600">
                      Redirecting to your dashboard in {countdown} seconds...
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Redirecting to login in {countdown} seconds...
                  </p>
                )}
                
                <button
                  onClick={handleRedirect}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {redirectUrl === '/dashboard' ? 'Go to Dashboard' : 'Go to Login'}
                </button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <p className="text-red-600 font-medium">{message}</p>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/register')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Back to Registration
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {status !== 'loading' && (
          <div className="mt-8 bg-gray-100 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium">Need help?</p>
                <p>
                  If you're having trouble with email verification, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}