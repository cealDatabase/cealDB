# 🧪 Production Testing Guide: Survey Dates & Broadcast System

**Last Updated**: October 13, 2025

This guide provides step-by-step instructions for testing the Survey Dates Management and Broadcast system in production.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pre-Testing Setup](#pre-testing-setup)
3. [Test 1: Date Setting & Propagation](#test-1-date-setting--propagation)
4. [Test 2: Email Broadcast Preview](#test-2-email-broadcast-preview)
5. [Test 3: Broadcast Scheduling Verification](#test-3-broadcast-scheduling-verification) ⚠️ **CRITICAL**
6. [Test 4: Manual Form Opening (Testing Dashboard)](#test-4-manual-form-opening-testing-dashboard)
7. [Test 5: CRON Job Simulation](#test-5-cron-job-simulation)
8. [Test 6: End-to-End Workflow](#test-6-end-to-end-workflow)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What We're Testing

1. **Date Setting** (`/admin/survey-dates`)
   - Creating Library_Year records with dates
   - Date storage in database
   - Date propagation to other pages

2. **Broadcast System** (`/admin/broadcast`)
   - Session Queue detection
   - Email preview generation
   - Broadcast scheduling

3. **CRON Automation**
   - Automatic form opening on scheduled date
   - Automatic form closing on scheduled date
   - Email notifications

4. **End-to-End Flow**
   - Complete workflow from creation to closure

---

## 🔧 Pre-Testing Setup

### Requirements

- ✅ Super Admin access (Role ID 1)
- ✅ Access to production database (read-only for verification)
- ✅ Email address for test emails
- ✅ Access to Vercel Cron logs (optional but recommended)

### Test Year Selection

**IMPORTANT**: Use a test year that won't conflict with production data.

**Recommended**: Use year `2099` for testing (far future, won't conflict)

```
Test Year: 2099
Opening Date: 2099-01-01
Closing Date: 2099-01-15
```

### Safety Notes

⚠️ **DO NOT**:
- Use the current production year (e.g., 2025)
- Set dates that might trigger during business hours
- Send broadcasts to real users (use Testing Dashboard instead)

✅ **DO**:
- Use year 2099 for testing
- Use Testing Dashboard for controlled tests
- Verify all changes in database before proceeding

---

## 🧪 Test 1: Date Setting & Propagation

**Goal**: Verify that dates set in Survey Dates Management appear correctly throughout the system.

### Step 1.1: Create Test Year Records

1. **Navigate to**: `/admin/survey-dates`

2. **Fill in the form**:
   ```
   Academic Year: 2099
   Opening Date: 2099-01-01
   Closing Date: 2099-01-15
   ```

3. **Click**: "Create Forms for 2099"

4. **Expected Result**:
   ```
   ✅ Successfully opened 2099 forms!
   
   Total Libraries: 149
   New Records Created: 149 (or less if some exist)
   Existing Records Skipped: 0 (or number of existing)
   ```

### Step 1.2: Verify Database

**Option A: Using Database Tool** (Recommended)

```sql
-- Check if records were created
SELECT 
  year, 
  opening_date, 
  closing_date, 
  is_open_for_editing,
  COUNT(*) as record_count
FROM "Library_Year"
WHERE year = 2099
GROUP BY year, opening_date, closing_date, is_open_for_editing;

-- Expected Result:
-- year: 2099
-- opening_date: 2099-01-01 07:00:00 (12 AM PT converted to UTC)
-- closing_date: 2099-01-16 07:59:59 (11:59 PM PT converted to UTC)
-- is_open_for_editing: false
-- record_count: 149
```

**Option B: Using API Endpoint**

```bash
# If you have an API endpoint to check Library_Year records
curl https://your-site.com/api/admin/library-year?year=2099
```

### Step 1.3: Verify Session Queue Display

1. **Navigate to**: `/admin/broadcast`

2. **Check "Session Queue" section**

3. **Expected Result**:
   ```
   📅 Session Queue
   
   Year 2099 (Scheduled)
   Opens: Jan 1, 2099
   Closes: Jan 15, 2099
   Status: Opens in X days
   Actions: [Delete Session]
   ```

### ✅ Test 1 Pass Criteria

- [ ] 149 Library_Year records created for 2099
- [ ] opening_date = 2099-01-01 07:00:00 UTC
- [ ] closing_date = 2099-01-16 07:59:59 UTC
- [ ] is_open_for_editing = false
- [ ] Session appears in Broadcast page Session Queue
- [ ] Dates display correctly in local time

---

## 📧 Test 2: Email Broadcast Preview

**Goal**: Verify that email preview generates correctly based on scheduled session.

### Step 2.1: Load Email Preview

1. **Stay on**: `/admin/broadcast`

2. **Scroll to**: "Broadcast Email Preview" section

3. **Expected Result**:
   ```
   Scheduled Session Details:
   Year: 2099
   Opens: Jan 1, 2099, 12:00 AM (your timezone)
   Closes: Jan 15, 2099, 11:59 PM (your timezone)
   Status: Scheduled
   ```

4. **Check**: Email preview loads automatically
   - Should show HTML email template
   - Should mention year 2099
   - Should mention opening/closing dates

### Step 2.2: Verify Email Content

**Email should contain**:
- ✅ Opening date: January 1, 2099
- ✅ Closing date: January 15, 2099
- ✅ Link to survey form
- ✅ CEAL branding/logo
- ✅ Instructions for members

### Step 2.3: Proceed to Send Confirmation

1. **Click**: "Continue to Send Broadcast"

2. **On confirmation page, verify**:
   ```
   ⚠️ Confirm Broadcast Details
   
   Year: 2099
   Opening: Jan 1, 2099, 12:00 AM PT
   Closing: Jan 15, 2099, 11:59 PM PT
   ```

3. **DO NOT CLICK "Send Broadcast Now" YET**

### ✅ Test 2 Pass Criteria

- [ ] Email preview loads automatically
- [ ] Preview shows correct year (2099)
- [ ] Preview shows correct dates
- [ ] Confirmation page displays correct details
- [ ] All dates are in Pacific Time

---

## ⚠️ Test 3: Broadcast Scheduling Verification

**Goal**: CRITICAL - Verify broadcast is SCHEDULED, not sent immediately

### Why This Is Critical

The system should:
- ✅ Schedule the broadcast for the opening date
- ✅ Keep forms CLOSED until opening date
- ❌ NOT send emails immediately when clicking "Schedule Broadcast"

If emails are sent immediately, this is a **bug** that must be fixed.

### Step 3.1: Schedule the Broadcast

1. **Navigate to**: `/admin/broadcast`

2. **Verify**:
   - Session appears in Session Queue
   - Email preview loads

3. **Click**: "Continue to Send Broadcast"

4. **Review confirmation page**:
   - Should show "📅 Scheduled Automation Summary"
   - Should show "✅ What Happens Automatically"
   - Lists 4 automated events

5. **Click**: "Confirm & Schedule Broadcast"

### Step 3.2: Verify Scheduling (Not Immediate Sending)

6. **Check success message**:
   ```
   ✅ Broadcast Scheduled Successfully!
   Automated session for 2099 has been scheduled.
   Everything will happen automatically on the scheduled dates.
   ```

7. **CRITICAL**: Message should say **"scheduled"** not "sent"

8. **Check your email inbox**:
   - ✅ **You should NOT receive any email**
   - ❌ If email received → **STOP** → System has a bug

### Step 3.3: Verify Forms Stay Closed

9. **Navigate to**: `/admin/broadcast`

10. **Check "Current Form Status"**:
    ```
    Year: 2099
    Total Libraries: 149
    Open for Editing: 0       ← MUST be 0
    Closed: 149               ← MUST be 149
    ```

11. **Check Session Queue**:
    ```
    Year 2099 (Scheduled)
    Status: Opens in X days   ← Shows future status
    ```

### ✅ Test 3 Pass Criteria

- [ ] Success message says "scheduled" (NOT "sent")
- [ ] NO email received immediately
- [ ] Forms show: 0 open, 149 closed
- [ ] Session Queue shows "Scheduled" status

### ❌ If Test 3 Fails

**If you receive email immediately**:
1. Check `/app/api/admin/broadcast/route.ts`
2. Should NOT call `resend.broadcasts.create()` immediately
3. Should set `is_open_for_editing: false`
4. Redeploy and retest

**If forms open immediately**:
1. Check database: `is_open_for_editing` should be `false`
2. Check API response: status should be "scheduled"
3. Review recent code changes

---

## 🔬 Test 4: Manual Form Opening (Testing Dashboard)

**Goal**: Test CRON simulation without waiting for actual dates or sending to real users

### Step 3.1: Access Testing Dashboard

1. **Navigate to**: `/admin/testing`

2. **Expected**: Testing dashboard interface

### Step 3.2: Configure Test

1. **Fill in form**:
   ```
   Year: 2099
   Test Mode: ✅ ENABLED (check the box)
   Test Emails: your-email@example.com
   ```

2. **Important**: Make sure "Test Mode" checkbox is **CHECKED**
   - This prevents sending to real users
   - Emails only go to addresses in "Test Emails" field

### Step 3.3: Test Open Forms

1. **Click**: "Test Open Forms"

2. **Expected Result**:
   ```
   ✅ Success
   Opened 149 forms for year 2099
   Email sent to: your-email@example.com
   ```

3. **Check your email**:
   - Should receive broadcast email
   - Should mention year 2099
   - Should have opening/closing dates

### Step 3.4: Verify Forms Opened

**Check database**:

```sql
SELECT 
  COUNT(*) as open_forms,
  COUNT(CASE WHEN is_open_for_editing = true THEN 1 END) as open_count,
  COUNT(CASE WHEN is_open_for_editing = false THEN 1 END) as closed_count
FROM "Library_Year"
WHERE year = 2099;

-- Expected Result:
-- open_count: 149
-- closed_count: 0
```

**OR check via UI**:

1. Go to `/admin/broadcast`
2. Check "Current Form Status"
3. Should show:
   ```
   Year: 2099
   Total Libraries: 149
   Open for Editing: 149
   Closed: 0
   ```

### Step 3.5: Test Close Forms

1. **Still on**: `/admin/testing`

2. **Click**: "Test Close Forms"

3. **Expected Result**:
   ```
   ✅ Success
   Closed 149 forms for year 2099
   ```

4. **Verify**:
   ```sql
   SELECT COUNT(*) as closed_forms
   FROM "Library_Year"
   WHERE year = 2099 AND is_open_for_editing = false;
   
   -- Expected: 149
   ```

### ✅ Test 3 Pass Criteria

- [ ] Testing Dashboard accessible
- [ ] Test Mode checkbox works
- [ ] "Test Open Forms" opens all 149 forms
- [ ] Email received with correct content
- [ ] "Test Close Forms" closes all 149 forms
- [ ] No emails sent to real users (only test email)

---

## ⏰ Test 5: CRON Job Simulation

**Goal**: Test CRON automation without waiting for actual dates.

### Background: How CRON Works

The system has a CRON job that runs every hour:

```typescript
// Checks every hour for:
1. Sessions that should open (opening_date <= now)
2. Sessions that should close (closing_date <= now)
```

### Option A: Using Testing Dashboard (Recommended)

**This is the safest method** - already tested in Test 3 above.

The Testing Dashboard's "Test Open Forms" and "Test Close Forms" buttons simulate exactly what the CRON job does, but triggered manually.

✅ **This method is sufficient** for testing CRON functionality.

### Option B: Set Near-Future Dates (Advanced)

⚠️ **Use with caution** - Only if you want to test actual CRON triggering.

1. **Set dates 2 hours in the future**:
   ```
   Opening Date: Today + 2 hours
   Closing Date: Today + 3 hours
   ```

2. **Create records** via Survey Dates Management

3. **Wait for CRON to run** (runs every hour on Vercel)

4. **Monitor**:
   - Check Vercel CRON logs
   - Check database for changes
   - Check email inbox

5. **Expected**:
   - After 2 hours: Forms open, broadcast sent
   - After 3 hours: Forms close, confirmation sent

### Option C: Trigger CRON Manually (If Available)

If you have access to trigger Vercel CRON manually:

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. Find the "open-forms" cron
3. Click "Trigger" to run immediately
4. Verify results

### ✅ Test 4 Pass Criteria

**If using Option A (Testing Dashboard)**:
- [ ] Already verified in Test 3 ✅

**If using Option B (Near-Future Dates)**:
- [ ] CRON opens forms at scheduled time
- [ ] Broadcast email sent on opening
- [ ] CRON closes forms at scheduled time
- [ ] Confirmation email sent on closing

---

## 🔄 Test 6: End-to-End Workflow

**Goal**: Complete walkthrough of entire process from creation to closure.

### Timeline

```
Day 1: Create & Schedule
Day 2: Open Forms (manual test)
Day 3: Close Forms (manual test)
Day 4: Cleanup
```

### Day 1: Create & Schedule

**Step 1**: Create year records
- Go to `/admin/survey-dates`
- Year: 2099
- Opening: 2099-01-01
- Closing: 2099-01-15
- Click "Create Forms for 2099"

**Step 2**: Verify in Session Queue
- Go to `/admin/broadcast`
- Confirm session appears

**Step 3**: Preview Email
- Still on `/admin/broadcast`
- Verify email preview loads

**Step 4**: Send Broadcast (optional)
- Click "Continue to Send Broadcast"
- Click "Send Broadcast Now"
- ⚠️ This schedules the broadcast but won't send until opening date

### Day 2: Open Forms (Manual Trigger)

**Step 1**: Use Testing Dashboard
- Go to `/admin/testing`
- Year: 2099
- Test Mode: ✅ Enabled
- Test Emails: your-email@example.com
- Click "Test Open Forms"

**Step 2**: Verify Results
- Check email inbox (should receive broadcast)
- Check `/admin/broadcast` (Current Form Status should show 149 open)
- Check database:
  ```sql
  SELECT is_open_for_editing, COUNT(*)
  FROM "Library_Year"
  WHERE year = 2099
  GROUP BY is_open_for_editing;
  ```

### Day 3: Close Forms (Manual Trigger)

**Step 1**: Use Testing Dashboard
- Go to `/admin/testing`
- Click "Test Close Forms"

**Step 2**: Verify Results
- Check `/admin/broadcast` (Current Form Status should show 149 closed)
- Check database (all should be is_open_for_editing = false)

### Day 4: Cleanup

**Step 1**: Delete Test Session
- Go to `/admin/broadcast`
- In Session Queue, click "Delete Session" for year 2099

**Step 2**: Verify Deletion
- Session removed from queue
- Database records deleted:
  ```sql
  SELECT COUNT(*) FROM "Library_Year" WHERE year = 2099;
  -- Should be 0
  ```

### ✅ Test 5 Pass Criteria

- [ ] Complete workflow executed successfully
- [ ] Dates propagate correctly
- [ ] Forms open when triggered
- [ ] Emails sent correctly
- [ ] Forms close when triggered
- [ ] Cleanup works properly

---

## 🚨 Troubleshooting

### Issue 1: Session Queue Empty

**Problem**: No session appears in Broadcast page

**Solutions**:
1. Verify records exist:
   ```sql
   SELECT * FROM "Library_Year" WHERE year = 2099 LIMIT 5;
   ```

2. Check if session was deleted

3. Recreate records via Survey Dates Management

---

### Issue 2: Email Preview Not Loading

**Problem**: Email preview section shows "Loading..." forever

**Solutions**:
1. Check browser console for errors
2. Verify scheduled session exists
3. Try refreshing the page
4. Check API endpoint: `/api/admin/broadcast/preview`

---

### Issue 3: Forms Not Opening

**Problem**: "Test Open Forms" doesn't work

**Solutions**:
1. Verify year is correct
2. Check database connection
3. Verify records exist and are closed:
   ```sql
   SELECT is_open_for_editing, COUNT(*)
   FROM "Library_Year"
   WHERE year = 2099
   GROUP BY is_open_for_editing;
   ```

4. Check server logs for errors

---

### Issue 4: No Email Received

**Problem**: Broadcast email not received

**Solutions**:
1. Check spam folder
2. Verify "Test Mode" is enabled in Testing Dashboard
3. Verify email address is correct
4. Check Resend dashboard for email status
5. Check server logs for email sending errors

---

### Issue 5: CRON Not Triggering

**Problem**: Forms don't open/close at scheduled time

**Solutions**:
1. Check Vercel CRON logs:
   - Go to Vercel Dashboard
   - Project → Deployments → Functions
   - Look for CRON execution logs

2. Verify CRON job is configured:
   - Check `vercel.json` for cron configuration
   - Ensure `/api/cron/open-forms` exists

3. Check date/time:
   - Verify dates are in the past (for opening)
   - Account for UTC vs Pacific Time conversion

4. Manual trigger using Testing Dashboard instead

---

## 📊 Testing Checklist

### Pre-Testing
- [ ] Super Admin access confirmed
- [ ] Test year selected (2099)
- [ ] Test email address ready

### Test 1: Date Setting
- [ ] Create 2099 records via Survey Dates Management
- [ ] Verify 149 records created in database
- [ ] Confirm dates stored correctly (UTC)
- [ ] Session appears in Broadcast page

### Test 2: Email Preview
- [ ] Email preview loads automatically
- [ ] Correct year displayed
- [ ] Correct dates displayed
- [ ] Confirmation page accurate

### Test 3: Broadcast Scheduling ⚠️ CRITICAL
- [ ] Click "Schedule Broadcast" shows success
- [ ] Message says "scheduled" (NOT "sent")
- [ ] NO email received immediately
- [ ] Forms show 0 open, 149 closed
- [ ] Session shows "Scheduled" status

### Test 4: Manual Testing
- [ ] Testing Dashboard accessible
- [ ] Test Mode works
- [ ] Forms open manually
- [ ] Email received
- [ ] Forms close manually

### Test 5: CRON Simulation
- [ ] Testing Dashboard simulates CRON (Option A)
- OR
- [ ] CRON triggers at scheduled time (Option B)

### Test 6: End-to-End
- [ ] Complete workflow executed
- [ ] All steps verified
- [ ] Cleanup successful

---

## 🎯 Success Criteria

Your system is working correctly if:

✅ **Date Management**
- Survey Dates Management creates records with correct dates
- Dates propagate to Broadcast page Session Queue
- Dates stored correctly in UTC in database

✅ **Broadcasting**
- Email preview generates based on scheduled session
- Broadcast can be scheduled
- Test emails send correctly

✅ **Automation**
- Testing Dashboard can manually trigger open/close
- Forms open when triggered
- Forms close when triggered
- Emails sent on appropriate events

✅ **Data Integrity**
- Records can be created
- Records can be opened/closed
- Records can be deleted
- No production data affected

---

## 📝 Test Log Template

Use this to track your testing:

```
Date: _______________
Tester: _______________
Environment: Production

Test 1: Date Setting & Propagation
- Status: ⬜ Pass ⬜ Fail
- Notes: _________________________________

Test 2: Email Broadcast Preview
- Status: ⬜ Pass ⬜ Fail
- Notes: _________________________________

Test 3: Manual Form Opening
- Status: ⬜ Pass ⬜ Fail
- Notes: _________________________________

Test 4: CRON Job Simulation
- Status: ⬜ Pass ⬜ Fail
- Notes: _________________________________

Test 5: End-to-End Workflow
- Status: ⬜ Pass ⬜ Fail
- Notes: _________________________________

Overall Result: ⬜ All Tests Passed ⬜ Issues Found
```

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Document Results**
   - Record test outcomes
   - Note any issues found
   - Document any fixes applied

2. **Schedule Real Production Use**
   - Set actual year (e.g., 2026)
   - Set real opening/closing dates
   - Verify CRON is configured for production

3. **Monitor First Real Deployment**
   - Watch CRON logs on opening date
   - Verify emails sent correctly
   - Check for any user-reported issues

4. **Create Runbook**
   - Document common operations
   - Emergency procedures
   - Contact information

---

## 📞 Support

If you encounter issues during testing:

1. Check this guide's Troubleshooting section
2. Review server logs
3. Check Vercel/Resend dashboards
4. Consult database directly
5. Review code in:
   - `/api/admin/open-new-year/route.ts`
   - `/api/admin/broadcast/route.ts`
   - `/api/cron/open-forms/route.ts`

---

**Happy Testing! 🧪**
