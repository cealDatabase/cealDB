# 📅 Broadcast Scheduling Verification Guide

**IMPORTANT**: The broadcast system has been updated to SCHEDULE broadcasts, not send them immediately.

---

## 🎯 Key Behavior Change

### ❌ OLD Behavior (Before Update)
```
Click "Send Broadcast" → Broadcast sent immediately to all users
                      → Forms open immediately
```

### ✅ NEW Behavior (After Update)
```
Click "Send Broadcast" → Session scheduled in database
                      → Forms remain CLOSED
                      → CRON job will:
                          1. Open forms on opening_date
                          2. Send broadcast email on opening_date
                          3. Close forms on closing_date
```

---

## 🔍 How to Verify Scheduling Works

### Test 1: Verify Broadcast is NOT Sent Immediately

**Goal**: Confirm clicking "Send Broadcast" does NOT send emails right away

**Steps**:

1. **Create test session**:
   - Go to `/admin/survey-dates`
   - Year: `2099`
   - Opening: `2099-01-01` (far future)
   - Closing: `2099-01-15`
   - Click "Create Forms for 2099"

2. **Schedule broadcast**:
   - Go to `/admin/broadcast`
   - Click "Continue to Send Broadcast"
   - Click "Confirm & Schedule Broadcast"

3. **Verify success message**:
   ```
   ✅ Expected message:
   "Session scheduled for year 2099. Forms will automatically 
   open and broadcast will be sent on [date] at 12:00 AM 
   Pacific Time. 149 libraries scheduled."
   ```

4. **Check your email inbox**:
   - ✅ **Should NOT receive** any broadcast email yet
   - ❌ If you receive email → System is still sending immediately (bug)

5. **Check database**:
   ```sql
   SELECT is_open_for_editing, COUNT(*) 
   FROM "Library_Year" 
   WHERE year = 2099 
   GROUP BY is_open_for_editing;
   
   -- Expected Result:
   -- is_open_for_editing: false
   -- count: 149
   
   -- ✅ Forms should be CLOSED (false), not open (true)
   ```

### ✅ Test 1 Pass Criteria

- [ ] Success message says "scheduled" (not "sent")
- [ ] NO email received immediately
- [ ] Database shows is_open_for_editing = **false**
- [ ] No emails sent to real users

---

### Test 2: Verify CRON Will Send Broadcast

**Goal**: Confirm CRON job will send broadcast at scheduled time

**Option A: Use Testing Dashboard** (Recommended)

The Testing Dashboard simulates EXACTLY what CRON does:

1. **Go to**: `/admin/testing`
2. **Configure**:
   - Year: `2099`
   - Test Mode: ✅ **ENABLED**
   - Test Emails: `your-email@example.com`
3. **Click**: "Test Open Forms"

4. **Verify results**:
   - ✅ Forms open (is_open_for_editing = true)
   - ✅ Email received at your test address
   - ✅ Email contains year 2099 and dates

**This proves**: If Testing Dashboard works → CRON will work ✅

**Option B: Near-Future Test** (Advanced)

⚠️ Only if you want to test actual CRON triggering:

1. **Create session with opening date 2 hours in future**:
   ```
   Today: Oct 13, 2025, 10:00 PM
   Opening: Oct 13, 2025, 12:01 AM (2 hours from now)
   Closing: Oct 14, 2025, 12:00 AM
   ```

2. **Schedule broadcast** via Broadcast page

3. **Wait for CRON to run** (runs every hour)

4. **After 2 hours, verify**:
   - Forms opened
   - Email sent to all users
   - Check Vercel CRON logs

### ✅ Test 2 Pass Criteria

**Option A (Testing Dashboard)**:
- [ ] Forms open when triggered
- [ ] Email received
- [ ] Email content correct

**Option B (CRON)**:
- [ ] CRON runs at scheduled time
- [ ] Forms open automatically
- [ ] Broadcast sent automatically

---

### Test 3: Verify Forms Remain Closed Until Opening Date

**Goal**: Confirm forms don't open prematurely

**Steps**:

1. **After scheduling** (Test 1 completed)

2. **Check form status**:
   - Go to `/admin/broadcast`
   - Look at "Current Form Status"

3. **Verify**:
   ```
   Year: 2099
   Total Libraries: 149
   Open for Editing: 0      ✅ Should be ZERO
   Closed: 149              ✅ Should be 149
   ```

4. **Check Session Queue**:
   ```
   Year 2099 (Scheduled)
   Opens: Jan 1, 2099
   Closes: Jan 15, 2099
   Status: Opens in X days  ✅ Should show "Opens in..."
   ```

### ✅ Test 3 Pass Criteria

- [ ] Current Form Status shows 0 open, 149 closed
- [ ] Session Queue shows "Scheduled" status
- [ ] No forms accessible for editing

---

## 📊 Complete Verification Workflow

### Step-by-Step Verification

```
1. Create Session (Survey Dates Management)
   ├─ Year: 2099
   ├─ Opening: 2099-01-01
   └─ Closing: 2099-01-15
   
2. Schedule Broadcast (Broadcast Page)
   ├─ Preview email
   ├─ Click "Schedule Broadcast"
   └─ ✅ Verify: Message says "scheduled"
   
3. Verify Forms Closed (Broadcast Page)
   ├─ Current Form Status: 0 open, 149 closed
   └─ ✅ Pass: Forms are CLOSED
   
4. Verify No Email Sent (Email Inbox)
   ├─ Check inbox
   └─ ✅ Pass: NO email received
   
5. Test CRON Simulation (Testing Dashboard)
   ├─ Test Mode: ✅ Enabled
   ├─ Click "Test Open Forms"
   ├─ ✅ Forms open
   └─ ✅ Email received
   
6. Cleanup (Broadcast Page)
   └─ Delete session for year 2099
```

---

## 🔬 Technical Verification

### Check API Response

When you click "Schedule Broadcast", check browser console:

**Expected response**:
```json
{
  "success": true,
  "year": 2099,
  "opening_date": "2099-01-01T07:00:00.000Z",
  "closing_date": "2099-01-16T07:59:59.000Z",
  "broadcast": {
    "id": "scheduled-by-cron",
    "status": "scheduled"         ← ✅ Should say "scheduled"
  },
  "librariesScheduled": 149,      ← ✅ "Scheduled", not "Opened"
  "message": "Session scheduled for year 2099..."
}
```

**Red flags** (indicates bug):
```json
{
  "broadcast": {
    "status": "sent"              ← ❌ Should NOT say "sent"
  },
  "librariesOpened": 149,         ← ❌ Should NOT say "Opened"
  "message": "Forms opened..."    ← ❌ Should NOT say "opened"
}
```

### Check Database State

**After scheduling** (before CRON runs):

```sql
-- Check forms are CLOSED
SELECT 
  year,
  opening_date,
  closing_date,
  is_open_for_editing,
  COUNT(*) as count
FROM "Library_Year"
WHERE year = 2099
GROUP BY year, opening_date, closing_date, is_open_for_editing;

-- Expected Result:
-- year: 2099
-- opening_date: 2099-01-01 07:00:00 (UTC)
-- closing_date: 2099-01-16 07:59:59 (UTC)
-- is_open_for_editing: false  ✅ MUST be false
-- count: 149
```

**After CRON runs** (or Testing Dashboard):

```sql
-- Check forms are OPEN
SELECT is_open_for_editing, COUNT(*)
FROM "Library_Year"
WHERE year = 2099
GROUP BY is_open_for_editing;

-- Expected Result:
-- is_open_for_editing: true   ✅ Changed to true
-- count: 149
```

---

## 🚨 Troubleshooting

### Issue: Broadcast Sent Immediately

**Symptom**: Email received right after clicking "Schedule Broadcast"

**Cause**: Old API code still active

**Solution**: 
1. Verify `/app/api/admin/broadcast/route.ts` has latest code
2. Check line ~196: Should NOT call `resend.broadcasts.create()` immediately
3. Should have comment: "Skip creating broadcast here - let CRON handle it"
4. Redeploy to Vercel

---

### Issue: Forms Open Immediately

**Symptom**: Database shows is_open_for_editing = true after scheduling

**Cause**: API setting forms to open instead of closed

**Solution**:
1. Check `/app/api/admin/broadcast/route.ts` line ~211
2. Should say: `is_open_for_editing: false`
3. Should have comment: "Keep CLOSED until CRON opens them"
4. Redeploy to Vercel

---

### Issue: CRON Not Sending Broadcast

**Symptom**: CRON opens forms but doesn't send email

**Cause**: CRON job missing email sending code

**Solution**:
1. Check `/app/api/cron/open-forms/route.ts`
2. Verify it has Resend email sending logic
3. Check RESEND_API_KEY and RESEND_BROADCAST_LIST_ID env vars
4. Check Vercel CRON logs for errors

---

## 📅 Timeline Comparison

### Development/Testing Timeline
```
00:00 → Create session (2099-01-01 to 2099-01-15)
00:01 → Schedule broadcast via Broadcast page
00:01 → ✅ Forms CLOSED, NO email sent
00:02 → Test CRON via Testing Dashboard
00:02 → ✅ Forms open, Email received
00:03 → Delete test session
```

### Production Timeline
```
Day 1    → Create session (2026-10-01 to 2026-12-02)
Day 1    → Schedule broadcast via Broadcast page
Day 1    → ✅ Forms CLOSED, NO email sent yet
         → Wait for opening date...
Oct 1    → CRON runs at 12:00 AM PT
Oct 1    → ✅ Forms open automatically
Oct 1    → ✅ Broadcast sent to all members
         → Forms available for data entry...
Dec 2    → CRON runs at 11:59 PM PT
Dec 2    → ✅ Forms close automatically
Dec 2    → ✅ Confirmation email to admins
```

---

## ✅ Verification Checklist

### Before CRON (Scheduled State)
- [ ] Clicked "Schedule Broadcast" shows success
- [ ] Message says "scheduled" (not "sent")
- [ ] NO email received immediately
- [ ] Database: is_open_for_editing = false
- [ ] Current Form Status: 0 open, 149 closed
- [ ] Session Queue shows "Scheduled"

### After CRON (Or Testing Dashboard)
- [ ] Forms opened (is_open_for_editing = true)
- [ ] Email received with correct content
- [ ] Current Form Status: 149 open, 0 closed
- [ ] Members can access forms

### System Behavior
- [ ] Testing Dashboard can trigger opening
- [ ] Email preview loads correctly
- [ ] Can delete scheduled sessions
- [ ] No emails to real users during testing

---

## 🎯 Key Differences Summary

| Action | Old Behavior | New Behavior |
|--------|--------------|--------------|
| Click "Schedule Broadcast" | Sends email immediately | Only schedules in database |
| Forms Status | Opens immediately | Remains CLOSED |
| Broadcast Email | Sent right away | Sent by CRON on opening_date |
| Button Label | "Send Broadcast Now" | "Confirm & Schedule Broadcast" |
| Success Message | "Forms opened" | "Session scheduled" |
| API Response | status: "sent" | status: "scheduled" |
| Database | is_open = true | is_open = false |

---

## 📝 Testing Log Template

Use this to document your verification:

```
Date: _______________
Tester: _______________
Environment: Production

Verification Results:

Test 1: Broadcast NOT Sent Immediately
- Scheduled session: ⬜ Pass ⬜ Fail
- No email received: ⬜ Pass ⬜ Fail
- Forms remain closed: ⬜ Pass ⬜ Fail
- Notes: _________________________________

Test 2: CRON Simulation Works
- Testing Dashboard opens forms: ⬜ Pass ⬜ Fail
- Email received: ⬜ Pass ⬜ Fail
- Email content correct: ⬜ Pass ⬜ Fail
- Notes: _________________________________

Test 3: Forms Stay Closed
- Current status shows 0 open: ⬜ Pass ⬜ Fail
- Session shows "Scheduled": ⬜ Pass ⬜ Fail
- Notes: _________________________________

Overall Result: ⬜ All Tests Passed ⬜ Issues Found
Issues: _________________________________
```

---

## 🚀 Production Readiness

Your system is ready for production if:

✅ **Scheduling Works**
- Broadcast is scheduled, not sent immediately
- Forms remain closed until CRON runs
- Success message confirms scheduling

✅ **CRON Simulation Works**
- Testing Dashboard can open forms
- Testing Dashboard sends test emails
- Email content is accurate

✅ **No Premature Actions**
- No emails sent when scheduling
- Forms stay closed until opening date
- Database state is correct

---

**All verifications passed?** → System is correctly scheduling broadcasts! 🎉

**For detailed testing steps, see**: `STEP_BY_STEP_TESTING.md`
