'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, XCircle, Clock, Mail } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorInfo = (errorType: string | null) => {
    switch (errorType) {
      case 'missing_token':
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          title: 'Missing Verification Token',
          description: 'The verification link is invalid or incomplete.',
          details: 'Please check your email and click the complete verification link.'
        };
      case 'invalid_or_expired_token':
        return {
          icon: <Clock className="h-6 w-6 text-orange-600" />,
          title: 'Token Expired or Invalid',
          description: 'The verification link has expired or is invalid.',
          details: 'Verification links expire after 24 hours. Please request a new email change from your settings.'
        };
      case 'email_already_taken':
        return {
          icon: <Mail className="h-6 w-6 text-red-600" />,
          title: 'Email Already in Use',
          description: 'The email address you tried to change to is already in use.',
          details: 'Please choose a different email address or contact support if you believe this is an error.'
        };
      case 'verification_failed':
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-600" />,
          title: 'Verification Failed',
          description: 'There was an error processing your email verification.',
          details: 'Please try again or contact support if the problem persists.'
        };
      default:
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-600" />,
          title: 'Authentication Error',
          description: 'An unknown error occurred.',
          details: 'Please try again or contact support if the problem persists.'
        };
    }
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            {errorInfo.icon}
          </div>
          <CardTitle className="text-red-600">{errorInfo.title}</CardTitle>
          <CardDescription>
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {errorInfo.details}
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/user/settings">
                Back to Settings
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}