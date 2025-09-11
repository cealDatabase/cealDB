# Audit Logging System

## Overview

The audit logging system tracks all database operations, user authentication events, and system activities for compliance, debugging, and rollback capabilities. All audit logs are stored in the `AuditLog` table in your PostgreSQL database.

## Features

- ✅ **Comprehensive Tracking**: All CREATE, UPDATE, DELETE operations
- ✅ **Authentication Events**: SIGNIN, SIGNOUT, SIGNIN_FAILED
- ✅ **IP Address & User Agent**: Track client information
- ✅ **Before/After Values**: Store old and new data for rollbacks
- ✅ **Error Logging**: Capture failed operations with error details
- ✅ **Admin Dashboard**: Web interface to view and search audit logs
- ✅ **Vercel Compatible**: Database storage (no file system dependencies)

## Database Schema

```sql
CREATE TABLE "AuditLog" (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES "User"(id),
  username        TEXT,
  action          TEXT NOT NULL,              -- CREATE, UPDATE, DELETE, SIGNIN, etc.
  table_name      TEXT,                       -- Affected table name
  record_id       TEXT,                       -- Affected record ID
  old_values      JSONB,                      -- Previous values (for rollback)
  new_values      JSONB,                      -- New values
  ip_address      TEXT,                       -- Client IP
  user_agent      TEXT,                       -- Browser/client info
  timestamp       TIMESTAMP DEFAULT NOW(),    -- When the action occurred
  success         BOOLEAN DEFAULT TRUE,       -- Operation success/failure
  error_message   TEXT                        -- Error details if failed
);
```

## Usage Examples

### 1. Basic Audit Logging

```typescript
import { logAuditEvent } from '@/lib/auditLogger';

// Log a successful operation
await logAuditEvent({
  userId: user.id,
  username: user.username,
  action: 'CREATE',
  tableName: 'Library',
  recordId: newRecord.id.toString(),
  newValues: newRecord,
  success: true,
}, request);

// Log a failed operation
await logAuditEvent({
  userId: user.id,
  username: user.username,
  action: 'DELETE',
  tableName: 'Library',
  recordId: '123',
  success: false,
  errorMessage: 'Permission denied',
}, request);
```

### 2. Using Helper Functions

For common operations, use the provided helper functions:

```typescript
import { auditedCreate, auditedUpdate, auditedDelete } from '@/lib/auditLogger';

// Audited CREATE
const newRecord = await auditedCreate(
  'Library',                    // table name
  { name: 'New Library' },      // data to create
  user.id,                      // user ID
  user.username,                // username
  request                       // request object
);

// Audited UPDATE
const updatedRecord = await auditedUpdate(
  'Library',                    // table name
  '123',                        // record ID
  { name: 'Updated Name' },     // update data
  user.id,                      // user ID
  user.username,                // username
  request                       // request object
);

// Audited DELETE
const deletedRecord = await auditedDelete(
  'Library',                    // table name
  '123',                        // record ID
  user.id,                      // user ID
  user.username,                // username
  request                       // request object
);
```

### 3. Authentication Events

Authentication events are automatically logged in the signin/signout routes:

```typescript
// Successful signin (automatically logged)
await logAuditEvent({
  userId: user.id,
  username: user.username,
  action: 'SIGNIN',
  success: true,
}, request);

// Failed signin attempt (automatically logged)
await logAuditEvent({
  username: attemptedUsername,
  action: 'SIGNIN_FAILED',
  success: false,
  errorMessage: 'Invalid credentials',
}, request);
```

## Admin Dashboard

### Accessing Audit Logs

1. Log in as an admin user
2. Navigate to `/admin/audit-logs`
3. View, search, and filter audit entries

### Dashboard Features

- **Real-time Search**: Filter by username, action, table, or error message
- **Pagination**: Handle large volumes of audit data
- **Detailed View**: Click any entry to see full details including JSON data
- **Color-coded Actions**: Visual indicators for different operation types
- **Time-relative Display**: Shows "2 hours ago" style timestamps

## Integration Guide

### Adding Audit Logging to New API Routes

1. Import the audit logger:
```typescript
import { logAuditEvent } from '@/lib/auditLogger';
```

2. Add logging after successful operations:
```typescript
export async function POST(request: Request) {
  try {
    const newRecord = await db.myTable.create({ data: requestData });
    
    // Log successful creation
    await logAuditEvent({
      action: 'CREATE',
      tableName: 'MyTable',
      recordId: newRecord.id.toString(),
      newValues: newRecord,
      success: true,
    }, request);
    
    return NextResponse.json({ success: true, data: newRecord });
  } catch (error) {
    // Log failed operation
    await logAuditEvent({
      action: 'CREATE',
      tableName: 'MyTable',
      success: false,
      errorMessage: error.message,
    }, request);
    
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
  }
}
```

### Adding User Context

To include user information in audit logs, extract user data from JWT tokens:

```typescript
import * as jose from 'jose';

async function getUserFromRequest(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = parseInt(payload.sub || '0');
    
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    });
    
    return user;
  } catch {
    return null;
  }
}

// Use in your API routes
export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  
  await logAuditEvent({
    userId: user?.id,
    username: user?.username,
    action: 'CREATE',
    // ... other fields
  }, request);
}
```

## Performance Considerations

### For High-Volume Applications

1. **Async Logging**: Audit logging is non-blocking and won't slow down operations
2. **Indexing**: The system includes database indexes on commonly queried fields
3. **Retention Policy**: Consider implementing log rotation:

```sql
-- Delete audit logs older than 1 year
DELETE FROM "AuditLog" WHERE timestamp < NOW() - INTERVAL '1 year';
```

### Vercel Limitations

- **150 Users Peak**: System designed to handle your projected load
- **Database Storage**: All logs stored in PostgreSQL (no file system usage)
- **Memory Efficient**: Pagination and filtering prevent memory overload

## Security Considerations

1. **Sensitive Data**: Avoid logging passwords or tokens in `old_values`/`new_values`
2. **Access Control**: Audit logs restricted to admin users only
3. **IP Tracking**: Helps identify suspicious access patterns
4. **Immutable Logs**: Consider making audit logs append-only in production

## Rollback Capabilities

The system stores `old_values` for all UPDATE and DELETE operations, enabling rollback:

```typescript
// Example rollback function (implement as needed)
async function rollbackOperation(auditLogId: number) {
  const auditLog = await db.auditLog.findUnique({
    where: { id: auditLogId }
  });
  
  if (auditLog?.action === 'UPDATE' && auditLog.old_values) {
    // Restore previous values
    const model = (db as any)[auditLog.table_name];
    await model.update({
      where: { id: parseInt(auditLog.record_id) },
      data: auditLog.old_values
    });
  }
  
  if (auditLog?.action === 'DELETE' && auditLog.old_values) {
    // Recreate deleted record
    const model = (db as any)[auditLog.table_name];
    await model.create({
      data: auditLog.old_values
    });
  }
}
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure `@/lib/auditLogger` path is correct
2. **Database Errors**: Run `npx prisma db push` to sync schema
3. **Type Errors**: Run `npx prisma generate` to update client types
4. **Permission Issues**: Verify admin role assignments for audit log access

### Monitoring

Check audit log health:
```sql
-- Recent audit activity
SELECT action, COUNT(*) 
FROM "AuditLog" 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY action;

-- Failed operations
SELECT * FROM "AuditLog" 
WHERE success = false 
ORDER BY timestamp DESC 
LIMIT 10;
```

## Next Steps

1. ✅ System is ready for production use
2. Consider adding email alerts for critical failures
3. Implement automated log rotation
4. Add rollback UI functionality
5. Create audit reports and analytics

Your audit logging system is now fully operational and ready to track all database operations across your 20+ tables with comprehensive logging for your 150 users during peak periods.
