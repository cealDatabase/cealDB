"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { XCircleIcon, CheckCircleIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Fields";
import signinAction from "./signinAction";

type SigninStep = 'EMAIL' | 'PASSWORD' | 'RESET_GUIDANCE';

interface UserInfo {
  email: string;
  name: string;
}

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = React.useState<any>(undefined);
  const [step, setStep] = React.useState<SigninStep>('EMAIL');
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>(null);
  const [checkingUser, setCheckingUser] = React.useState(false);
  const [emailCheckError, setEmailCheckError] = React.useState<any>(null);
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (!email) {
      setEmailCheckError({ message: 'Please enter your email address.' });
      return;
    }

    setCheckingUser(true);
    setEmailCheckError(null);

    try {
      const response = await fetch('/api/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!result.success) {
        setEmailCheckError(result);
        return;
      }

      setUserInfo(result.user);

      if (result.userStatus === 'NEEDS_PASSWORD_SETUP') {
        // Both password setup and reset scenarios lead to the same guidance
        setStep('RESET_GUIDANCE');
        setEmailCheckError(result); // This contains the guidance message
      } else if (result.userStatus === 'READY_FOR_PASSWORD') {
        setStep('PASSWORD');
      }
    } catch (error) {
      setEmailCheckError({
        message: 'Unable to verify your account.',
        hint: 'Please check your connection and try again.'
      });
    } finally {
      setCheckingUser(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('EMAIL');
    setUserInfo(null);
    setEmailCheckError(null);
    setError(undefined);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSigningIn(true);
    setError(undefined);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await signinAction(undefined, formData);
      
      if (result.success) {
        console.log("✅ Login successful, preparing redirect...");
        
        // Give cookies time to be set before redirect (longer delay for production)
        setTimeout(() => {
          console.log("🔄 Redirecting to admin...");
          router.push("/admin");
        }, 500); // Longer delay to ensure cookies are properly set in production
        
      } else {
        // Handle authentication errors
        setError(result);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError({
        success: false,
        errorType: 'NETWORK_ERROR',
        message: 'Unable to connect to authentication service.',
        hint: 'Please check your internet connection and try again.'
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'EMAIL':
        return 'Sign in to CEAL Database';
      case 'PASSWORD':
        return `Welcome back, ${userInfo?.name}`;
      case 'RESET_GUIDANCE':
        return 'Password Setup Required';
      default:
        return 'Sign in with Your Email';
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 'EMAIL':
        return (
          <>
            <div className="text-sm">
              Enter your email address to continue. Need help?{" "}
              <Link href="/forgot">Request password reset.</Link>
            </div>
          </>
        );
      case 'PASSWORD':
        return (
          <>
            <div className="text-sm">
              Enter your password to access your CEAL Database account.
            </div>
          </>
        );
      case 'RESET_GUIDANCE':
        return (
          <>
            <div className="text-sm">
              Your account needs a password to be set up. Check your email for instructions.
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title={getTitle()}
      subtitle={getSubtitle()}
    >
      {/* Step 1: Email Input */}
      {step === 'EMAIL' && (
        <form onSubmit={handleEmailSubmit}>
          <div className="space-y-6">
            <TextField
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email address"
            />
          </div>
          <Button
            variant="outline"
            style={{
              color: "#dd6a6a",
              borderColor: "#dd6a6a",
            }}
            type="submit"
            className="mt-8 w-full"
            disabled={checkingUser}
          >
            {checkingUser ? 'Checking Account...' : 'Continue'}
          </Button>
        </form>
      )}

      {/* Step 2: Password Input */}
      {step === 'PASSWORD' && userInfo && (
        <div>
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-green-800">
                Account found: <strong>{userInfo.email}</strong>
              </p>
            </div>
          </div>
          
          <form onSubmit={handlePasswordSubmit}>
            <input type="hidden" name="email" value={userInfo.email} />
            <div className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              style={{
                color: "#dd6a6a",
                borderColor: "#dd6a6a",
              }}
              type="submit"
              className="mt-8 w-full"
              disabled={isSigningIn}
            >
              {isSigningIn ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleBackToEmail}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Use a different email
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Password Reset Guidance */}
      {step === 'RESET_GUIDANCE' && userInfo && (
        <div className="space-y-6">
          {/* Email Display */}
          <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-blue-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                {userInfo.email}
              </p>
              <p className="text-xs text-blue-600">Password setup link sent</p>
            </div>
          </div>

          {/* Simple Instructions */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Next steps:</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-medium text-blue-600">1.</span>
                Check your email inbox
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-blue-600">2.</span>
                Click "Set New Password" in the email
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-blue-600">3.</span>
                Create a secure password (minimum 8 characters)
              </li>
            </ol>
          </div>

          {/* Troubleshooting */}
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-900">Don't see the email?</summary>
            <div className="mt-2 space-y-1 text-gray-500 pl-4">
              <p>• Check your spam/junk folder</p>
              <p>• Wait a few minutes for delivery</p>
              <p>• Contact your CEAL administrator if needed</p>
            </div>
          </details>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full bg-transparent">
              Resend Email
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-transparent border-gray-300 text-gray-600 hover:text-gray-800" 
              onClick={handleBackToEmail}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Use a different email
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500">The password setup link will expire in 24 hours</p>
        </div>
      )}

      {/* Email Check Error Display */}
      {emailCheckError && (
        <div className="rounded-md bg-red-50 p-4 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-700">
                {emailCheckError.message || 'Account Check Failed'}
              </h3>
              {emailCheckError.hint && (
                <p className="mt-2 text-sm text-red-600">
                  💡 <strong>Hint:</strong> {emailCheckError.hint}
                </p>
              )}
              {emailCheckError.suggestions && emailCheckError.suggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-700">What you can do:</p>
                  <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                    {emailCheckError.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Step Error Display */}
      {error && step === 'PASSWORD' && (
        <div className="rounded-md bg-red-50 p-4 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-700">
                {typeof error === 'string' ? `Error! ${error}` : error.message || 'Authentication Error'}
              </h3>
              {error.hint && (
                <p className="mt-2 text-sm text-red-600">
                  💡 <strong>Hint:</strong> {error.hint}
                </p>
              )}
              {error.suggestions && error.suggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-700">What you can do:</p>
                  <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                    {error.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(typeof error === 'string' && error.includes("Incorrect password")) && (
                <p className="mt-2 text-sm text-red-600">
                  💡 <strong>Tip:</strong> If you forgot your password, click{" "}
                  <Link href="/forgot" className="underline text-red-700 hover:text-red-800">
                    "forgot password"
                  </Link>{" "}
                  above to reset it.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
