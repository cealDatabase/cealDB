# Super Admin Testing Guide

## Overview

This guide explains how to test the Super Admin Toolkit functions on your Vercel production server **without waiting** for scheduled cron jobs.

## 🎯 What Can Be Tested

1. **Open Forms for New Year** - Opens all forms for a specific year
2. **Close Forms** - Closes all forms and sends verified confirmation
3. **Broadcast Notifications** - Test email delivery to users
4. **Survey Dates Management** - Verify scheduling system

## 🚀 Quick Start

### Step 1: Access Testing Dashboard

1. Deploy your code to Vercel
2. Sign in as Super Admin
3. Navigate to: **`https://your-domain.com/admin/testing`**

### Step 2: Configure Test

**Required Settings:**
- **Academic Year**: Enter the year to test (e.g., 2025)
- **Test Mode**: ✅ **Keep this ENABLED** (recommended)
- **Test Emails**: Add your test email addresses

**Example Test Emails:**
```
your-email@example.com, colleague@example.com
```

### Step 3: Run Test

Click either:
- **Test Open Forms** - Opens forms and sends broadcast
- **Test Close Forms** - Closes forms and sends confirmation

### Step 4: Verify Results

Check the results panel that appears on the page showing:
- ✅ Success/Failure status
- 📊 Number of records updated
- 📧 Number of emails sent
- ⚠️ Any errors encountered

## 📋 Detailed Testing Procedures

### Test 1: Open Forms for New Year

**Purpose**: Verify that forms can be opened and broadcast emails are sent

**Steps**:
1. Go to `/admin/testing`
2. Set Year: `2025`
3. Enable Test Mode: ✅
4. Add Test Emails: `your-email@example.com`
5. Click **"Test Open Forms"**

**Expected Results**:
- ✅ All Library_Year records for 2025 set to `is_open_for_editing = true`
- ✅ Opening notification email sent to test recipients
- ✅ Admin notification email sent to super admins
- ✅ Action logged in AuditLog table as `TEST_OPEN_FORMS`

**Verification**:
1. Check your email inbox for "CEAL Database Forms Now Open for 2025"
2. Go to `/admin/broadcast` and verify forms show as "Open"
3. Check database:
   ```sql
   SELECT year, is_open_for_editing FROM "Library_Year" WHERE year = 2025 LIMIT 5;
   ```

---

### Test 2: Close Forms and Verify Closure

**Purpose**: Verify forms can be closed and confirmation emails sent

**Steps**:
1. Go to `/admin/testing`
2. Set Year: `2025`
3. Enable Test Mode: ✅
4. Add Test Emails: `your-email@example.com`
5. Click **"Test Close Forms"**

**Expected Results**:
- ✅ All Library_Year records for 2025 set to `is_open_for_editing = false`
- ✅ System verifies ALL forms are closed before sending confirmation
- ✅ Closing notification email sent to test recipients
- ✅ **VERIFIED** confirmation email sent to super admins
- ✅ Action logged in AuditLog table as `TEST_CLOSE_FORMS`

**Verification**:
1. Check your email for "CEAL Database Forms Closed for 2025"
2. Check super admin email for "Forms Closed Confirmation"
3. Go to `/admin/broadcast` and verify forms show as "Closed"
4. Check database:
   ```sql
   SELECT year, is_open_for_editing FROM "Library_Year" WHERE year = 2025 LIMIT 5;
   ```

---

### Test 3: Broadcast Email System

**Purpose**: Verify email delivery to multiple recipients

**Steps**:
1. Go to `/admin/testing`
2. Set Year: `2025`
3. Enable Test Mode: ✅
4. Add Multiple Test Emails:
   ```
   test1@example.com, test2@example.com, test3@example.com
   ```
5. Click **"Test Open Forms"**

**Expected Results**:
- ✅ Email sent to ALL test recipients
- ✅ Each recipient receives individual email
- ✅ Emails contain correct year and dates

**Verification**:
1. Check all test email inboxes
2. Verify each received the broadcast
3. Check email content matches template
4. Look at results panel: "Emails Sent: 4" (3 test users + super admin)

---

### Test 4: Survey Dates Management

**Purpose**: Verify that scheduled dates work correctly

**Prerequisites**:
1. Create a session via `/admin/broadcast`
2. Set Opening Date: Tomorrow
3. Set Closing Date: 3 days from now

**Steps to Test Scheduling**:
1. Go to `/admin/broadcast`
2. Check Session Queue shows scheduled session
3. Note the "Opens in X days" countdown
4. Use Testing Dashboard to manually trigger opening
5. Verify forms open immediately (bypassing schedule)

**Expected Results**:
- ✅ Session Queue displays correct schedule
- ✅ Manual trigger bypasses time check
- ✅ Forms open regardless of scheduled date
- ✅ This proves the cron job will work when scheduled time arrives

---

## 🔍 Where to Check Test Outputs

### 1. Testing Dashboard Results Panel
**Location**: On the testing page itself

**Shows**:
- Success/failure status
- Number of records updated
- Number of emails sent
- Any errors encountered

**Example Output**:
```
✅ Test Completed Successfully
Successfully opened 149 forms for year 2025. Sent 4 emails.

Test Results:
- Action: OPEN
- Year: 2025
- Test Mode: ENABLED (Safe)
- Records Updated: 149
- Emails Sent: 4
```

---

### 2. Email Inboxes
**Check**: Test recipient email addresses

**Expected Emails**:

**For Opening**:
- **Subject**: "CEAL Database Forms Now Open for 2025"
- **Content**: Opening date, closing date, link to forms
- **Recipients**: Test users + super admins

**For Closing**:
- **Subject**: "CEAL Database Forms Closed for 2025"
- **Content**: Thank you message, data collection period
- **Recipients**: Test users + super admins

**For Admin Confirmation**:
- **Subject**: "Forms Closed Confirmation - Year 2025"
- **Content**: Verification that all forms are closed, statistics
- **Recipients**: Super admins only

---

### 3. Current Form Status Page
**Location**: `/admin/broadcast`

**Check**:
- **Current Form Status** section
- Look for "Open for Editing" count
- Verify it matches expected state

**Example**:
```
Year: 2025
Total Libraries: 149
Open for Editing: 149  ← Should be 149 after open test
Closed: 0
```

---

### 4. Vercel Server Logs
**Location**: Vercel Dashboard → Your Project → Logs

**How to Access**:
1. Go to https://vercel.com
2. Select your project
3. Click "Logs" tab
4. Filter by "Function Logs"

**What to Look For**:
```
🧪 TEST CRON: Manual trigger started: 2025-10-13T19:10:00.000Z
🎯 Action: OPEN forms for year 2025
🔓 Opening forms for year 2025...
✅ Opened 149 libraries for year 2025
📧 TEST MODE: Sending to 3 test users: [...]
✅ Sent opening notification to 3 users
✅ Sent admin notification to 1 admins
✅ TEST CRON completed in 2341ms
```

**Benefits of Logs**:
- Real-time execution tracking
- Detailed step-by-step output
- Error messages if something fails
- Confirmation of email sending

---

### 5. Database (Direct Query)
**Tool**: Neon Console or any PostgreSQL client

**Queries to Run**:

**Check Form Status**:
```sql
SELECT 
  year,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_open_for_editing = true) as open_count,
  COUNT(*) FILTER (WHERE is_open_for_editing = false) as closed_count
FROM "Library_Year"
WHERE year = 2025
GROUP BY year;
```

**Check Audit Log**:
```sql
SELECT 
  action,
  table_name,
  new_values,
  created_at
FROM "AuditLog"
WHERE action IN ('TEST_OPEN_FORMS', 'TEST_CLOSE_FORMS')
ORDER BY created_at DESC
LIMIT 10;
```

**Check Session Schedule**:
```sql
SELECT 
  year,
  opening_date,
  closing_date,
  is_open_for_editing
FROM "Library_Year"
WHERE year = 2025
  AND (opening_date IS NOT NULL OR closing_date IS NOT NULL)
LIMIT 5;
```

---

### 6. Session Queue Component
**Location**: `/admin/broadcast` → Session Queue section

**Check**:
- Scheduled sessions
- Active sessions
- Recently closed sessions

**Status Indicators**:
- 🔵 **Scheduled** - Forms will open in future
- 🟢 **Active** - Currently open
- ⚪ **Recently Closed** - Closed within 30 days

---

## ⚠️ Test Mode vs Production Mode

### Test Mode (ENABLED) ✅ RECOMMENDED

**What Happens**:
- Emails sent ONLY to specified test email addresses
- If no test emails provided, only super admins receive emails
- Database changes still affect ALL records
- Safe for testing without spamming users

**Use When**:
- Testing email templates
- Verifying email delivery
- Checking broadcast functionality
- Initial testing on Vercel

**Example**:
```
Test Mode: ✅ ENABLED
Test Emails: test@example.com
Result: Only test@example.com receives email
Database: All 149 forms opened
```

---

### Production Mode (DISABLED) ⚠️ USE WITH CAUTION

**What Happens**:
- Emails sent to ALL active users in database
- All real users receive the broadcast
- Database changes affect all records
- **This is the real thing!**

**Use When**:
- Actually opening forms for real
- Actually closing forms for real
- Ready for production broadcast
- After testing is complete

**Warning**:
```
⚠️ PRODUCTION MODE ENABLED
This will send emails to ALL users!
Proceed with caution.
```

---

## 🧪 Complete Test Scenario

### End-to-End Testing Flow

**Scenario**: Test complete form lifecycle for Year 2025

**Step 1: Setup** (5 min)
1. Go to `/admin/broadcast`
2. Create new session for 2025
3. Set Opening: Tomorrow
4. Set Closing: 3 days from now
5. Click "Preview Email & Continue"
6. Verify email preview looks correct

**Step 2: Test Opening** (2 min)
1. Go to `/admin/testing`
2. Set Year: 2025
3. Test Mode: ✅ ENABLED
4. Test Emails: `your-email@example.com`
5. Click "Test Open Forms"
6. Wait for success message

**Step 3: Verify Opening** (3 min)
1. ✅ Check test email inbox
2. ✅ Go to `/admin/broadcast` - verify "Open: 149"
3. ✅ Check Vercel logs
4. ✅ Query database

**Step 4: Test Closing** (2 min)
1. Go back to `/admin/testing`
2. Click "Test Close Forms"
3. Wait for success message

**Step 5: Verify Closing** (3 min)
1. ✅ Check test email inbox
2. ✅ Check super admin inbox for VERIFIED confirmation
3. ✅ Go to `/admin/broadcast` - verify "Closed: 149"
4. ✅ Check Vercel logs
5. ✅ Query database

**Step 6: Cleanup** (1 min)
1. Go to `/admin/broadcast`
2. Delete the test session from Session Queue
3. Note that forms remain closed (as designed)

**Total Time**: ~15 minutes

---

## 🐛 Troubleshooting

### Problem: "Unauthorized" Error

**Cause**: Not signed in as super admin

**Solution**:
1. Ensure you're signed in
2. Verify your account has Role ID 1 (Super Admin)
3. Check cookies are enabled
4. Try refreshing the page

---

### Problem: No Emails Received

**Possible Causes**:

**1. Check Spam Folder**
- Resend emails may be marked as spam initially
- Whitelist the sender domain

**2. Verify RESEND_API_KEY**
```bash
# Check Vercel environment variables
# Settings → Environment Variables
# Look for RESEND_API_KEY
```

**3. Check Vercel Logs**
- Look for email sending errors
- Resend API errors will show in logs

**4. Verify Test Emails**
- Ensure email addresses are valid
- Check for typos in email list
- Use comma separation

---

### Problem: Forms Not Opening/Closing

**Diagnosis Steps**:

1. **Check Database Connection**
   ```sql
   SELECT COUNT(*) FROM "Library_Year" WHERE year = 2025;
   ```
   Should return > 0

2. **Verify Records Exist**
   - Year 2025 must have Library_Year records
   - Records created during "Open Forms for New Year"

3. **Check Test Results Panel**
   - Look at "Records Updated" count
   - Should be > 0

4. **Review Logs**
   - Check for database errors
   - Look for Prisma errors

---

### Problem: "No Library_Year records found"

**Cause**: Testing a year that doesn't exist

**Solution**:
1. Go to `/admin/forms`
2. Click "Open Forms for New Year"
3. Create records for the year
4. Then retry testing

---

## 📊 Understanding Test Results

### Success Result Example
```json
{
  "success": true,
  "timestamp": "2025-10-13T19:10:00.000Z",
  "duration": "2341ms",
  "results": {
    "action": "open",
    "year": 2025,
    "testMode": true,
    "recordsUpdated": 149,
    "emailsSent": 4,
    "errors": []
  },
  "message": "Successfully opened 149 forms for year 2025. Sent 4 emails."
}
```

**Interpretation**:
- ✅ Test successful
- ⏱️ Took 2.3 seconds
- 📝 Updated 149 records
- 📧 Sent 4 emails (3 test users + 1 super admin)
- ✨ No errors

---

### Failure Result Example
```json
{
  "success": false,
  "error": "No Library_Year records found for year 2025",
  "message": "Test execution failed"
}
```

**Interpretation**:
- ❌ Test failed
- 🔍 Year 2025 doesn't have records
- 💡 Need to create records first

---

## 🚀 Production Deployment Checklist

Before running tests on Vercel:

### 1. Environment Variables
```bash
✅ RESEND_API_KEY - Email service
✅ RESEND_BROADCAST_LIST_ID - Audience ID
✅ DATABASE_URL - Neon connection string
✅ CRON_SECRET - For cron authentication
✅ AUTH_SECRET - For JWT signing
```

### 2. Database Ready
```bash
✅ Migrations applied
✅ Library_Year records exist
✅ User accounts created
✅ Super admin role assigned
```

### 3. Testing Page Accessible
```bash
✅ /admin/testing loads without errors
✅ Super admin can access
✅ Forms display correctly
```

### 4. Email Service Configured
```bash
✅ Resend account active
✅ Domain verified (if using custom domain)
✅ Broadcast list created
✅ Test email delivery working
```

---

## 📝 Post-Test Checklist

After completing tests:

1. **✅ Verify All Emails Received**
   - Check all test recipient inboxes
   - Verify email content is correct

2. **✅ Check Form Status**
   - Go to `/admin/broadcast`
   - Verify Current Form Status matches expected state

3. **✅ Review Logs**
   - Check Vercel logs for errors
   - Ensure no warnings or failures

4. **✅ Query Database**
   - Verify is_open_for_editing status
   - Check AuditLog entries

5. **✅ Test Session Queue**
   - Verify queue displays correctly
   - Test delete functionality if needed

6. **✅ Document Results**
   - Note any issues encountered
   - Record successful test completion
   - Save logs/screenshots for reference

---

## 🎓 Best Practices

1. **Always Use Test Mode First**
   - Never skip testing with test emails
   - Verify everything works before production

2. **Keep Test Emails Updated**
   - Use real email addresses you control
   - Include multiple recipients for broadcast testing

3. **Check Logs Regularly**
   - Vercel logs are your best debugging tool
   - Look for warnings even when tests succeed

4. **Test Complete Workflows**
   - Don't just test opening
   - Test full open → close → verify cycle

5. **Clean Up After Testing**
   - Delete test sessions from queue
   - Consider resetting test year forms if needed

6. **Document Your Tests**
   - Keep notes on what works
   - Record any issues for future reference

---

## 🔗 Related Resources

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Resend API Documentation](https://resend.com/docs)
- [Pacific Time Implementation](./PACIFIC_TIME_IMPLEMENTATION.md)
- [Session Delete Behavior](./SESSION_DELETE_BEHAVIOR.md)

---

## 🆘 Need Help?

If you encounter issues:

1. Check Vercel logs first
2. Verify environment variables
3. Test database connectivity
4. Review this guide
5. Check error messages carefully

**Remember**: Test Mode is your friend! Always test with test emails before sending to all users.
