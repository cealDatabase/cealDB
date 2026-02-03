'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, AlertTriangle } from 'lucide-react';
import { getCookies, getUserRoles } from '@/lib/cookieActions';

interface Library {
  id: number;
  library_name: string;
}

interface InstitutionSwitcherProps {
  currentYear?: number;
}

export function InstitutionSwitcher({ currentYear }: InstitutionSwitcherProps) {
  
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [currentLibraryId, setCurrentLibraryId] = useState<number | null>(null);
  const [homeLibraryId, setHomeLibraryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Ensure component only renders on client to access cookies
  useEffect(() => {
    console.log('[InstitutionSwitcher] 🚀 Component mounting on client...');
    setMounted(true);
    
    // Validate session to detect cookie tampering
    const validateSession = async () => {
      try {
        const response = await fetch('/api/validate-session');
        const data = await response.json();
        
        if (!data.valid) {
          console.error('[InstitutionSwitcher] ⚠️ SESSION VALIDATION FAILED:', data.reason);
          
          if (data.tampered) {
            // Cookie tampering detected - force sign out
            alert('Security warning: Session validation failed. You will be signed out.');
            window.location.href = '/signout';
          }
        } else {
          console.log('[InstitutionSwitcher] ✅ Session validated successfully');
        }
      } catch (error) {
        console.error('[InstitutionSwitcher] Session validation error:', error);
      }
    };
    
    validateSession();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchUserRoles = async () => {
      try {
        const roles = await getUserRoles();
        console.log('[InstitutionSwitcher] ✅ Roles from server action:', roles);
        setUserRoles(roles);
        setRolesLoaded(true);
      } catch (error) {
        console.error('[InstitutionSwitcher] Failed to get roles:', error);
        setRolesLoaded(true);
      }
    };

    fetchUserRoles();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchLibraryIds = async () => {
      try {
        const cookieData = await getCookies();
        
        console.log('[InstitutionSwitcher] Home library cookie:', cookieData.library);
        console.log('[InstitutionSwitcher] Observe library cookie:', cookieData.observe_library);
        
        if (cookieData.library) {
          const homeLibId = parseInt(cookieData.library);
          if (!isNaN(homeLibId)) {
            console.log('[InstitutionSwitcher] 🏠 Home library ID:', homeLibId);
            setHomeLibraryId(homeLibId);
          }
        } else {
          console.log('[InstitutionSwitcher] ❌ No library cookie found');
        }
        
        // Current viewing library: observe_library if exists, otherwise library
        const viewingLibId = cookieData.observe_library 
          ? parseInt(cookieData.observe_library) 
          : parseInt(cookieData.library || '0');
        if (!isNaN(viewingLibId) && viewingLibId > 0) {
          console.log('[InstitutionSwitcher] ✅ Current viewing library ID:', viewingLibId);
          setCurrentLibraryId(viewingLibId);
        }
      } catch (error) {
        console.error('[InstitutionSwitcher] Failed to read library cookies:', error);
      }
    };

    fetchLibraryIds();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchLibraries = async () => {
      try {
        const year = currentYear || new Date().getFullYear();
        const response = await fetch(`/api/libraries?year=${year}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[InstitutionSwitcher] Fetched libraries:', data.libraries?.length);
          setLibraries(data.libraries || []);
        }
      } catch (error) {
        console.error('Failed to fetch libraries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibraries();
  }, [currentYear, mounted]);

  // Don't render anything until mounted (client-side only)
  if (!mounted) {
    console.log('[InstitutionSwitcher] ⏳ Not mounted yet, waiting...');
    return null;
  }

  // Wait for roles to load before checking permissions
  if (!rolesLoaded) {
    console.log('[InstitutionSwitcher] ⏳ Waiting for roles to load...');
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 mb-4">
        <Building2 className="h-4 w-4 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-600">Loading permissions...</span>
      </div>
    );
  }

  // Convert all roles to strings and check
  const rolesAsStrings = userRoles.map(r => String(r).trim());
  const isSuperAdmin = rolesAsStrings.includes('1');
  const isEditor = rolesAsStrings.includes('3');

  // Only show for Editor or Super Admin
  if (!isSuperAdmin && !isEditor) {
    console.log('[InstitutionSwitcher] ❌ NOT SHOWING - user is not Super Admin or Editor');
    return null;
  }
  
  console.log('[InstitutionSwitcher] ✅✅✅ SHOWING SWITCHER - CREATING BLUE BANNER NOW ✅✅✅');

  const handleLibraryChange = async (newLibraryId: string) => {
    const libId = parseInt(newLibraryId);
    console.log('[InstitutionSwitcher] Switching to library ID:', libId);
    
    try {
      // Update library cookie via API
      const response = await fetch('/api/switch-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libraryId: libId })
      });
      
      if (response.ok) {
        console.log('[InstitutionSwitcher] ✅ Cookie updated, updating state and navigating...');
        
        // Update component state immediately to reflect the change
        setCurrentLibraryId(libId);
        
        // Build new URL by replacing library ID in current path
        // e.g., /admin/forms/200/otherHoldings -> /admin/forms/123/otherHoldings
        const pathParts = pathname.split('/');
        const formsIndex = pathParts.indexOf('forms');
        
        if (formsIndex !== -1 && pathParts[formsIndex + 1]) {
          // Replace the library ID in URL
          pathParts[formsIndex + 1] = libId.toString();
          const newPath = pathParts.join('/');
          console.log('[InstitutionSwitcher] Navigating to:', newPath);
          router.push(newPath);
        } else {
          // Fallback: just refresh
          console.log('[InstitutionSwitcher] Could not parse URL, refreshing instead');
          router.refresh();
        }
      } else {
        console.error('[InstitutionSwitcher] Failed to update library cookie');
      }
    } catch (error) {
      console.error('[InstitutionSwitcher] Error switching library:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading institutions...</span>
      </div>
    );
  }

  if (currentLibraryId === null) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-950 rounded-md border border-yellow-200">
        <Building2 className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-800 dark:text-yellow-200">Loading current institution...</span>
      </div>
    );
  }

  // Check if viewing non-home library
  const isViewingOtherLibrary = homeLibraryId !== null && currentLibraryId !== homeLibraryId;
  const currentLibraryName = libraries.find(lib => lib.id === currentLibraryId)?.library_name || 'Unknown';
  const homeLibraryName = libraries.find(lib => lib.id === homeLibraryId)?.library_name || 'Unknown';

  const handleReturnHome = () => {
    if (homeLibraryId !== null) {
      console.log('[InstitutionSwitcher] Returning to home library:', homeLibraryId);
      handleLibraryChange(homeLibraryId.toString());
    }
  };

  return (
    <div className="space-y-2 mb-4">
      {/* Warning banner when viewing non-home library */}
      {isViewingOtherLibrary && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950 rounded-lg border-2 border-amber-300 dark:border-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              ⚠️ You are viewing: {currentLibraryName}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              This is not your home institution. You are viewing and editing data from another institution.
            </p>
          </div>
        </div>
      )}
      
      {/* Institution Switcher */}
      <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {isSuperAdmin ? 'Super Admin View:' : 'Editor View:'}
          </span>
        </div>
        
        <Select
          value={currentLibraryId.toString()}
          onValueChange={handleLibraryChange}
        >
          <SelectTrigger className="w-[300px] bg-white dark:bg-gray-900">
            <SelectValue placeholder="Select institution" />
          </SelectTrigger>
          <SelectContent>
            {libraries.map((library) => (
              <SelectItem key={library.id} value={library.id.toString()}>
                {library.library_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <span className="text-xs text-blue-600 dark:text-blue-400">
          {isSuperAdmin ? '(Can edit all data)' : '(View only)'}
        </span>

        {/* Return to home button - only show when viewing other library */}
        {isViewingOtherLibrary && (
          <button
            onClick={handleReturnHome}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            title={`Return to ${homeLibraryName}`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Return to my home institution</span>
          </button>
        )}
      </div>
    </div>
  );
}
