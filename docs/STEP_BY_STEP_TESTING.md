# 👣 Step-by-Step Testing Walkthrough

**Follow this guide while testing in production**

Print this page or keep it open on a second monitor while testing.

---

## 📝 Before You Start

Write down:
- **Your test email**: ________________________________
- **Today's date**: ________________________________
- **Your name**: ________________________________

---

## ✅ STEP 1: Create Test Records

**Time**: 2 minutes  
**Goal**: Create Library_Year records with scheduled dates

### Actions:

1. [ ] Open browser, go to your site
2. [ ] Navigate to: `/admin/survey-dates`
3. [ ] You should see: "Survey Dates Management" page

### Fill in the form:

4. [ ] Academic Year: Type `2099` ⬅️ **Important: Use 2099**
5. [ ] Opening Date: Click calendar, select `2099-01-01`
6. [ ] Closing Date: Click calendar, select `2099-01-15`

### Submit:

7. [ ] Click the green button: **"Create Forms for 2099"**
8. [ ] Wait for response (1-3 seconds)

### ✅ Success looks like:

```
✅ Successfully opened 2099 forms!

Total Libraries: 149
New Records Created: 149
Existing Records Skipped: 0
Total Active Records: 149
```

### ❌ If you see an error:

- Check if you typed 2099 correctly
- Check if dates are in correct format
- Try refreshing the page and trying again

### Write down your result:

- **Records created**: ________
- **Any errors?**: ________

---

## ✅ STEP 2: Verify Session Queue

**Time**: 1 minute  
**Goal**: Confirm the session appears in broadcast page

### Actions:

1. [ ] Navigate to: `/admin/broadcast`
2. [ ] You should see: "Open/Close Annual Surveys" page
3. [ ] Scroll down to find: **"Session Queue"** section

### ✅ Success looks like:

You should see a card that says:

```
📅 Session Queue

Year 2099 (Scheduled)
Opens: Sunday, January 1, 2099 (or similar)
Closes: Saturday, January 15, 2099 (or similar)
Status: Opens in X days

[Delete Session] button
```

### ❌ If session doesn't appear:

- Go back to `/admin/survey-dates`
- Check if records were actually created
- Try creating records again
- Check browser console for errors (F12 → Console tab)

### Write down your result:

- **Session visible?**: ☐ Yes ☐ No
- **Opening date shown**: ________________
- **Closing date shown**: ________________

---

## ✅ STEP 3: Check Email Preview

**Time**: 1 minute  
**Goal**: Verify email template loads correctly

### Actions:

1. [ ] You're still on: `/admin/broadcast`
2. [ ] Scroll to: **"Broadcast Email Preview"** section (or **"Email Preview"**)

### ✅ Success looks like:

You should see:

```
Scheduled Session Details:
Year: 2099
Opens: [date in your local time]
Closes: [date in your local time]
Status: Scheduled
```

Below that, you should see:
- An email template (HTML preview)
- Text that mentions "2099"
- Text that mentions the opening/closing dates

### ❌ If preview doesn't load:

- Check if "Loading..." is still showing → wait a bit longer
- Check browser console for errors
- Try clicking "Refresh Preview" button if available
- Try refreshing the entire page

### Write down your result:

- **Email preview loaded?**: ☐ Yes ☐ No
- **Shows year 2099?**: ☐ Yes ☐ No
- **Shows correct dates?**: ☐ Yes ☐ No

---

## ✅ STEP 4: Schedule Broadcast (CRITICAL TEST)

**Time**: 2 minutes  
**Goal**: Verify broadcast is SCHEDULED, not sent immediately

⚠️ **THIS IS A CRITICAL TEST** - Verifies the system schedules correctly!

### Actions:

1. [ ] You're still on: `/admin/broadcast`
2. [ ] Scroll to: **"Email Preview"** section
3. [ ] Click button: **"Continue to Send Broadcast"**
4. [ ] You should see: **"Schedule Broadcast"** page

### On confirmation page:

5. [ ] Review the scheduled dates shown
6. [ ] Look for: "📅 Scheduled Automation Summary"
7. [ ] Look for: "✅ What Happens Automatically"

### Submit:

8. [ ] Click button: **"Confirm & Schedule Broadcast"**
9. [ ] Wait for response (1-3 seconds)

### ✅ Success looks like:

```
✅ Broadcast Scheduled Successfully!
Automated session for 2099 has been scheduled.
Everything will happen automatically on the scheduled dates.
```

### ⚠️ CRITICAL CHECKS:

10. [ ] Message says **"scheduled"** (NOT "sent")
11. [ ] Check your email inbox
12. [ ] ✅ **You should NOT receive any email yet**
13. [ ] If you receive email → **STOP** → System has a bug

### Verify forms stay closed:

14. [ ] Navigate to: `/admin/broadcast`
15. [ ] Check: **"Current Form Status"**
16. [ ] Should show:
     ```
     Open for Editing: 0
     Closed: 149
     ```

### ✅ SUCCESS CRITERIA:

- [ ] Message says "scheduled" ✅
- [ ] NO email received ✅
- [ ] Forms show 0 open, 149 closed ✅

**This is CORRECT behavior** - CRON will send email on opening date!

### Write down your result:

- **Broadcast scheduled?**: ☐ Yes ☐ No
- **Message says "scheduled"?**: ☐ Yes ☐ No
- **Email received immediately?**: ☐ No (correct!) ☐ Yes (BUG!)
- **Forms closed (0 open)?**: ☐ Yes ☐ No

---

## ✅ STEP 5: Test CRON Simulation (Testing Dashboard)

**Time**: 2 minutes  
**Goal**: Simulate what CRON will do on opening date

### Actions:

1. [ ] Navigate to: `/admin/testing`
2. [ ] You should see: "Testing Dashboard" page

### Fill in the form:

3. [ ] **Year**: Type `2099`
4. [ ] **Test Mode**: ⬅️ **CRITICAL**: Find the checkbox, **CHECK IT** ✅
   - Label should say "Test Mode" or "Enable Test Mode"
   - **MUST BE CHECKED** to avoid sending to real users
5. [ ] **Test Emails**: Type your email: ________________________________

### Double-check:

6. [ ] Is Test Mode checkbox **CHECKED**? ✅
7. [ ] If not, **STOP** and check it now!

### Submit:

8. [ ] Click button: **"Test Open Forms"**
9. [ ] Wait for response (2-5 seconds)

### ✅ Success looks like:

```
✅ Success
Opened 149 forms for year 2099
Email sent to: your-email@example.com
```

### Check your email:

10. [ ] Open your email inbox
11. [ ] Look for email from CEAL Statistics (check spam if not in inbox)
12. [ ] Email subject should mention surveys or forms
13. [ ] Email should mention year 2099

### ❌ If email doesn't arrive:

- Wait 1-2 minutes (emails can be delayed)
- Check spam/junk folder
- Verify your email address was typed correctly
- Verify Test Mode was checked
- Check if "Test Emails" field had your email

### Write down your result:

- **Forms opened?**: ☐ Yes ☐ No
- **Email received?**: ☐ Yes ☐ No (Time: ________)
- **Email correct?**: ☐ Yes ☐ No

---

## ✅ STEP 6: Verify Forms Opened

**Time**: 1 minute  
**Goal**: Confirm forms are actually open in database

### Actions:

1. [ ] Navigate back to: `/admin/broadcast`
2. [ ] Look for: **"Current Form Status"** section at the top

### ✅ Success looks like:

```
📊 Current Form Status

Year: 2099
Total Libraries: 149
Open for Editing: 149
Closed: 0

Last Updated: [current date and time]
```

**Key check**: "Open for Editing" should be **149**

### ❌ If forms aren't showing as open:

- Check if you're looking at year 2099 (not another year)
- Try clicking "Refresh" on the page
- Go back to Testing Dashboard and try "Test Open Forms" again

### Write down your result:

- **Open for Editing count**: ________
- **Closed count**: ________
- **Matches expected (149 open)?**: ☐ Yes ☐ No

---

## ✅ STEP 7: Test Form Closing

**Time**: 1 minute  
**Goal**: Manually trigger form closing

### Actions:

1. [ ] Navigate to: `/admin/testing` (if not already there)
2. [ ] Find button: **"Test Close Forms"**

### Submit:

3. [ ] Click button: **"Test Close Forms"**
4. [ ] Wait for response (2-5 seconds)

### ✅ Success looks like:

```
✅ Success
Closed 149 forms for year 2099
```

### Verify:

5. [ ] Go back to: `/admin/broadcast`
6. [ ] Check **"Current Form Status"**

Should now show:

```
Year: 2099
Total Libraries: 149
Open for Editing: 0
Closed: 149
```

**Key check**: "Closed" should be **149**, "Open for Editing" should be **0**

### Write down your result:

- **Forms closed successfully?**: ☐ Yes ☐ No
- **Open for Editing count**: ________
- **Closed count**: ________

---

## ✅ STEP 8: Cleanup

**Time**: 1 minute  
**Goal**: Remove test data from production

### Actions:

1. [ ] You're still on: `/admin/broadcast`
2. [ ] Scroll to: **"Session Queue"** section
3. [ ] Find the year 2099 session
4. [ ] Click button: **"Delete Session"**

### Confirm:

5. [ ] Browser might ask: "Are you sure?" → Click **"Yes"** or **"Confirm"**
6. [ ] Wait for deletion (1-2 seconds)

### ✅ Success looks like:

- Session for year 2099 disappears from the list
- No error messages
- Session Queue shows "No pending or active form sessions found" (if no other sessions)

### Verify cleanup in database (optional):

If you have database access:

```sql
SELECT COUNT(*) FROM "Library_Year" WHERE year = 2099;
```

Should return: **0** (all test records deleted)

### Write down your result:

- **Session deleted?**: ☐ Yes ☐ No
- **Session Queue empty?**: ☐ Yes ☐ No

---

## 🎉 TESTING COMPLETE!

### Final Checklist:

Review all your results:

- [ ] Step 1: Created 149 records ✅
- [ ] Step 2: Session appeared in queue ✅
- [ ] Step 3: Email preview loaded ✅
- [ ] Step 4: Broadcast scheduled (NO email sent) ✅ **CRITICAL**
- [ ] Step 5: CRON simulation (Test Dashboard) worked ✅
- [ ] Step 6: Forms opened (149 open) ✅
- [ ] Step 7: Forms closed (149 closed) ✅
- [ ] Step 8: Cleanup successful ✅

### If ALL steps passed:

✅ **Your system is working correctly!**

You can now safely:
- ✅ Use real years (e.g., 2026)
- ✅ Set real dates
- ✅ Trust CRON jobs to work automatically
- ✅ Broadcasts are scheduled correctly (not sent immediately)
- ✅ Forms stay closed until opening date

### If ANY step failed:

❌ **Review the troubleshooting section**

Common issues:
1. Test Mode not enabled → Retest Step 4
2. Email not received → Check spam, wait longer
3. Session not appearing → Recreate records
4. Database access needed → Contact IT/DBA

---

## 📊 Test Results Summary

**Tester**: ________________________________  
**Date**: ________________________________  
**Time Started**: ________  
**Time Ended**: ________  
**Total Time**: ________ minutes

### Results:

| Step | Task | Result | Notes |
|------|------|--------|-------|
| 1 | Create Records | ☐ Pass ☐ Fail | |
| 2 | Session Queue | ☐ Pass ☐ Fail | |
| 3 | Email Preview | ☐ Pass ☐ Fail | |
| 4 | Schedule Broadcast (NO email) | ☐ Pass ☐ Fail | **CRITICAL** |
| 5 | CRON Simulation | ☐ Pass ☐ Fail | |
| 6 | Verify Forms Open | ☐ Pass ☐ Fail | |
| 7 | Close Forms | ☐ Pass ☐ Fail | |
| 8 | Cleanup | ☐ Pass ☐ Fail | |

**Overall**: ☐ All Pass ☐ Some Failed

### Issues Encountered:

____________________________________________  
____________________________________________  
____________________________________________  

### Next Steps:

☐ All passed → System ready for production  
☐ Some failed → Review errors and retest  
☐ Need help → Contact support with this form

---

## 🚀 Ready for Production?

If all tests passed, you can now:

### Next Steps:

1. **Plan your real deployment**
   - Choose production year (e.g., 2026)
   - Choose real opening date (e.g., October 1, 2026)
   - Choose real closing date (e.g., December 2, 2026)

2. **Create production records**
   - Use `/admin/survey-dates` with real year and dates
   - Verify session appears in `/admin/broadcast`

3. **Schedule broadcast**
   - Preview email in `/admin/broadcast`
   - Click "Send Broadcast Now" (optional - CRON will handle it)

4. **Monitor on opening date**
   - Check CRON logs in Vercel dashboard
   - Verify emails sent to all members
   - Verify forms opened automatically

5. **Monitor on closing date**
   - Check CRON logs
   - Verify forms closed automatically
   - Verify confirmation email received

---

## 📞 Support

If you need help:

1. **Review documentation**:
   - `PRODUCTION_TESTING_GUIDE.md` - Detailed guide
   - `TESTING_QUICK_START.md` - Quick reference
   - `TESTING_FLOWCHART.md` - Visual diagrams

2. **Check logs**:
   - Browser console (F12)
   - Vercel function logs
   - Resend email logs

3. **Database verification**:
   - Connect to production database
   - Run verification queries from testing guide

---

**Happy Testing!** 🧪

Remember: Testing with year 2099 is safe and won't affect production data.
