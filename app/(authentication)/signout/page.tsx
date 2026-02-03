'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signoutAction } from './signoutAction';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const signOut = async () => {
      try {
        console.log('[SignOut] Executing signout action...');
        
        // Call server action to clear cookies and log the event
        await signoutAction();

        console.log('[SignOut] Signout complete, redirecting to signin...');

        // Redirect to signin page
        router.push('/signin');
      } catch (error) {
        console.error('[SignOut] Error during signout:', error);
        // Still redirect to signin even if action fails
        router.push('/signin');
      }
    };

    signOut();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Signing out...</h1>
        <p className="text-gray-600">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}
