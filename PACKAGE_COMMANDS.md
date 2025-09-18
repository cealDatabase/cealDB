# 📋 Package Commands Guide

This guide explains when and how to use each npm command in your cealDB project.

## 🚀 Development Commands

### `npm run dev`
**Purpose:** Start the development server  
**When to use:**
- Daily development work
- Testing features locally
- Hot reloading during code changes

```bash
npm run dev
```
**Safety:** 🟢 **Safe** - No database changes

---

### `npm run build`
**Purpose:** Build the application for production  
**When to use:**
- Before deploying to production
- Testing production build locally
- CI/CD pipeline

```bash
npm run build
```
**Safety:** 🟢 **Safe** - Only generates Prisma client and builds Next.js

---

### `npm start`
**Purpose:** Start the production server  
**When to use:**
- Running production build locally
- After `npm run build`

```bash
npm start
```
**Safety:** 🟢 **Safe** - No database changes

---

## 🗄️ Database Commands

### `npm run db:seed` ⭐ **Most Common**
**Purpose:** Selective sync - preserves User authentication data  
**When to use:**
- **Daily scenario:** When your `public` schema gets corrupted but you want to keep user accounts
- Restoring library/survey data from `ceal` schema
- Regular data refresh without losing user sessions

```bash
# Default: Preserves User, AuditLog, Session tables
npm run db:seed
```

**What happens:**
- ✅ **PRESERVES** User accounts, passwords, sessions
- ✅ **SYNCS** library data, surveys, reference tables from `ceal`
- ✅ Users stay logged in, no re-authentication needed

**Safety:** 🟢 **Safe** - Your authentication data is protected

---

### `SYNC_AUTH_TABLES=true npm run db:seed`
**Purpose:** Full sync - overwrites everything including users  
**When to use:**
- When you need to completely restore from `ceal` schema
- User data in public is also corrupted
- Fresh start with clean user accounts from `ceal`

```bash
SYNC_AUTH_TABLES=true npm run db:seed
```

**What happens:**
- 🔄 **OVERWRITES** everything including User tables
- 🔄 **SYNCS** all data from `ceal` → `public`
- ⚠️ All users need to re-authenticate

**Safety:** 🟡 **Caution** - All users will lose sessions

---

### `npm run db:push`
**Purpose:** Push schema changes to database  
**When to use:**
- After modifying Prisma schema
- Applying structural changes
- Development schema updates

```bash
npm run db:push
```
**Safety:** 🟡 **Caution** - Can affect database structure

---

### `npm run db:reset` ⚠️ **Nuclear Option**
**Purpose:** Complete database wipe and reseed  
**When to use:**
- Database is completely broken
- Starting fresh development environment
- Emergency recovery

```bash
npm run db:reset
```

**What happens:**
- 💥 **WIPES** entire database
- 🔄 **RESEEDS** everything from `ceal`
- 💥 **LOSES** all current data in public schema

**Safety:** 🔴 **Dangerous** - Complete data loss

---

### `npm run db:migrate`
**Purpose:** Create and apply database migrations  
**When to use:**
- Production schema changes
- Tracking schema evolution
- Team collaboration on schema changes

```bash
npm run db:migrate
```
**Safety:** 🟡 **Caution** - Creates migration files

---

### `npm run prisma:studio`
**Purpose:** Open Prisma Studio GUI  
**When to use:**
- Viewing database data
- Manual data editing
- Debugging data issues
- Checking sync results

```bash
npm run prisma:studio
```
**Safety:** 🟢 **Safe** - Read/write interface

---

## 📊 Common Scenarios

### Scenario 1: Daily Development
```bash
npm run dev                    # Start development
npm run prisma:studio         # Check data if needed
```

### Scenario 2: Library Data Got Corrupted
```bash
npm run db:seed               # Restore from ceal, keep users
npm run prisma:studio         # Verify the sync worked
```

### Scenario 3: New Schema Changes
```bash
npm run db:push               # Apply schema changes
npm run db:seed               # Refresh data if needed
```

### Scenario 4: Complete Fresh Start
```bash
npm run db:reset              # Nuclear option - wipes everything
# OR for selective approach:
SYNC_AUTH_TABLES=true npm run db:seed  # Fresh start with auth sync
```

### Scenario 5: Production Deployment
```bash
npm run build                 # Build for production
npm start                     # Start production server
```

### Scenario 6: Emergency User Recovery
```bash
# If you accidentally wiped users but have backup
npm run db:reset              # Start fresh
# Then restore users from backup manually via Prisma Studio
npm run prisma:studio
```

---

## 🛡️ Safety Guidelines

### ✅ Safe Commands (Use Anytime)
- `npm run dev`
- `npm run build`  
- `npm start`
- `npm run db:seed` (default mode)
- `npm run prisma:studio`
- `npm run lint`

### 🟡 Caution Commands (Think First)
- `npm run db:push`
- `npm run db:migrate`
- `SYNC_AUTH_TABLES=true npm run db:seed`

### 🔴 Dangerous Commands (Emergency Only)
- `npm run db:reset`

---

## 🎯 Quick Decision Tree

**Is your data corrupted?**
- No → Use `npm run dev` for development
- Yes → Continue below

**Do you want to keep user accounts?**
- Yes → Use `npm run db:seed` (default)
- No → Use `SYNC_AUTH_TABLES=true npm run db:seed`

**Is everything completely broken?**
- Yes → Use `npm run db:reset` (nuclear option)

**Just want to look at data?**
- Use `npm run prisma:studio`

---

## 🔍 Verification Commands

After any database operation, verify with:

```bash
npm run prisma:studio         # Visual inspection
npm run dev                   # Test the application
```

Check the console output for:
- ✅ "Authentication tables preserved" (selective sync)
- ✅ "Authentication tables synced" (full sync)  
- ✅ Final user counts and data summary

---

## 📞 Troubleshooting

### Command Failed?
1. Check console output for specific errors
2. Verify database connection
3. Check Prisma schema syntax
4. Try `npm run prisma:studio` to inspect current state

### Lost Data?
1. Check if you used the right sync mode
2. Verify environment variables (`SYNC_AUTH_TABLES`)
3. Check if `ceal` schema has the expected data

### Users Can't Login?
1. Verify you used default `npm run db:seed` (not full sync)
2. Check User table still has data via Prisma Studio
3. Verify authentication cookies/sessions

---

## 💡 Pro Tips

1. **Always backup before major operations**
2. **Test in development before production**
3. **Use Prisma Studio to verify results**
4. **Check console output for confirmation messages**
5. **Keep `SYNC_AUTH_TABLES=false` as default**
6. **Document any custom sync needs**

---

## 📝 Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `SYNC_AUTH_TABLES` | `false` | Controls whether to overwrite User tables |
| `DATABASE_URL` | Required | Database connection string |
| `AUTH_SECRET` | Required | Authentication secret |

Remember: **When in doubt, use `npm run db:seed` (default mode) - it's the safest option!** 🎉
