import db from './db';
import { headers } from 'next/headers';

export interface AuditLogData {
  userId?: number;
  username?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SIGNIN' | 'SIGNOUT' | 'SIGNIN_FAILED';
  tableName?: string;
  recordId?: string | number;
  oldValues?: any;
  newValues?: any;
  success?: boolean;
  errorMessage?: string;
}

export async function logAuditEvent(data: AuditLogData, request?: Request) {
  try {
    // Extract client info from headers
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    
    // Get IP address (Vercel provides these headers)
    let ipAddress = forwarded?.split(',')[0] || realIp || 'unknown';
    
    // If we have a request object, try to get IP from it
    if (request) {
      const forwardedHeader = request.headers.get('x-forwarded-for');
      const realIpHeader = request.headers.get('x-real-ip');
      ipAddress = forwardedHeader?.split(',')[0] || realIpHeader || ipAddress;
    }

    await db.auditLog.create({
      data: {
        user_id: data.userId || null,
        username: data.username || null,
        action: data.action,
        table_name: data.tableName || null,
        record_id: data.recordId?.toString() || null,
        old_values: data.oldValues || null,
        new_values: data.newValues || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        success: data.success ?? true,
        error_message: data.errorMessage || null,
      },
    });
  } catch (error) {
    // Log to console if audit logging fails (don't throw to avoid breaking main operation)
    console.error('Audit logging failed:', error);
  }
}

// Helper function to get record before deletion/update
export async function getRecordForAudit(tableName: string, recordId: string | number) {
  try {
    const model = (db as any)[tableName];
    if (!model) return null;
    
    return await model.findUnique({
      where: { id: parseInt(recordId.toString()) },
    });
  } catch (error) {
    console.error(`Failed to get record for audit: ${tableName}:${recordId}`, error);
    return null;
  }
}

// Wrapper functions for common database operations
export async function auditedCreate(
  tableName: string,
  data: any,
  userId?: number,
  username?: string,
  request?: Request
) {
  try {
    const model = (db as any)[tableName];
    const result = await model.create({ data });
    
    await logAuditEvent({
      userId,
      username,
      action: 'CREATE',
      tableName,
      recordId: result.id,
      newValues: result,
      success: true,
    }, request);
    
    return result;
  } catch (error) {
    await logAuditEvent({
      userId,
      username,
      action: 'CREATE',
      tableName,
      newValues: data,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }, request);
    throw error;
  }
}

export async function auditedUpdate(
  tableName: string,
  recordId: string | number,
  data: any,
  userId?: number,
  username?: string,
  request?: Request
) {
  try {
    // Get old values before update
    const oldRecord = await getRecordForAudit(tableName, recordId);
    
    const model = (db as any)[tableName];
    const result = await model.update({
      where: { id: parseInt(recordId.toString()) },
      data,
    });
    
    await logAuditEvent({
      userId,
      username,
      action: 'UPDATE',
      tableName,
      recordId: recordId.toString(),
      oldValues: oldRecord,
      newValues: result,
      success: true,
    }, request);
    
    return result;
  } catch (error) {
    await logAuditEvent({
      userId,
      username,
      action: 'UPDATE',
      tableName,
      recordId: recordId.toString(),
      newValues: data,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }, request);
    throw error;
  }
}

export async function auditedDelete(
  tableName: string,
  recordId: string | number,
  userId?: number,
  username?: string,
  request?: Request
) {
  try {
    // Get record before deletion
    const oldRecord = await getRecordForAudit(tableName, recordId);
    
    const model = (db as any)[tableName];
    const result = await model.delete({
      where: { id: parseInt(recordId.toString()) },
    });
    
    await logAuditEvent({
      userId,
      username,
      action: 'DELETE',
      tableName,
      recordId: recordId.toString(),
      oldValues: oldRecord,
      success: true,
    }, request);
    
    return result;
  } catch (error) {
    await logAuditEvent({
      userId,
      username,
      action: 'DELETE',
      tableName,
      recordId: recordId.toString(),
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }, request);
    throw error;
  }
}
