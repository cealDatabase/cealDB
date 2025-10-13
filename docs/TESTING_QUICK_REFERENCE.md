# Testing Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### 1. Access Dashboard
```
URL: https://your-domain.vercel.app/admin/testing
Login: Super Admin account
```

### 2. Configure Test
```
Year: 2025
Test Mode: ✅ ENABLED
Test Emails: your-email@example.com
```

### 3. Run Test
Click: "Test Open Forms" or "Test Close Forms"

### 4. Verify
- ✅ Check email inbox
- ✅ Check `/admin/broadcast` page
- ✅ Check Vercel logs

---

## 📍 Key URLs

| Page | URL | Purpose |
|------|-----|---------|
| Testing Dashboard | `/admin/testing` | Run manual tests |
| Form Management | `/admin/broadcast` | View form status |
| Admin Home | `/admin` | Main admin page |
| Vercel Logs | `vercel.com → Project → Logs` | View execution logs |

---

## 🧪 Test Commands

### Test Opening Forms
```typescript
POST /api/admin/test-cron
{
  "action": "open",
  "year": 2025,
  "userRoles": ["1"],
  "testMode": true,
  "testEmails": ["test@example.com"]
}
```

### Test Closing Forms
```typescript
POST /api/admin/test-cron
{
  "action": "close",
  "year": 2025,
  "userRoles": ["1"],
  "testMode": true,
  "testEmails": ["test@example.com"]
}
```

---

## 🔍 Verification Checklist

### After Opening Test
- [ ] Email received: "Forms Now Open for 2025"
- [ ] `/admin/broadcast` shows: Open for Editing: 149
- [ ] Database query shows: `is_open_for_editing = true`
- [ ] Vercel logs show: "✅ Opened 149 libraries"
- [ ] AuditLog has: `TEST_OPEN_FORMS` entry

### After Closing Test
- [ ] Email received: "Forms Closed for 2025"
- [ ] Admin email: "Forms Closed Confirmation"
- [ ] `/admin/broadcast` shows: Closed: 149
- [ ] Database query shows: `is_open_for_editing = false`
- [ ] Vercel logs show: "✅ VERIFIED: All 149 forms are closed"
- [ ] AuditLog has: `TEST_CLOSE_FORMS` entry

---

## 🗄️ Database Quick Queries

### Check Form Status
```sql
SELECT year, is_open_for_editing, COUNT(*) 
FROM "Library_Year" 
WHERE year = 2025 
GROUP BY year, is_open_for_editing;
```

### Check Recent Tests
```sql
SELECT action, table_name, new_values, created_at 
FROM "AuditLog" 
WHERE action LIKE 'TEST%' 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check Session Schedule
```sql
SELECT year, opening_date, closing_date, is_open_for_editing 
FROM "Library_Year" 
WHERE year = 2025 AND opening_date IS NOT NULL 
LIMIT 1;
```

---

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| "Unauthorized" | Sign in as Super Admin (Role 1) |
| No emails | Check spam folder, verify RESEND_API_KEY |
| "No records found" | Create Library_Year records first |
| Forms not changing | Check database connection, verify year |

---

## 📧 Email Subjects to Expect

### For Users
- ✉️ "CEAL Database Forms Now Open for 2025"
- ✉️ "CEAL Database Forms Closed for 2025"

### For Super Admins
- ✉️ "Forms Opened - Year 2025" (stats)
- ✉️ "Forms Closed Confirmation - Year 2025" (verified)

---

## 🎯 Test Scenarios

### Scenario 1: Quick Test (2 min)
1. Go to `/admin/testing`
2. Set year: 2025
3. Test Mode: ✅
4. Test Email: your-email@example.com
5. Click "Test Open Forms"
6. Check email

### Scenario 2: Full Cycle (10 min)
1. Open forms (test)
2. Verify opening
3. Close forms (test)
4. Verify closing
5. Check all verification points

### Scenario 3: Multiple Recipients (5 min)
1. Add 3 test emails
2. Test open forms
3. Verify all 3 received email
4. Check Vercel logs for count

---

## 🔐 Safety Rules

1. ✅ **Always enable Test Mode first**
2. ✅ **Use test emails for initial tests**
3. ✅ **Check Vercel logs after each test**
4. ✅ **Verify database changes**
5. ❌ **Never disable Test Mode without confirmation**

---

## 📊 Success Indicators

### Good Test Result
```
✅ Test Completed Successfully
Records Updated: 149
Emails Sent: 4
Errors: 0
Duration: 2.3s
```

### Failed Test Result
```
❌ Test Failed
Error: No Library_Year records found for year 2025
Solution: Create records first via "Open Forms for New Year"
```

---

## 🛠️ Troubleshooting One-Liners

```bash
# Check if records exist
SELECT COUNT(*) FROM "Library_Year" WHERE year = 2025;

# Check current status
SELECT is_open_for_editing, COUNT(*) FROM "Library_Year" WHERE year = 2025 GROUP BY is_open_for_editing;

# Check last audit log
SELECT * FROM "AuditLog" ORDER BY created_at DESC LIMIT 1;

# Force open all forms
UPDATE "Library_Year" SET is_open_for_editing = true WHERE year = 2025;

# Force close all forms
UPDATE "Library_Year" SET is_open_for_editing = false WHERE year = 2025;
```

---

## 📱 Mobile Quick Access

Can't access full dashboard? Use curl:

```bash
# Test opening
curl -X POST https://your-domain.vercel.app/api/admin/test-cron \
  -H "Content-Type: application/json" \
  -d '{
    "action": "open",
    "year": 2025,
    "userRoles": ["1"],
    "testMode": true,
    "testEmails": ["test@example.com"]
  }'

# Test closing
curl -X POST https://your-domain.vercel.app/api/admin/test-cron \
  -H "Content-Type: application/json" \
  -d '{
    "action": "close",
    "year": 2025,
    "userRoles": ["1"],
    "testMode": true,
    "testEmails": ["test@example.com"]
  }'
```

---

## ⏱️ Time Estimates

- **Setup**: 2 min
- **Single Test**: 1 min
- **Verification**: 2 min
- **Full Cycle**: 10 min
- **Complete Testing Suite**: 20-30 min

---

## 🎓 Pro Tips

1. Keep a test email dedicated to testing
2. Bookmark `/admin/testing` for quick access
3. Check Vercel logs in separate tab
4. Document successful test configurations
5. Test during low-traffic times
6. Always verify in multiple ways

---

## 📞 Emergency Actions

### Accidentally Sent to All Users?
```
1. Don't panic - email is already sent
2. Send follow-up apology email if needed
3. Check AuditLog for what was sent
4. Document incident for future
```

### Forms Stuck Open?
```
1. Go to /admin/broadcast
2. Click "Close All Forms"
3. Verify in database
4. Or use SQL: UPDATE "Library_Year" SET is_open_for_editing = false WHERE year = 2025;
```

### Forms Stuck Closed?
```
1. Use Testing Dashboard
2. Test Open Forms
3. Or go to /admin/broadcast
4. Manually open if needed
```

---

## ✅ Pre-Production Checklist

Before going live:
- [ ] Tested opening with test emails
- [ ] Tested closing with test emails
- [ ] Verified all emails received
- [ ] Checked Vercel logs
- [ ] Confirmed database changes
- [ ] Tested with multiple recipients
- [ ] Verified super admin emails
- [ ] Documented test results
- [ ] All tests passed
- [ ] Ready for production!

---

**Remember**: Test Mode = Safety. Always test with test emails first! 🛡️
