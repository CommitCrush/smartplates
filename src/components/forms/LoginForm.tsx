'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  className?: string;
  redirectTo?: string;
}

export function LoginForm({ className, redirectTo = '/user/welcome' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use NextAuth signIn instead of custom API
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Don't redirect automatically
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        // Login successful - NextAuth will handle the session
        // Wait for session to update, then redirect based on role
        
        // Small delay to ensure session is updated
        setTimeout(async () => {
          // Get the updated session to determine redirect
          const updatedSession = await getSession();
          const userRole = updatedSession?.user?.role;
          
          let redirectPath: string;
          switch (userRole) {
            case 'admin':
              redirectPath = '/admin';
              break;
            case 'user':
              redirectPath = '/user/welcome';
              break;
            default:
              redirectPath = redirectTo;
          }
          
          console.log(`🔄 Redirecting ${userRole} to: ${redirectPath}`);
          router.push(redirectPath);
        }, 100);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto bg-background-card p-8 rounded-lg shadow-lg', className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
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
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                console.log('Password input changed:', e.target.value); // Debug
                setPassword(e.target.value);
              }}
              onFocus={() => console.log('Password field focused')} // Debug
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
                console.log('Toggle password visibility'); // Debug
                setShowPassword(!showPassword);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground-muted hover:text-foreground focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-coral-500 text-white py-2 px-4 rounded-lg hover:bg-coral-600 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}