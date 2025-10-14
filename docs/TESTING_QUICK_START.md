# ⚡ Quick Start Testing Guide

**TLDR: How to test Survey Dates & Broadcast in 15 minutes**

---

## 🎯 Quick Setup

**Use Test Year**: `2099` (won't conflict with production)

**Your Email**: `your-email@example.com` (replace with your actual email)

---

## ✅ 5-Minute Test (Minimum)

### Step 1: Create Test Records (2 min)

1. Go to: **`/admin/survey-dates`**
2. Enter:
   - Year: `2099`
   - Opening: `2099-01-01`
   - Closing: `2099-01-15`
3. Click: **"Create Forms for 2099"**
4. ✅ Should see: "Successfully opened 2099 forms! (149 records)"

---

### Step 2: Verify Session Queue (1 min)

1. Go to: **`/admin/broadcast`**
2. Check **"Session Queue"** section
3. ✅ Should see:
   ```
   Year 2099 (Scheduled)
   Opens: Jan 1, 2099
   Closes: Jan 15, 2099
   ```

---

### Step 3: Test Email Preview (1 min)

1. Still on: **`/admin/broadcast`**
2. Scroll to **"Broadcast Email Preview"**
3. ✅ Should see:
   - Email preview loads automatically
   - Shows year 2099
   - Shows opening/closing dates

---

### Step 4: Test Form Opening (1 min)

1. Go to: **`/admin/testing`**
2. Enter:
   - Year: `2099`
   - Test Mode: ✅ **CHECK THE BOX**
   - Test Emails: `your-email@example.com`
3. Click: **"Test Open Forms"**
4. ✅ Should see: "Opened 149 forms"
5. ✅ Check email: Should receive broadcast email

---

### Step 5: Verify & Cleanup (1 min)

1. Go back to: **`/admin/broadcast`**
2. Check **"Current Form Status"**:
   - ✅ Should show 149 forms open
3. Go to **"Session Queue"**
4. Click: **"Delete Session"** for year 2099
5. ✅ Session removed, test complete!

---

## ⚠️ IMPORTANT: Broadcast Scheduling Behavior

**The system SCHEDULES broadcasts** - it does NOT send them immediately!

- ✅ When you click "Schedule Broadcast": Session is scheduled in database
- ✅ Forms remain CLOSED until opening date
- ✅ CRON job will open forms AND send broadcast on opening date
- ❌ NO email sent immediately when scheduling

---

## 📋 Full Test Checklist

### Test 1: Date Setting ✅
```
1. /admin/survey-dates
2. Year: 2099, Opening: 2099-01-01, Closing: 2099-01-15
3. Click "Create Forms for 2099"
4. Verify: 149 records created

✅ Pass if: Session appears in /admin/broadcast
```

### Test 2: Broadcast Scheduling ✅
```
1. /admin/broadcast
2. Preview email (loads automatically)
3. Click "Continue to Send Broadcast"
4. Click "Confirm & Schedule Broadcast"
5. Verify: Message says "scheduled" (NOT "sent")
6. Check email: Should NOT receive anything yet

✅ Pass if: No email received, forms stay closed
✅ This is CORRECT behavior - CRON will send later
```

### Test 3: Verify Forms Stay Closed ✅
```
1. Go to /admin/broadcast
2. Check "Current Form Status"
3. Verify: 0 open, 149 closed

✅ Pass if: Forms are CLOSED (scheduled, not sent)
```

### Test 4: CRON Simulation (Testing Dashboard) ✅
```
1. /admin/testing
2. Year: 2099, Test Mode: ✅ ON, Email: yours
3. Click "Test Open Forms"
4. Check email inbox

✅ Pass if: Forms open + email received
✅ This simulates what CRON will do on opening date
```

### Test 5: Manual Close ✅
```
1. /admin/testing
2. Click "Test Close Forms"
3. Check /admin/broadcast → Current Form Status

✅ Pass if: Shows 149 closed
```

### Test 6: Cleanup ✅
```
1. /admin/broadcast → Session Queue
2. Click "Delete Session" for 2099
3. Verify session removed

✅ Pass if: No more 2099 session
```

---

## 🔍 Quick Verification Queries

### Check if records exist:
```sql
SELECT COUNT(*) FROM "Library_Year" WHERE year = 2099;
-- Should be 149
```

### Check if forms are open:
```sql
SELECT 
  is_open_for_editing,
  COUNT(*) as count
FROM "Library_Year" 
WHERE year = 2099
GROUP BY is_open_for_editing;
```

### Check dates:
```sql
SELECT 
  opening_date,
  closing_date,
  is_open_for_editing
FROM "Library_Year"
WHERE year = 2099
LIMIT 1;
```

---

## 🚨 Common Issues

### "No session found"
➡️ Create records first via `/admin/survey-dates`

### "Email not received"
➡️ Check Test Mode is ✅ ENABLED
➡️ Check spam folder

### "Forms won't open"
➡️ Verify year 2099 exists in database
➡️ Check browser console for errors

---

## 🎬 Testing Order

**Recommended order**:

```
1. Survey Dates Management → Create records
   ↓
2. Broadcast Page → Verify session appears
   ↓
3. Broadcast Page → Check email preview
   ↓
4. Testing Dashboard → Test open forms
   ↓
5. Testing Dashboard → Test close forms
   ↓
6. Broadcast Page → Delete test session
```

---

## 💡 Pro Tips

✅ **DO**:
- Always use year 2099 for testing
- Always enable Test Mode
- Always delete test sessions after testing

❌ **DON'T**:
- Use current year (2025, 2026, etc.)
- Forget to check Test Mode
- Leave test data in production

---

## 📊 Expected Results Summary

| Action | Expected Result |
|--------|----------------|
| Create Forms | 149 records created |
| Session Queue | Shows year 2099 |
| Email Preview | Loads automatically |
| Test Open | Forms open + email sent |
| Test Close | Forms close |
| Delete Session | Session removed |

---

## 🎯 Success Criteria

Your system works if:

✅ Can create 2099 records via Survey Dates Management  
✅ Session appears in Broadcast page  
✅ Email preview loads automatically  
✅ Testing Dashboard can open/close forms  
✅ Email received when forms open  
✅ Can delete test session cleanly  

---

## 🔍 Critical Understanding

### Broadcast is SCHEDULED, not sent immediately

**When you click "Schedule Broadcast"**:
- ❌ Does NOT send email right away
- ❌ Does NOT open forms right away
- ✅ Only saves schedule to database
- ✅ CRON will handle everything on opening date

**Testing Dashboard simulates CRON**:
- Same code as CRON job
- If it works → CRON will work ✅
- Safe to test without waiting for dates

---

## 🚀 Ready for Production?

If all tests pass:

1. ✅ System is working correctly
2. ✅ Broadcast schedules properly (doesn't send immediately)
3. ✅ Forms stay closed until CRON runs
4. ✅ Testing Dashboard simulates CRON successfully
5. ✅ Safe to use with real years

**Next**: Set real year (e.g., 2026) with real dates

**See also**: `BROADCAST_SCHEDULING_VERIFICATION.md` for detailed verification

---

## 📞 Need More Details?

See: `PRODUCTION_TESTING_GUIDE.md` for comprehensive instructions

---

**Total Testing Time**: ~15 minutes  
**Last Updated**: October 13, 2025
