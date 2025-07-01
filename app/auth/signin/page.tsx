'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle error messages from URL params (e.g., OAuth errors)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    
    if (errorParam) {
      switch (errorParam) {
        case 'OAuthAccountNotLinked':
          setError('This email is already associated with a different account. Please use the original sign-in method you used to create your account. If you created your account with email/password, use that method instead of Google sign-in.');
          break;
        case 'AccessDenied':
          setError('Access denied. Please try again or contact support.');
          break;
        case 'Verification':
          setError('Please verify your email address before signing in.');
          break;
        case 'Configuration':
          setError('There is a problem with the server configuration. Please contact support.');
          break;
        case 'OAuthSignin':
          setError('Error occurred during OAuth sign-in. Please try again.');
          break;
        case 'OAuthCallback':
          setError('Error occurred during OAuth callback. Please try again.');
          break;
        case 'OAuthCreateAccount':
          setError('Could not create OAuth provider user. Please try again.');
          break;
        case 'EmailCreateAccount':
          setError('Could not create email provider user. Please try again.');
          break;
        case 'Callback':
          setError('Error occurred during callback. Please try again.');
          break;
        case 'OAuthAccountNotLinked':
          setError('To confirm your identity, sign in with the same account you used originally.');
          break;
        case 'EmailSignin':
          setError('Check your email for a sign-in link.');
          break;
        case 'CredentialsSignin':
          setError('Invalid email or password.');
          break;
        case 'SessionRequired':
          setError('Please sign in to access this page.');
          break;
        default:
          setError('An error occurred during sign-in. Please try again.');
      }
    }

    if (successParam) {
      switch (successParam) {
        case 'account_created':
          setSuccess('Account created successfully! You can now sign in with your email and password.');
          break;
        case 'password_reset':
          setSuccess('Password reset successfully! You can now sign in with your new password.');
          break;
        case 'email_verified':
          setSuccess('Email verified successfully! You can now sign in.');
          break;
        default:
          setSuccess('Operation completed successfully!');
      }
    }
  }, [searchParams]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signin form submitted');
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!email.trim() || !password.trim()) {
      console.log('Validation failed: missing email or password');
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: invalid email format');
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    console.log('Attempting signin with:', email);

    // Test if the issue is with NextAuth or form submission
    try {
      // First, let's test if we can reach the NextAuth API
      const testResponse = await fetch('/api/auth/signin', {
        method: 'GET',
      });
      console.log('NextAuth API test response:', testResponse.status);

      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      console.log('Signin result:', result);

      if (result?.error) {
        console.log('Signin error:', result.error);
        setError(`Sign-in failed: ${result.error}`);
      } else if (result?.ok) {
        console.log('Signin successful, redirecting to dashboard');
        setSuccess('Signing you in...');
        router.push('/dashboard');
      } else {
        console.log('Signin result is neither error nor ok:', result);
        setError('Sign-in failed. Please try again.');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    setSuccess('');

    try {
      await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Advocate App</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Sign In */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Email/Password Sign In */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-500 p-0 h-auto"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>

              {/* Test button to check if form submission works */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  console.log('Test button clicked');
                  console.log('Email:', email);
                  console.log('Password:', password ? '***' : 'empty');
                  setError('Test button clicked - form is working');
                }}
                disabled={isLoading || isGoogleLoading}
              >
                Test Form (Debug)
              </Button>

              {/* Test database connection */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/test');
                    const data = await response.json();
                    console.log('Database test result:', data);
                    setError(`Database test: ${data.message}`);
                  } catch (error) {
                    console.error('Database test failed:', error);
                    setError('Database test failed');
                  }
                }}
                disabled={isLoading || isGoogleLoading}
              >
                Test Database Connection
              </Button>

              {/* Test users in database */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/test-users');
                    const data = await response.json();
                    console.log('Users in database:', data);
                    setError(`Users in DB: ${data.count} users found`);
                  } catch (error) {
                    console.error('Users test failed:', error);
                    setError('Users test failed');
                  }
                }}
                disabled={isLoading || isGoogleLoading}
              >
                Check Users in Database
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don&apos;t have an account? </span>
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p className="mb-2">
                Having trouble signing in? If you created your account with email/password, 
                use that method instead of Google sign-in.
              </p>
              <p className="mb-2">
                New user? Make sure to use the same email and password you used during registration.
              </p>
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 