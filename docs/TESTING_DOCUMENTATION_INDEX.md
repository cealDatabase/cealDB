# 📚 Testing Documentation Index

**Complete guide to testing Survey Dates Management and Broadcast System**

---

## 🎯 Start Here

Choose the document that best fits your needs:

### 👣 **For First-Time Testing** (Recommended)
📄 **[STEP_BY_STEP_TESTING.md](./STEP_BY_STEP_TESTING.md)**
- Print this or keep it open while testing
- Follow step-by-step with checkboxes
- Includes test results form
- Takes ~15 minutes
- **Best for**: First-time testers, hands-on guidance

### ⚡ **For Quick Testing**
📄 **[TESTING_QUICK_START.md](./TESTING_QUICK_START.md)**
- TLDR version with essential steps only
- Quick 5-minute minimum test
- Perfect for repeat testing
- **Best for**: Experienced testers, quick verification

### 📖 **For Comprehensive Reference**
📄 **[PRODUCTION_TESTING_GUIDE.md](./PRODUCTION_TESTING_GUIDE.md)**
- Complete documentation with all details
- Includes troubleshooting
- Database queries
- CRON testing options
- **Best for**: Technical users, troubleshooting, reference

### 🔄 **For Visual Learners**
📄 **[TESTING_FLOWCHART.md](./TESTING_FLOWCHART.md)**
- Visual flowcharts and diagrams
- Decision trees
- Timeline comparisons
- Data flow diagrams
- **Best for**: Understanding the overall process

### 📅 **For Broadcast Scheduling Verification** ⚠️ **IMPORTANT**
📄 **[BROADCAST_SCHEDULING_VERIFICATION.md](./BROADCAST_SCHEDULING_VERIFICATION.md)**
- Verifies broadcast is SCHEDULED, not sent immediately
- How to confirm forms stay closed until opening date
- CRON simulation testing
- Critical behavior changes explained
- **Best for**: Verifying the scheduling system works correctly

---

## 📋 What You'll Test

### 1. **Survey Dates Management** (`/admin/survey-dates`)
- Creating Library_Year records
- Setting opening and closing dates
- Date storage and conversion (PT to UTC)

### 2. **Broadcast System** (`/admin/broadcast`)
- Session Queue display
- Email preview generation
- Broadcast scheduling

### 3. **Testing Dashboard** (`/admin/testing`)
- Manual form opening
- Manual form closing
- Test email functionality

### 4. **CRON Jobs** (Automated)
- Automatic form opening on scheduled date
- Automatic form closing on scheduled date
- Email notifications

---

## 🧪 Testing Approach

### Safe Testing with Year 2099

All guides recommend using **year 2099** for testing:

```
✅ Safe: Year 2099
   - Won't conflict with production
   - Far in future
   - Easy to identify and cleanup

❌ Unsafe: Current year (2025, 2026)
   - Could affect production data
   - Hard to distinguish from real data
   - Risk of confusion
```

### Test Mode vs Production Mode

**Test Mode** (Testing Dashboard):
- ✅ Forms open/close immediately
- ✅ Emails only to test addresses
- ✅ No real users affected
- ✅ Safe for testing

**Production Mode** (Real deployment):
- ⏰ CRON runs on schedule
- 📧 Emails to all members
- 🎯 Real production data
- ⚠️ Use after testing

---

## 📝 Document Guide

### [STEP_BY_STEP_TESTING.md](./STEP_BY_STEP_TESTING.md)

**Purpose**: Guided walkthrough for hands-on testing

**Contents**:
- ✅ 7 detailed steps with checkboxes
- 🎯 Expected results for each step
- ❌ Troubleshooting for common issues
- 📝 Test results form to fill out
- ⏱️ Time estimates for each step

**Use when**:
- First time testing the system
- Need step-by-step guidance
- Want to document results
- Training new team members

**Estimated time**: 15 minutes

---

### [TESTING_QUICK_START.md](./TESTING_QUICK_START.md)

**Purpose**: Quick reference for experienced testers

**Contents**:
- ⚡ 5-minute minimum test
- 📋 Full test checklist
- 🔍 Quick verification queries
- 🚨 Common issues and solutions
- 🎯 Success criteria

**Use when**:
- Already familiar with the system
- Need quick verification
- Repeat testing
- Time-constrained testing

**Estimated time**: 5-15 minutes

---

### [PRODUCTION_TESTING_GUIDE.md](./PRODUCTION_TESTING_GUIDE.md)

**Purpose**: Comprehensive technical reference

**Contents**:
- 📖 Detailed testing procedures
- 🔧 Multiple testing options
- 🗃️ Database verification queries
- ⏰ CRON job testing methods
- 🚨 Extensive troubleshooting
- 🔄 End-to-end workflow testing

**Use when**:
- Need detailed technical information
- Troubleshooting issues
- Database verification needed
- Testing CRON jobs
- Reference documentation

**Estimated time**: 30-60 minutes (full tests)

---

### [TESTING_FLOWCHART.md](./TESTING_FLOWCHART.md)

**Purpose**: Visual representation of testing process

**Contents**:
- 🔄 Complete testing flow diagram
- 🔀 Decision trees
- 📊 Data flow diagrams
- ⏱️ Timeline comparisons
- 🎯 Verification checkpoints
- 📝 Quick reference card

**Use when**:
- Understanding the overall process
- Training presentations
- Visual learning preference
- Quick reference needed

**Estimated time**: 5 minutes to review

---

### [BROADCAST_SCHEDULING_VERIFICATION.md](./BROADCAST_SCHEDULING_VERIFICATION.md) ⚠️

**Purpose**: Verify broadcast scheduling works correctly

**Contents**:
- ⚠️ Critical behavior explanation
- 🔍 How to verify scheduling (not immediate sending)
- 📅 CRON simulation testing
- 🚨 Troubleshooting scheduling issues
- ✅ Verification checklist

**Use when**:
- Need to verify broadcasts are scheduled correctly
- Confirming forms stay closed until opening date
- Troubleshooting "email sent too early" issues
- Understanding new scheduling behavior

**Estimated time**: 10-15 minutes

⚠️ **IMPORTANT**: Read this if you're unsure whether broadcasts are being sent immediately or scheduled!

---

## 🚀 Recommended Testing Path

### For First-Time Setup:

```
1. Read: TESTING_FLOWCHART.md (5 min)
   └─ Understand overall process

2. Follow: STEP_BY_STEP_TESTING.md (15 min)
   └─ Complete hands-on testing

3. Reference: PRODUCTION_TESTING_GUIDE.md (as needed)
   └─ Troubleshooting and details
```

### For Regular Testing:

```
1. Use: TESTING_QUICK_START.md (5-10 min)
   └─ Quick verification tests

2. Reference: PRODUCTION_TESTING_GUIDE.md (as needed)
   └─ If issues arise
```

### For Troubleshooting:

```
1. Check: PRODUCTION_TESTING_GUIDE.md
   └─ Troubleshooting section

2. Review: STEP_BY_STEP_TESTING.md
   └─ Verify each step was done correctly

3. Examine: TESTING_FLOWCHART.md
   └─ Identify where process failed
```

---

## 🎓 Testing Levels

### Level 1: Basic Functionality (5 min)
**Use**: TESTING_QUICK_START.md

Tests:
- ✅ Create records
- ✅ Session appears
- ✅ Email preview loads

### Level 2: Complete Workflow (15 min)
**Use**: STEP_BY_STEP_TESTING.md

Tests:
- ✅ Everything in Level 1
- ✅ Form opening
- ✅ Email sending
- ✅ Form closing
- ✅ Cleanup

### Level 3: Advanced Testing (30-60 min)
**Use**: PRODUCTION_TESTING_GUIDE.md

Tests:
- ✅ Everything in Level 2
- ✅ Database verification
- ✅ CRON simulation
- ✅ End-to-end workflow
- ✅ Edge cases

---

## 📊 Testing Checklist Summary

| What to Test | Quick Start | Step-by-Step | Full Guide |
|--------------|-------------|--------------|------------|
| Create Records | ✅ | ✅ | ✅ |
| Session Queue | ✅ | ✅ | ✅ |
| Email Preview | ✅ | ✅ | ✅ |
| Open Forms | ✅ | ✅ | ✅ |
| Close Forms | ✅ | ✅ | ✅ |
| Email Receiving | ✅ | ✅ | ✅ |
| Cleanup | ✅ | ✅ | ✅ |
| Database Queries | ⬜ | ⬜ | ✅ |
| CRON Testing | ⬜ | ⬜ | ✅ |
| Troubleshooting | Basic | Basic | Extensive |

---

## 🔑 Key Concepts

### Pages Involved

1. **`/admin/survey-dates`** - Survey Dates Management
   - Create Library_Year records
   - Set opening/closing dates

2. **`/admin/broadcast`** - Open/Close Annual Surveys
   - View Session Queue
   - Preview emails
   - Monitor form status

3. **`/admin/testing`** - Testing Dashboard
   - Manual form opening
   - Manual form closing
   - Test mode for safe testing

### Important Fields

- **Academic Year**: Which year's forms to create (use 2099 for testing)
- **Opening Date**: When forms automatically open (PT timezone)
- **Closing Date**: When forms automatically close (PT timezone)
- **Test Mode**: Checkbox to enable safe testing (prevents emailing real users)
- **Test Emails**: Email addresses to receive test notifications

### Database Table

**`Library_Year`** - Stores form access records

Key columns:
- `year` - Academic year (e.g., 2099)
- `library` - Library ID (1-149)
- `opening_date` - When forms should open (UTC)
- `closing_date` - When forms should close (UTC)
- `is_open_for_editing` - Whether forms are currently open

---

## 🎯 Success Criteria

Your system is working if:

✅ **Date Setting**
- Can create 149 records for test year
- Dates convert from PT to UTC correctly
- Session appears in Broadcast page

✅ **Email System**
- Preview generates automatically
- Test emails send correctly
- Contains accurate information

✅ **Form Control**
- Testing Dashboard can open forms
- Testing Dashboard can close forms
- Status updates correctly

✅ **Data Integrity**
- Records created properly
- Records can be deleted cleanly
- No orphaned data

---

## 🚨 Common Issues & Solutions

### Issue: "No session found"
**Solution**: Create records via `/admin/survey-dates` first

**Reference**: 
- STEP_BY_STEP_TESTING.md → Step 1
- PRODUCTION_TESTING_GUIDE.md → Test 1

---

### Issue: "Email not received"
**Solutions**:
1. Check Test Mode is enabled
2. Check spam folder
3. Wait 1-2 minutes
4. Verify email address

**Reference**:
- STEP_BY_STEP_TESTING.md → Step 4
- PRODUCTION_TESTING_GUIDE.md → Test 3
- TESTING_QUICK_START.md → Common Issues

---

### Issue: "Forms won't open"
**Solutions**:
1. Verify year exists in database
2. Check browser console
3. Verify API is responding

**Reference**:
- PRODUCTION_TESTING_GUIDE.md → Troubleshooting
- TESTING_FLOWCHART.md → Error Handling Flow

---

## 📞 Getting Help

### Self-Service:

1. **Check troubleshooting sections** in:
   - PRODUCTION_TESTING_GUIDE.md (extensive)
   - STEP_BY_STEP_TESTING.md (per-step)
   - TESTING_QUICK_START.md (common issues)

2. **Review flowcharts** in:
   - TESTING_FLOWCHART.md

3. **Verify database** using queries in:
   - PRODUCTION_TESTING_GUIDE.md
   - TESTING_QUICK_START.md

### Support Resources:

- Browser console (F12 → Console)
- Vercel function logs
- Resend email dashboard
- Database access

---

## 📅 When to Test

### Before Production Launch:
- ✅ Complete all Level 2 tests (STEP_BY_STEP_TESTING.md)
- ✅ Verify all steps pass
- ✅ Document results

### After Code Changes:
- ✅ Run Level 1 tests (TESTING_QUICK_START.md)
- ✅ Verify no regressions

### Before Major Deployment:
- ✅ Run Level 3 tests (PRODUCTION_TESTING_GUIDE.md)
- ✅ Test CRON jobs
- ✅ Verify end-to-end

### Regular Verification:
- ✅ Monthly: Level 1 tests
- ✅ Quarterly: Level 2 tests
- ✅ Annually: Level 3 tests

---

## 🎓 Training Plan

### New Admin Onboarding:

**Week 1**: Understanding
- Read: TESTING_FLOWCHART.md
- Review: System architecture
- Shadow: Experienced admin

**Week 2**: Hands-On
- Follow: STEP_BY_STEP_TESTING.md (supervised)
- Practice: Creating test records
- Practice: Testing Dashboard usage

**Week 3**: Independence
- Use: TESTING_QUICK_START.md (unsupervised)
- Reference: PRODUCTION_TESTING_GUIDE.md as needed
- Complete: Full test cycle

**Week 4**: Mastery
- Execute: All testing levels
- Troubleshoot: Common issues
- Document: Results

---

## 📝 Documentation Updates

These documents should be updated when:

- ✏️ UI changes (page routes, button labels)
- ✏️ Process changes (new steps, removed steps)
- ✏️ New features added
- ✏️ Issues discovered
- ✏️ New troubleshooting solutions found

---

## ✅ Quick Decision Tree

**"Which document should I use?"**

```
Are you testing for the first time?
├─ Yes → STEP_BY_STEP_TESTING.md
└─ No ↓

Do you need quick verification?
├─ Yes → TESTING_QUICK_START.md
└─ No ↓

Do you need to troubleshoot?
├─ Yes → PRODUCTION_TESTING_GUIDE.md
└─ No ↓

Do you want to understand the flow?
├─ Yes → TESTING_FLOWCHART.md
└─ All → Read this INDEX.md
```

---

## 🎉 Success!

Once you complete testing using any of these guides, you'll have:

✅ Verified the system works correctly  
✅ Confirmed dates propagate properly  
✅ Tested email functionality  
✅ Validated CRON behavior (via simulation)  
✅ Confidence to deploy to production  

---

**Happy Testing!** 🧪

Choose your document from the list above and get started!

---

**Document Version**: 1.0  
**Last Updated**: October 13, 2025  
**Maintained by**: Development Team
