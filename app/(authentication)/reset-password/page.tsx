"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Fields";
import { CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setValidatingToken(false);
      setMessage({
        type: 'error',
        text: 'Invalid reset link. Please request a new password reset email.'
      });
    }
  }, [searchParams]);

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch('/api/password-reset/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToValidate }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setTokenValid(true);
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Invalid or expired reset link. Please request a new password reset.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Unable to validate reset link. Please try again.'
      });
    } finally {
      setValidatingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Please fill in both password fields.'
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match.'
      });
      return;
    }

    if (password.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long.'
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/password-reset', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Password reset successfully! You can now sign in with your new password.'
        });
        
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push('/signin');
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Unable to reset password. Please try again.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Unable to reset password. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <AuthLayout
        title="Reset Password"
        subtitle="Validating your reset link..."
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthLayout>
    );
  }

  if (!tokenValid) {
    return (
      <AuthLayout
        title="Reset Password"
        subtitle="Unable to reset password"
      >
        {message && (
          <div className="rounded-md bg-red-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-700">
                  {message.text}
                </h3>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link
            href="/forgot"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Request a new password reset email
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <TextField
            label="New Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>

        <div className="relative">
          <TextField
            label="Confirm New Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          style={{
            backgroundColor: "#dd6a6a",
            borderColor: "#dd6a6a",
          }}
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>

      {message && (
        <div className={`rounded-md p-4 mt-6 ${
          message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {message.text}
              </h3>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/signin"
          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
        >
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
