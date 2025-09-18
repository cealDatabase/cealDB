# Selective Schema Synchronization

This document explains how to use the selective schema synchronization feature in the cealDB project to sync data between the `ceal` (golden source) and `public` schemas while preserving critical authentication data.

## Overview

The cealDB project supports two database schemas:

- **`ceal` schema**: The golden source of truth with clean, authoritative data
- **`public` schema**: The active schema that may get corrupted and contains live user authentication data

The selective sync feature allows you to:
1. Restore corrupted data tables from the `ceal` schema
2. Preserve user authentication tables (`User`, `AuditLog`, `Session`) in the `public` schema
3. Maintain continuity of user sessions and passwords during data recovery

## Configuration

### Environment Variables

Set the `SYNC_AUTH_TABLES` environment variable to control synchronization behavior:

```bash
# Preserve authentication tables (default and recommended)
SYNC_AUTH_TABLES=false

# Overwrite ALL tables including authentication (use with caution)
SYNC_AUTH_TABLES=true
```

### Sync Modes

#### 1. Selective Sync (Default - Recommended)
```bash
# Or simply omit the variable (defaults to false)
npm run db:seed
```

**What happens:**
- ✅ Syncs all data tables from `ceal` → `public`
- 🛡️ Preserves `User`, `AuditLog`, `Session` tables in `public` schema
- 🔄 Users can continue using the application without re-authentication
- 📊 Corrupted library/survey data gets restored from clean source

#### 2. Full Sync (Use with extreme caution)
```bash
SYNC_AUTH_TABLES=true npm run db:seed
```

**What happens:**
- ⚠️ Overwrites ALL tables including authentication data
- 🚨 All users will need to re-authenticate
- 💥 Existing sessions will be invalidated
- 🔄 Complete database restoration from `ceal` schema

## Usage Examples

### Scenario 1: Corrupted Survey Data Recovery
Your `public` schema has corrupted survey tables but user authentication is working fine:

```bash
# Check current data state
npm run db:status

# Run selective sync (preserves auth)
npm run db:seed

# Verify restored data
npm run db:verify
```

### Scenario 2: Complete Database Restoration
You need to completely restore from `ceal` schema (nuclear option):

```bash
# Backup current auth data first!
pg_dump -t public.\"User\" -t public.\"AuditLog\" -t public.\"Session\" cealdb > auth_backup.sql

# Run full sync
SYNC_AUTH_TABLES=true npm run db:seed

# Manually restore auth if needed
psql cealdb < auth_backup.sql
```

## Safety Features

### Pre-sync Checks
The system automatically performs these safety checks:

1. **Data inventory**: Shows current record counts in public schema
2. **Auth table status**: Warns if user data will be overwritten
3. **Configuration validation**: Displays sync mode and preserved tables

### Console Output Example
```
🛡️  SAFETY RECOMMENDATIONS:
   1. Backup your public schema before running this sync
   2. Test in a development environment first  
   3. Verify SYNC_AUTH_TABLES setting matches your intent
   4. Check that ceal schema is clean and up-to-date

🔄 Starting selective schema synchronization...
📋 Auth tables sync: DISABLED
🛡️  Preserving tables in public schema: User, AuditLog, Session

📊 Current data in public schema:
   Users: 25
   Libraries: 85
   Library Years: 150
✅ User data will be preserved
```

## Tables Affected

### Always Synced from `ceal` → `public`
- Library data (library, library_year)
- Survey forms (electronic, electronic_books, public_services, etc.)
- Reference data (language, reflibrarytype, etc.)
- List data (list_av, list_ebook, list_ejournal)
- Statistical data (monographic_acquisitions, personnel_support, etc.)

### Conditionally Synced (Based on SYNC_AUTH_TABLES)
- `User` - User accounts and profile information
- `User_Library` - User-library associations  
- `Users_Roles` - User role assignments

### Always Preserved in `public` Schema
- `AuditLog` - System audit trails
- `Session` - Active user sessions
- Any other authentication-related tables

## Best Practices

### Before Running Sync

1. **Backup your data**:
   ```bash
   pg_dump cealdb > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test in development first**:
   ```bash
   # Copy production to dev
   pg_dump production_db | psql development_db
   
   # Test sync in dev
   npm run db:seed
   ```

3. **Verify ceal schema integrity**:
   ```bash
   # Check for data consistency
   npm run db:validate-ceal
   ```

### After Running Sync

1. **Verify data integrity**:
   ```bash
   npm run db:verify
   ```

2. **Test critical functionality**:
   - User authentication
   - Survey form submission
   - Data reporting

3. **Monitor for issues**:
   - Check application logs
   - Verify user sessions work
   - Test form submissions

## Troubleshooting

### Common Issues

#### Issue: "User data will be overwritten" warning
**Solution**: Set `SYNC_AUTH_TABLES=false` or omit the variable

#### Issue: Prisma client errors after sync
**Solution**: Regenerate Prisma client:
```bash
npx prisma generate
```

#### Issue: Foreign key constraint violations
**Solution**: Check that user IDs in preserved tables match library associations

#### Issue: Authentication stops working
**Solution**: Verify that Auth.js configuration matches preserved User table structure

### Recovery Steps

If something goes wrong during sync:

1. **Stop the application**
2. **Restore from backup**:
   ```bash
   psql cealdb < your_backup.sql
   ```
3. **Regenerate Prisma client**:
   ```bash
   npx prisma generate
   ```
4. **Restart application and verify**

## Advanced Configuration

### Custom Preserved Tables

To preserve additional tables, modify the configuration in `prisma/seed.ts`:

```typescript
const SYNC_CONFIG = {
  SYNC_AUTH_TABLES: process.env.SYNC_AUTH_TABLES === 'true' || false,
  PRESERVED_TABLES: ['User', 'AuditLog', 'Session', 'CustomTable'] as const,
};
```

### Selective Table Sync

For more granular control, you can modify the seed script to exclude specific tables from sync by adding conditional logic around their fetch and insert operations.

## Support

For issues with selective sync:
1. Check console output for specific error messages
2. Verify database connectivity to both schemas
3. Ensure proper permissions on both `ceal` and `public` schemas
4. Review Prisma logs for detailed error information

Remember: **Always backup your data before running any sync operations!**
