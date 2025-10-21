"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  className?: string;
  redirectTo?: string;
}

export function LoginForm({
  className,
  redirectTo = "/user/welcome",
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [error, setError] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; name: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowEmailVerification(false);
    setResendSuccess(false);

    try {
      // Use NextAuth signIn with credentials
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Don't redirect automatically
      });

      if (result?.error) {
        // Handle specific error cases
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          setError('Please verify your email address before logging in.');
          setShowEmailVerification(true);
          // Get user info for email verification
          const userResponse = await fetch('/api/auth/user-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const userData = await userResponse.json();
          if (userData.success) {
            setUserInfo({ email: userData.user.email, name: userData.user.name });
          }
        } else {
          setError('Invalid email or password. Please try again.');
          setShowEmailVerification(false);
        }
      } else if (result?.ok) {
        // Login successful - NextAuth will handle the session
        // Redirect based on the redirect parameter or default
        console.log('🔄 Login successful, redirecting to:', redirectTo);
        router.push(redirectTo);
        router.refresh(); // Refresh to update session state
      } else {
        setError('Login failed. Please try again.');
        setShowEmailVerification(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Something went wrong. Please try again.');
      setShowEmailVerification(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userInfo?.email) return;
    
    setIsResendingEmail(true);
    setResendSuccess(false);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userInfo.email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendSuccess(true);
        setError('');
      } else {
        setError(data.error || 'Failed to resend verification email. Please try again.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto bg-background-card p-8 rounded-lg shadow-lg border border-border hover:shadow-xl transition-all duration-200",
        className
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-background text-foreground"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                console.log("Password input changed:", e.target.value); // Debug
                setPassword(e.target.value);
              }}
              onFocus={() => console.log("Password field focused")} // Debug
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-background text-foreground"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Toggle password visibility"); // Debug
                setShowPassword(!showPassword);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground-muted hover:text-foreground focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {showEmailVerification && userInfo && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <div className="text-amber-800 text-sm text-center">
              <Mail className="h-5 w-5 inline-block mr-2" />
              Email verification required
            </div>
            <div className="text-amber-700 text-xs text-center">
              Hi <strong>{userInfo.name}</strong>, please check your inbox for the verification email.
            </div>
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResendingEmail}
                className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isResendingEmail ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          </div>
        )}

        {resendSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-800 text-sm text-center">
              ✅ Verification email sent successfully! Please check your inbox.
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-coral-500 text-white py-2 px-4 rounded-lg hover:bg-coral-600 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push('/forgot-password')}
            className="text-sm text-coral-500 hover:text-coral-600 focus:outline-none focus:underline transition-colors"
          >
            Reset Your Password
          </button>
        </div>
      </form>
    </div>
  );
}
