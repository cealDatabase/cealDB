import React from 'react';
import { cookies } from 'next/headers';
import SurveyDatesClient from '@/app/(authentication)/admin/survey-dates/SurveyDatesClient';

/**
 * Server Component - Reads cookies server-side and passes user roles to client component
 */
async function getUserRolesFromCookies(): Promise<string[] | null> {
  const cookieStore = await cookies();
  const userEmailCookie = cookieStore.get('uinf')?.value;
  const roleCookie = cookieStore.get('role')?.value;

  if (!userEmailCookie) {
    return null;
  }

  try {
    let userRoles: string[] = [];
    
    if (roleCookie) {
      try {
        userRoles = JSON.parse(roleCookie);
      } catch {
        userRoles = [roleCookie];
      }
    } else {
      userRoles = ['2'];
    }
    
    return userRoles;
  } catch (error) {
    console.error('Failed to parse user roles from cookies:', error);
    return null;
  }
}

export default async function SurveyDatesPage() {
  const userRoles = await getUserRolesFromCookies();
  
  return <SurveyDatesClient userRoles={userRoles} />;
}
