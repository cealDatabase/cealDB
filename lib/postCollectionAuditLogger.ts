import { logAuditEvent } from './auditLogger';
import { checkFormEditPermission } from './formPermissions';
import { cookies } from 'next/headers';

/**
 * Enhanced audit logging specifically for post-collection period edits
 * Tracks detailed information when Editors/SuperAdmins modify forms after closing date
 */
export async function logPostCollectionEdit(params: {
  tableName: string;
  recordId: string | number;
  oldValues: any;
  newValues: any;
  academicYear: number;
  libraryId: number;
  formType: string;
  request?: Request;
}) {
  try {
    // Get user roles from cookies
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

    // Check if this is a post-collection edit
    const permission = await checkFormEditPermission(params.academicYear, userRoles);
    
    // If this is a privileged post-collection edit, use special action and enhanced metadata
    if (permission.isPrivilegedPostClosing) {
      // Calculate what changed
      const changes = calculateChanges(params.oldValues, params.newValues);
      
      await logAuditEvent({
        action: 'POST_COLLECTION_EDIT',
        tableName: params.tableName,
        recordId: params.recordId,
        oldValues: params.oldValues,
        newValues: params.newValues,
        success: true,
        metadata: {
          isPostCollectionEdit: true,
          userRoles,
          academicYear: params.academicYear,
          libraryId: params.libraryId,
          formType: params.formType,
          changeReason: 'Post-collection period modification by privileged user',
          ...changes
        }
      }, params.request);
      
      console.log(`[POST-COLLECTION EDIT] ${params.formType} for library ${params.libraryId}, year ${params.academicYear}`, {
        user_roles: userRoles,
        fields_modified: changes.modifiedFields?.length || 0,
        timestamp: new Date().toISOString()
      });
    } else {
      // Regular edit during collection period
      await logAuditEvent({
        action: params.oldValues ? 'UPDATE' : 'CREATE',
        tableName: params.tableName,
        recordId: params.recordId,
        oldValues: params.oldValues,
        newValues: params.newValues,
        success: true,
        metadata: {
          isPostCollectionEdit: false,
          userRoles,
          academicYear: params.academicYear,
          libraryId: params.libraryId,
          formType: params.formType
        }
      }, params.request);
    }
  } catch (error) {
    console.error('Failed to log post-collection edit:', error);
    // Don't throw - audit logging shouldn't break the main operation
  }
}

/**
 * Calculate what fields changed between old and new values
 */
function calculateChanges(oldValues: any, newValues: any) {
  if (!oldValues) {
    return {
      modifiedFields: Object.keys(newValues || {}),
      changeType: 'CREATE'
    };
  }

  const modifiedFields: string[] = [];
  const fieldChanges: Record<string, { old: any; new: any }> = {};

  for (const key in newValues) {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') continue;
    
    const oldValue = oldValues[key];
    const newValue = newValues[key];
    
    // Compare values (handle null/undefined)
    if (oldValue !== newValue) {
      modifiedFields.push(key);
      fieldChanges[key] = {
        old: oldValue,
        new: newValue
      };
    }
  }

  return {
    modifiedFields,
    fieldChanges,
    changeType: modifiedFields.length > 0 ? 'UPDATE' : 'NO_CHANGE',
    modifiedCount: modifiedFields.length
  };
}

/**
 * Log failed post-collection edit attempts
 */
export async function logPostCollectionEditFailure(params: {
  tableName: string;
  recordId?: string | number;
  error: string;
  academicYear: number;
  libraryId: number;
  formType: string;
  request?: Request;
}) {
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

    await logAuditEvent({
      action: 'POST_COLLECTION_EDIT',
      tableName: params.tableName,
      recordId: params.recordId,
      success: false,
      errorMessage: params.error,
      metadata: {
        isPostCollectionEdit: true,
        userRoles,
        academicYear: params.academicYear,
        libraryId: params.libraryId,
        formType: params.formType
      }
    }, params.request);
  } catch (error) {
    console.error('Failed to log post-collection edit failure:', error);
  }
}
