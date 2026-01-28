// lib/formPermissions.ts
import db from '@/lib/db';

const prisma = db;

/**
 * Check if a user can edit forms based on survey session status and their role
 * 
 * @param year - The academic year to check
 * @param userRoles - Array of user role IDs (as strings)
 * @returns Object with canEdit flag and reason
 */
export async function checkFormEditPermission(
  year: number,
  userRoles: string[]
): Promise<{
  canEdit: boolean;
  isAfterClosing: boolean;
  isPrivilegedPostClosing: boolean;
  reason?: string;
  surveySession?: any;
}> {
  try {
    // Super admins (role 1) and E-Resource Editors (role 3) can always edit
    const isSuperAdmin = userRoles.includes('1');
    const isEResourceEditor = userRoles.includes('3');
    const isPrivilegedUser = isSuperAdmin || isEResourceEditor;
    const isRegularUser = userRoles.includes('2') && userRoles.length === 1;

    console.log('[formPermissions] Checking permissions for year:', year);
    console.log('[formPermissions] User roles:', userRoles);
    console.log('[formPermissions] Is privileged user:', isPrivilegedUser);

    // Check if there's a survey session for this year
    const surveySession = await prisma.surveySession.findUnique({
      where: { academicYear: year }
    });

    if (!surveySession) {
      // No survey session means no automated control - allow editing
      return {
        canEdit: true,
        isAfterClosing: false,
        isPrivilegedPostClosing: false,
        reason: 'No survey session configured for this year'
      };
    }

    // Check if current date is after closing date
    const now = new Date();
    const closingDate = new Date(surveySession.closingDate);
    const isAfterClosing = now > closingDate;

    console.log('[formPermissions] Current date:', now.toISOString());
    console.log('[formPermissions] Closing date:', closingDate.toISOString());
    console.log('[formPermissions] Is after closing:', isAfterClosing);

    // Privileged users can edit after closing, but we need to flag it for warning display
    if (isPrivilegedUser && isAfterClosing) {
      console.log('[formPermissions] ✅ RETURNING isPrivilegedPostClosing: TRUE');
      return {
        canEdit: true,
        isAfterClosing: true,
        isPrivilegedPostClosing: true,
        reason: 'Privileged user editing after collection period',
        surveySession
      };
    }

    // Regular users cannot edit after closing date
    if (isRegularUser && isAfterClosing) {
      return {
        canEdit: false,
        isAfterClosing: true,
        isPrivilegedPostClosing: false,
        reason: 'Survey period has closed. Form is now read-only.',
        surveySession
      };
    }

    // Check if before opening date
    const openingDate = new Date(surveySession.openingDate);
    const isBeforeOpening = now < openingDate;

    if (isBeforeOpening) {
      return {
        canEdit: false,
        isAfterClosing: false,
        isPrivilegedPostClosing: false,
        reason: 'Survey period has not yet opened.',
        surveySession
      };
    }

    // Within survey period - allow editing
    console.log('[formPermissions] ⚠️ RETURNING isPrivilegedPostClosing: FALSE (within period)');
    return {
      canEdit: true,
      isAfterClosing: false,
      isPrivilegedPostClosing: false,
      reason: 'Survey period is active',
      surveySession
    };

  } catch (error) {
    console.error('Error checking form edit permission:', error);
    // On error, default to allowing edit (fail open for better UX)
    return {
      canEdit: true,
      isAfterClosing: false,
      isPrivilegedPostClosing: false,
      reason: 'Permission check failed - defaulting to allow'
    };
  }
}

/**
 * Get user roles from cookies (for client-side use)
 */
export function getUserRolesFromCookies(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const cookies = document.cookie.split(';');
  const roleCookie = cookies.find(c => c.trim().startsWith('role='));
  
  if (!roleCookie) {
    return [];
  }

  const roleValue = roleCookie.split('=')[1];
  
  try {
    // Try parsing as JSON array first
    const parsed = JSON.parse(decodeURIComponent(roleValue));
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // If not JSON, treat as single value
    return [roleValue];
  }
}
