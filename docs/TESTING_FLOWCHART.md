# 🔄 Testing Workflow Flowchart

Visual guide for testing the Survey Dates & Broadcast system.

---

## 📊 Complete Testing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     START TESTING                                │
│                 Use Year: 2099 (Test Year)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: CREATE TEST RECORDS                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Page: /admin/survey-dates                                 │ │
│  │  Year: 2099                                                │ │
│  │  Opening Date: 2099-01-01                                  │ │
│  │  Closing Date: 2099-01-15                                  │ │
│  │  Click: "Create Forms for 2099"                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Expected: ✅ "Successfully opened 2099 forms! (149 records)"    │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: VERIFY SESSION QUEUE                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Page: /admin/broadcast                                    │ │
│  │  Section: "Session Queue"                                  │ │
│  │  Look for: Year 2099 (Scheduled)                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Expected: ✅ Session displayed with opening/closing dates       │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: CHECK EMAIL PREVIEW                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Same page: /admin/broadcast                               │ │
│  │  Section: "Broadcast Email Preview"                        │ │
│  │  Verify: Email template loads                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Expected: ✅ Email preview shows year 2099 and dates            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: TEST FORM OPENING                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Page: /admin/testing                                      │ │
│  │  Year: 2099                                                │ │
│  │  Test Mode: ✅ ENABLED (check box)                         │ │
│  │  Test Emails: your-email@example.com                       │ │
│  │  Click: "Test Open Forms"                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Expected: ✅ Forms open + Email received                        │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: VERIFY FORMS OPENED                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Page: /admin/broadcast                                    │ │
│  │  Section: "Current Form Status"                            │ │
│  │  Check: Open for Editing count                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Expected: ✅ Shows 149 open forms                               │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: TEST FORM CLOSING                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Page: /admin/testing                                      │ │
│  │  Click: "Test Close Forms"                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Expected: ✅ Forms close (149 closed)                           │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: CLEANUP                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Page: /admin/broadcast                                    │ │
│  │  Section: "Session Queue"                                  │ │
│  │  Click: "Delete Session" for year 2099                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Expected: ✅ Session removed, records deleted                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ✅ TESTING COMPLETE                            │
│              All systems working correctly!                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔀 Decision Tree: What Gets Tested

```
                    Testing Start
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     Date Setting    Broadcasting   Automation
          │              │              │
          ▼              ▼              ▼
    
┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
│ Date Setting    │  │ Broadcasting │  │ Automation   │
├─────────────────┤  ├──────────────┤  ├──────────────┤
│ • Create records│  │ • Session    │  │ • Open forms │
│ • Set dates     │  │   Queue      │  │ • Close forms│
│ • Verify storage│  │ • Email      │  │ • Send emails│
│                 │  │   preview    │  │ • CRON jobs  │
└─────────────────┘  └──────────────┘  └──────────────┘
         │                   │                  │
         └───────────────────┼──────────────────┘
                             │
                             ▼
                    All Features Tested ✅
```

---

## 🎯 Test Mode vs Production Mode

```
┌────────────────────────────────────────────────────────────┐
│                     TEST MODE                               │
│  (Testing Dashboard with Test Mode ✅ ENABLED)             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Year: 2099 (safe test year)                               │
│  Test Mode: ✅ ENABLED                                      │
│  Test Emails: your-email@example.com                        │
│                                                             │
│  What happens:                                              │
│  ✅ Forms open/close immediately (no waiting)              │
│  ✅ Emails only to test addresses                          │
│  ✅ No real users affected                                 │
│  ✅ Safe for testing                                       │
│                                                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                  PRODUCTION MODE                            │
│  (Real year with scheduled dates)                          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Year: 2026 (real production year)                         │
│  Opening: 2026-10-01                                       │
│  Closing: 2026-12-02                                       │
│                                                             │
│  What happens:                                              │
│  ⏰ CRON opens forms on 2026-10-01                         │
│  📧 Broadcast to ALL members                               │
│  ⏰ CRON closes forms on 2026-12-02                        │
│  📧 Confirmation to admins                                 │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 📅 Timeline Comparison

### Test Workflow (15 minutes)
```
00:00 → Create test records (2099)
00:02 → Verify session queue
00:03 → Check email preview
00:05 → Test open forms (manual)
00:07 → Verify forms opened
00:08 → Test close forms (manual)
00:10 → Verify forms closed
00:12 → Delete test session
00:15 → ✅ Testing complete
```

### Production Workflow (weeks/months)
```
Day 1   → Create records (2026)
Day 1   → Send broadcast notification
        → ⏰ Wait for opening date
Oct 1   → CRON opens forms automatically
Oct 1   → Broadcast email to all members
        → ⏰ Forms open for data entry
Dec 2   → CRON closes forms automatically
Dec 2   → Confirmation email to admins
Dec 3   → ✅ Forms closed, data finalized
```

---

## 🔄 CRON Job Flow

```
                    Every Hour
                         │
                         ▼
             ┌───────────────────────┐
             │  CRON Job Runs        │
             │  (/api/cron/open-forms)│
             └───────────┬───────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
┌──────────────────┐         ┌──────────────────┐
│ Check for        │         │ Check for        │
│ opening_date     │         │ closing_date     │
│ <= now           │         │ <= now           │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
    Yes  │  No                   Yes  │  No
         ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│ Open Forms:      │         │ Close Forms:     │
│ • Set            │         │ • Set            │
│   is_open = true │         │   is_open = false│
│ • Send broadcast │         │ • Send confirm   │
└──────────────────┘         └──────────────────┘
```

---

## 🧪 Testing Dashboard Simulation

```
Testing Dashboard simulates CRON behavior:

┌────────────────────────────────────────────┐
│  Manual Trigger (Testing Dashboard)        │
│                                             │
│  Click "Test Open Forms"                   │
│         │                                   │
│         ▼                                   │
│  ┌──────────────────────────────┐         │
│  │ Same code as CRON            │         │
│  │ • Opens forms                │         │
│  │ • Sends emails               │         │
│  │ • Updates database           │         │
│  └──────────────────────────────┘         │
│                                             │
│  Difference: Runs immediately,             │
│              not on schedule                │
└────────────────────────────────────────────┘

This means: Testing Dashboard = CRON simulation
✅ If Testing Dashboard works, CRON will work
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Input                            │
│  /admin/survey-dates                                     │
│  • Year: 2099                                            │
│  • Opening: 2099-01-01                                   │
│  • Closing: 2099-01-15                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              API: /api/admin/open-new-year               │
│  • Validates dates                                       │
│  • Converts to Pacific Time                              │
│  • Creates 149 Library_Year records                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Database                               │
│  Library_Year table:                                     │
│  • year = 2099                                           │
│  • opening_date = 2099-01-01 07:00:00 UTC               │
│  • closing_date = 2099-01-16 07:59:59 UTC               │
│  • is_open_for_editing = false                           │
│  • 149 records (one per library)                         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌─────────────┐ ┌─────────┐ ┌──────────┐
│ Broadcast   │ │ Testing │ │ CRON Job │
│ Page        │ │Dashboard│ │          │
│             │ │         │ │          │
│ • Session   │ │ • Open  │ │ • Opens  │
│   Queue     │ │   forms │ │   on     │
│ • Email     │ │ • Close │ │   date   │
│   preview   │ │   forms │ │ • Closes │
└─────────────┘ └─────────┘ │   on     │
                             │   date   │
                             └──────────┘
```

---

## ✅ Verification Checkpoints

```
After each step, verify:

Step 1: Create Records
   ├─ UI shows: "149 records created" ✅
   └─ Database has: 149 records for 2099 ✅

Step 2: Session Queue
   ├─ Session appears in list ✅
   └─ Dates display correctly ✅

Step 3: Email Preview
   ├─ Preview loads automatically ✅
   └─ Shows correct year/dates ✅

Step 4: Open Forms
   ├─ Success message shown ✅
   ├─ Email received ✅
   └─ is_open_for_editing = true ✅

Step 5: Close Forms
   ├─ Success message shown ✅
   └─ is_open_for_editing = false ✅

Step 6: Cleanup
   ├─ Session removed from queue ✅
   └─ Records deleted from database ✅
```

---

## 🚨 Error Handling Flow

```
                  Test Fails?
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
   No Records    No Email    Forms Won't
     Created      Received      Open
         │            │            │
         ▼            ▼            ▼
  
  Check:         Check:        Check:
  • API logs     • Test Mode   • Database
  • Database     • Spam folder • Year exists
  • Year input   • Resend logs • API logs
         │            │            │
         └────────────┼────────────┘
                      │
                      ▼
              Fix Issue & Retry
```

---

## 📝 Quick Reference Card

```
╔═══════════════════════════════════════════════════════╗
║           TESTING QUICK REFERENCE                      ║
╠═══════════════════════════════════════════════════════╣
║                                                        ║
║  Test Year: 2099                                       ║
║  Test Email: your-email@example.com                    ║
║                                                        ║
║  Pages to Visit:                                       ║
║  1. /admin/survey-dates    → Create records           ║
║  2. /admin/broadcast       → Verify & preview         ║
║  3. /admin/testing         → Manual triggers          ║
║                                                        ║
║  Testing Dashboard:                                    ║
║  ☑ Test Mode: MUST BE ENABLED                         ║
║  ☐ Test Mode: Sends to real users (danger!)           ║
║                                                        ║
║  Expected Results:                                     ║
║  • 149 records created                                ║
║  • Session in queue                                   ║
║  • Email preview loads                                ║
║  • Forms open/close works                             ║
║  • Test email received                                ║
║                                                        ║
║  Cleanup:                                              ║
║  Delete Session → Removes all 2099 records            ║
║                                                        ║
╚═══════════════════════════════════════════════════════╝
```

---

**Total Flow Time**: ~15 minutes  
**Complexity**: Low (follow the steps)  
**Safety**: High (uses test year 2099)

---

For detailed instructions, see: `PRODUCTION_TESTING_GUIDE.md`  
For quick steps, see: `TESTING_QUICK_START.md`
