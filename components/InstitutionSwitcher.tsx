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
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchUserRoles = () => {
      try {
        // Debug: Show ALL cookies
        
        const roleCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('role='))
          ?.split('=')[1];
        
        console.log('[InstitutionSwitcher] Raw role cookie:', roleCookie);
        
        if (roleCookie) {
          try {
            // Decode URL-encoded cookie value
            let decodedCookie = decodeURIComponent(roleCookie);
            
            // Fix corrupted cookie data (C instead of comma)
            decodedCookie = decodedCookie.replace(/(\"\d+\")C(\"\d+\")/g, '$1,$2');
            
            // Fix malformed JSON (trailing commas before ])
            const fixedJson = decodedCookie.replace(/,(\s*[\]}])/g, '$1');
            
            const roles = JSON.parse(fixedJson);
            const rolesArray = Array.isArray(roles) ? roles : [roles];
            setUserRoles(rolesArray);
            setRolesLoaded(true);
          } catch (parseError) {
            console.error('[InstitutionSwitcher] ⚠️ Parse error:', parseError);
            
            // Aggressive fallback: extract all numbers from the cookie
            try {
              const decodedCookie = decodeURIComponent(roleCookie);
              console.log('[InstitutionSwitcher] Attempting aggressive extraction from:', decodedCookie);
              
              // Extract all quoted numbers: "1", "2", etc.
              const matches = decodedCookie.match(/"(\d+)"/g);
              if (matches) {
                const extractedRoles = matches.map(m => m.replace(/"/g, ''));
                console.log('[InstitutionSwitcher] ✅ Extracted roles via regex:', extractedRoles);
                setUserRoles(extractedRoles);
                setRolesLoaded(true);
              } else {
                console.log('[InstitutionSwitcher] ⚠️ No roles found, using decoded value');
                setUserRoles([decodedCookie]);
                setRolesLoaded(true);
              }
            } catch (extractError) {
              console.error('[InstitutionSwitcher] ❌ Extraction failed:', extractError);
              console.log('[InstitutionSwitcher] Using completely raw value:', [roleCookie]);
              setUserRoles([roleCookie]);
              setRolesLoaded(true);
            }
          }
        } else {
          console.log('[InstitutionSwitcher] ❌ No role cookie found');
          console.log('[InstitutionSwitcher] All cookies:', document.cookie);
          setRolesLoaded(true);
        }
      } catch (error) {
        console.error('[InstitutionSwitcher] ❌ Failed to parse user roles:', error);
        setRolesLoaded(true);
      }
    };

    fetchUserRoles();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchCurrentLibraryId = () => {
      try {
        const libraryCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('library='))
          ?.split('=')[1];
        
        console.log('[InstitutionSwitcher] Library cookie:', libraryCookie);
        
        if (libraryCookie) {
          const libId = parseInt(libraryCookie);
          if (!isNaN(libId)) {
            console.log('[InstitutionSwitcher] ✅ Current library ID:', libId);
            setCurrentLibraryId(libId);
            // Store home library ID (user's actual library)
            setHomeLibraryId(libId);
          }
        } else {
          console.log('[InstitutionSwitcher] ❌ No library cookie found');
        }
      } catch (error) {
        console.error('[InstitutionSwitcher] Failed to read library cookie:', error);
      }
    };

    fetchCurrentLibraryId();
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
        console.log('[InstitutionSwitcher] ✅ Cookie updated, navigating to new library...');
        
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

  return (
    <div className="space-y-2 mb-4">
      {/* Warning banner when viewing non-home library */}
      {isViewingOtherLibrary && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950 rounded-lg border-2 border-amber-300 dark:border-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              ⚠️ You are viewing data for: {currentLibraryName}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              This is not your home institution. You are viewing and editing another library's data.
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
        
        <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
          {isSuperAdmin ? '(Can edit all data)' : '(View only)'}
        </span>
      </div>
    </div>
  );
}
