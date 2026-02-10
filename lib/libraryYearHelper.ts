// lib/libraryYearHelper.ts
import { cookies } from 'next/headers';

/**
 * Check if the current user is a super admin by reading the role cookie.
 * Super admin = role '1'.
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('role')?.value;

    let userRoles: string[] = [];
    if (roleCookie) {
      try {
        userRoles = JSON.parse(roleCookie);
      } catch {
        userRoles = [roleCookie];
      }
    }

    return userRoles.includes('1');
  } catch (error) {
    console.error('[libraryYearHelper] Error reading cookies:', error);
    return false;
  }
}
