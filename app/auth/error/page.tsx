'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorDetails = (errorCode: string | null) => {
    switch (errorCode) {
      case 'OAuthAccountNotLinked':
        return {
          title: 'Account Already Exists',
          description: 'This email is already associated with a different account. Please use the original sign-in method you used to create your account.',
          solution: 'Try signing in with the method you originally used to create your account.',
        };
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'Your sign-in attempt was denied. This could be due to account restrictions or security settings.',
          solution: 'Please contact support if you believe this is an error.',
        };
      case 'Verification':
        return {
          title: 'Email Verification Required',
          description: 'Please verify your email address before signing in.',
          solution: 'Check your email for a verification link and click it to verify your account.',
        };
      case 'Configuration':
        return {
          title: 'Server Configuration Error',
          description: 'There is a problem with the server configuration.',
          solution: 'Please contact support for assistance.',
        };
      case 'OAuthSignin':
        return {
          title: 'OAuth Sign-in Error',
          description: 'An error occurred during the OAuth sign-in process.',
          solution: 'Please try again or contact support if the problem persists.',
        };
      case 'OAuthCallback':
        return {
          title: 'OAuth Callback Error',
          description: 'An error occurred during the OAuth callback process.',
          solution: 'Please try again or contact support if the problem persists.',
        };
      case 'OAuthCreateAccount':
        return {
          title: 'Account Creation Error',
          description: 'Could not create your account using OAuth.',
          solution: 'Please try again or use email/password sign-up instead.',
        };
      case 'EmailCreateAccount':
        return {
          title: 'Account Creation Error',
          description: 'Could not create your account using email.',
          solution: 'Please try again or contact support for assistance.',
        };
      case 'Callback':
        return {
          title: 'Callback Error',
          description: 'An error occurred during the authentication callback.',
          solution: 'Please try again or contact support if the problem persists.',
        };
      case 'EmailSignin':
        return {
          title: 'Email Sign-in Error',
          description: 'Check your email for a sign-in link.',
          solution: 'Click the link in your email to sign in.',
        };
      case 'CredentialsSignin':
        return {
          title: 'Invalid Credentials',
          description: 'The email or password you entered is incorrect.',
          solution: 'Please check your credentials and try again.',
        };
      case 'SessionRequired':
        return {
          title: 'Authentication Required',
          description: 'You need to be signed in to access this page.',
          solution: 'Please sign in to continue.',
        };
      default:
        return {
          title: 'Authentication Error',
          description: 'An unexpected error occurred during authentication.',
          solution: 'Please try again or contact support for assistance.',
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Advocate App</h1>
          <p className="mt-2 text-sm text-gray-600">
            Authentication Error
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-red-600">
              {errorDetails.title}
            </CardTitle>
            <CardDescription className="text-center">
              {errorDetails.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorDetails.solution}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Link href="/auth/signin">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
              
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full">
                  Create New Account
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Button>
              </Link>
            </div>

            <div className="text-center text-sm text-gray-500">
              Need help?{' '}
              <Link href="/support" className="text-blue-600 hover:text-blue-500">
                Contact Support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 