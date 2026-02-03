'use client';

import { useState, useEffect } from 'react';
import db from '@/lib/db';
import { getCookies } from '@/lib/cookieActions';

interface FormSession {
  year: number;
  totalLibraries: number;
  openLibraries: number;
  closedLibraries: number;
  lastUpdated: string;
  libraries: {
    id: number;
    libraryId: number | null;
    libraryName: string | null;
    isOpen: boolean | null;
    isActive: boolean | null;
    adminNotes: string | null;
  }[];
}

interface FormSessionStatus {
  totalLibraries: number;
  openForEditing: number;
  percentage: number;
}

interface UseFormSessionReturn {
  session: FormSession | null;
  isOpen: boolean;
  status: FormSessionStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFormSession(year?: number): UseFormSessionReturn {
  const [session, setSession] = useState<FormSession | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<FormSessionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFormSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = year ? `/api/admin/form-session?year=${year}` : '/api/admin/form-session';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch form session status');
      }

      const data = await response.json();
      
      setSession(data.session);
      setIsOpen(data.isOpen);
      setStatus(data.status);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch form session');
      setSession(null);
      setIsOpen(false);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormSession();
  }, [year]);

  return {
    session,
    isOpen,
    status,
    loading,
    error,
    refetch: fetchFormSession
  };
}

/**
 * Helper function to determine if forms should be enabled for a given library
 * Only members (role ID 2) can edit their own library's forms during active session
 */
export function canEditForm(
  userLibraryIds: number[],
  targetLibraryId: number,
  userRoles: string[],
  isFormSessionOpen: boolean
): boolean {
  // Super admins (role 1) can always edit (but this should be rare)
  if (userRoles.includes('1')) {
    return true;
  }

  // Members (role 2) can only edit during open session and only their own library
  if (userRoles.includes('2') && isFormSessionOpen) {
    return userLibraryIds.includes(targetLibraryId);
  }

  return false;
}

/**
 * Hook to check if current user can edit a specific library's forms
 */
export function useCanEditForm(targetLibraryId: number) {
  const { isOpen, loading } = useFormSession();
  const [canEdit, setCanEdit] = useState(false);
  const [userInfo, setUserInfo] = useState<{ 
    libraryIds: number[], 
    roles: string[] 
  } | null>(null);

  useEffect(() => {
    // Get user info from cookies using Server Actions
    const getUserInfo = async () => {
      try {
        const cookieData = await getCookies();
        
        if (cookieData.library && cookieData.role) {
          // Parse roles from JSON
          let roles: string[] = [];
          try {
            const parsed = JSON.parse(decodeURIComponent(cookieData.role));
            roles = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            roles = [cookieData.role];
          }
          
          // Home library as single ID
          const libraryId = parseInt(cookieData.library);
          
          setUserInfo({
            libraryIds: [libraryId], // User's home library as array for compatibility
            roles: roles
          });
        } else {
          console.warn('[useFormSession] Missing required cookies (library or role)');
          setUserInfo(null);
        }
      } catch (error) {
        console.error('[useFormSession] Failed to get user info from cookies:', error);
        setUserInfo(null);
      }
    };

    getUserInfo();
  }, []);

  useEffect(() => {
    if (userInfo && !loading) {
      const canUserEdit = canEditForm(
        userInfo.libraryIds,
        targetLibraryId,
        userInfo.roles,
        isOpen
      );
      setCanEdit(canUserEdit);
    } else {
      setCanEdit(false);
    }
  }, [userInfo, targetLibraryId, isOpen, loading]);

  return {
    canEdit,
    isSessionOpen: isOpen,
    loading,
    userInfo
  };
}