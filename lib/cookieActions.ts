'use server';

import { cookies } from 'next/headers';

/**
 * Server Actions for cookie operations
 * These should be called from Client Components instead of using document.cookie
 */

export interface CookieData {
  library?: string;
  observe_library?: string;
  role?: string;
}

/**
 * Get all relevant cookies for client components
 */
export async function getCookies(): Promise<CookieData> {
  const cookieStore = await cookies();
  
  return {
    library: cookieStore.get('library')?.value,
    observe_library: cookieStore.get('observe_library')?.value,
    role: cookieStore.get('role')?.value,
  };
}

/**
 * Get a specific cookie value
 */
export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

/**
 * Get effective library ID (observe_library if exists, otherwise library)
 */
export async function getEffectiveLibraryId(): Promise<number | null> {
  const cookieStore = await cookies();
  
  const observeLibrary = cookieStore.get('observe_library')?.value;
  const homeLibrary = cookieStore.get('library')?.value;
  
  const effectiveLibraryStr = observeLibrary || homeLibrary;
  
  if (effectiveLibraryStr) {
    const libId = parseInt(effectiveLibraryStr);
    return isNaN(libId) ? null : libId;
  }
  
  return null;
}

/**
 * Get home library ID
 */
export async function getHomeLibraryId(): Promise<number | null> {
  const cookieStore = await cookies();
  const homeLibrary = cookieStore.get('library')?.value;
  
  if (homeLibrary) {
    const libId = parseInt(homeLibrary);
    return isNaN(libId) ? null : libId;
  }
  
  return null;
}

/**
 * Check if user is viewing another library
 */
export async function isViewingOtherLibrary(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has('observe_library');
}

/**
 * Get user roles
 */
export async function getUserRoles(): Promise<string[]> {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('role')?.value;
  
  if (!roleCookie) {
    return [];
  }
  
  try {
    const parsed = JSON.parse(decodeURIComponent(roleCookie));
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [roleCookie];
  }
}

/**
 * Set observe_library cookie (for switching institutions)
 */
export async function setObserveLibrary(libraryId: number): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set('observe_library', libraryId.toString(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear observe_library cookie (return to home library)
 */
export async function clearObserveLibrary(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('observe_library');
}
