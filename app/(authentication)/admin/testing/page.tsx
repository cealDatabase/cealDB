import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TestingDashboard from './TestingDashboard';

/**
 * Super Admin Testing Dashboard
 * Allows manual testing of cron jobs, broadcasts, and form management
 * WITHOUT waiting for scheduled times
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
      userRoles = [];
    }
    
    return userRoles;
  } catch (error) {
    console.error('Error parsing roles:', error);
    return null;
  }
}

export default async function TestingPage() {
  const userRoles = await getUserRolesFromCookies();

  // Redirect if not signed in
  if (!userRoles) {
    redirect('/signin');
  }

  // Check if user is super admin (role ID 1)
  const isSuperAdmin = userRoles.includes('1');

  if (!isSuperAdmin) {
    redirect('/admin');
  }

  return <TestingDashboard userRoles={userRoles} />;
}
