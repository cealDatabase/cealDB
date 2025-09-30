import React from 'react'
import { cookies } from 'next/headers'
import BroadcastClient from './BroadcastClient'

/**
 * Server Component - Reads cookies server-side and passes user roles to client component
 * Reference: https://nextjs.org/docs/app/api-reference/functions/cookies
 * 
 * This page only checks if user has role ID 1 (super admin) - no individual userId needed
 */
async function getUserRolesFromCookies(): Promise<string[] | null> {
  // Use Next.js server-side cookies API
  const cookieStore = await cookies();
  const userEmailCookie = cookieStore.get('uinf')?.value;
  const roleCookie = cookieStore.get('role')?.value;

  console.log('🍪 Broadcast page - checking cookies:', {
    hasUserEmail: !!userEmailCookie,
    hasRole: !!roleCookie,
  });

  if (!userEmailCookie) {
    console.log('❌ No user cookie found - user not signed in');
    return null;
  }

  try {
    let userRoles: string[] = [];
    
    if (roleCookie) {
      // Handle both formats: JSON array or single value
      try {
        userRoles = JSON.parse(roleCookie);
        console.log('📊 Parsed role as JSON array:', userRoles);
      } catch {
        userRoles = [roleCookie];
        console.log('📊 Parsed role as single value:', userRoles);
      }
    } else {
      // Default role if no role cookie found
      userRoles = ['2'];
    }
    
    const isSuperAdmin = userRoles.includes('1');
    console.log('🔐 Super admin check:', { userRoles, isSuperAdmin });

    return userRoles;
  } catch (error) {
    console.error('Failed to parse user roles from cookies:', error);
    return null;
  }
}

export default async function BroadcastPage() {
  // Get user roles from server-side cookies
  const userRoles = await getUserRolesFromCookies();
  
  // Pass to client component - NO userId needed, only roles for verification
  return <BroadcastClient userRoles={userRoles} />;
}
