'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EmailChangedPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  if (success === 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Email Changed Successfully!</CardTitle>
            <CardDescription>
              Your email address has been updated successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Your email address has been changed and verified. You will need to sign in again with your new email address.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/api/auth/signin">
                  Sign In With New Email
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Email Change Failed</CardTitle>
          <CardDescription>
            Something went wrong with your email change.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            There was an error processing your email change. Please try again or contact support if the problem persists.
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