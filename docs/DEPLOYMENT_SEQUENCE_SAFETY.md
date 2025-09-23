# Database Sequence Safety for Production Deployments

This document outlines the comprehensive strategy to prevent database sequence issues in production deployments.

## 🚨 The Problem

Database sequence issues occur when auto-increment sequences get out of sync with actual table data, causing unique constraint violations like:

```
Unique constraint failed on the fields: (`id`)
```

## 🔧 Prevention Strategy

### 1. Automated Pre-Deployment Checks

**Command:** `npm run db:check`

Runs before every deployment to verify all sequences are healthy:

```bash
# Check sequence health before deployment
npm run db:check
```

This script:
- ✅ Checks all auto-increment sequences
- ❌ Blocks deployment if issues found  
- 💡 Provides clear fix instructions

### 2. Automatic Sequence Fixing

**Command:** `npm run db:seed` (already includes sequence fix)

Your existing seed command automatically fixes sequences:

```bash
# This already runs fix-all-sequences.js
npm run db:seed
```

### 3. Post-Deployment Verification

**Command:** `npm run db:verify`

Runs after deployment to ensure sequences work correctly:

```bash
# Verify sequences work in production
npm run db:verify
```

## 🚀 Deployment Workflow

### Manual Deployment

```bash
# 1. Pre-deployment check
npm run db:check

# 2. If issues found, fix them
npm run db:seed  # This fixes sequences automatically

# 3. Build and deploy
npm run build
# ... your deployment commands ...

# 4. Post-deployment verification
npm run db:verify
```

### Automated CI/CD

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

1. **Pre-Deploy**: Checks sequence health
2. **Deploy**: Only proceeds if checks pass
3. **Post-Deploy**: Verifies sequences work in production

## 🛠️ Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run db:check` | Check sequence health | Before every deployment |
| `npm run db:seed` | Fix sequences + reseed data | When sequences are broken |
| `npm run db:verify` | Test sequence operations | After deployment |
| `node scripts/fix-all-sequences.js` | Fix sequences only | Quick sequence fix |

## 🔍 Common Scenarios

### Scenario 1: Pre-Deployment Check Fails

```bash
npm run db:check
# ❌ DEPLOYMENT BLOCKED: Fix sequence issues before proceeding

# Fix the issues
npm run db:seed

# Verify fix
npm run db:check
# ✅ All sequences are healthy! Safe to deploy.
```

### Scenario 2: Production Deployment

```bash
# 1. Check local sequences
npm run db:check

# 2. Deploy (with CI/CD or manual)
npm run build
# ... deploy ...

# 3. Verify production
DATABASE_URL=production_url npm run db:verify
```

### Scenario 3: Emergency Fix in Production

```bash
# If production has sequence issues
DATABASE_URL=production_url node scripts/fix-all-sequences.js

# Verify the fix
DATABASE_URL=production_url npm run db:verify
```

## 🎯 Root Cause Prevention

### Data Import Best Practices

1. **Always use auto-increment**: Don't specify explicit IDs
2. **After imports**: Run sequence fix automatically
3. **Database restores**: Include sequence reset in restore process

### Code Best Practices

```javascript
// ✅ Good - Let database assign ID
const newRecord = await db.table.create({
  data: { title: "Example" }
});

// ❌ Bad - Don't specify ID manually
const newRecord = await db.table.create({
  data: { id: 123, title: "Example" }
});
```

## 🔄 Integration with Existing Workflow

Your existing commands already include sequence fixes:

- `npm run db:seed` → Includes `fix-all-sequences.js`
- `npm run db:reset` → Includes `fix-all-sequences.js`

New commands for deployment safety:

- `npm run db:check` → Pre-deployment verification
- `npm run db:verify` → Post-deployment testing

## 🚨 Emergency Procedures

### If Production is Down Due to Sequence Issues

```bash
# 1. Immediate fix
DATABASE_URL=production_url node scripts/fix-all-sequences.js

# 2. Verify fix worked
DATABASE_URL=production_url npm run db:verify

# 3. Monitor for additional issues
# Check application logs for any remaining errors
```

### If CI/CD Pipeline Fails

```bash
# 1. Check what failed
npm run db:check

# 2. Fix locally
npm run db:seed

# 3. Commit and push fix
git add -A
git commit -m "fix: resolve database sequence issues"
git push
```

## 📊 Monitoring

The scripts provide detailed output for monitoring:

- **Health Check**: Shows sequence status for all tables
- **Fix Script**: Reports what was fixed
- **Verification**: Confirms sequences work correctly

## 🎉 Benefits

1. **Zero Downtime**: Catch issues before deployment
2. **Automated**: No manual sequence management needed
3. **Safe**: Multiple verification layers
4. **Transparent**: Clear reporting of sequence status
5. **Integrated**: Works with existing workflow

This comprehensive approach ensures your production deployments will never fail due to database sequence issues again!
