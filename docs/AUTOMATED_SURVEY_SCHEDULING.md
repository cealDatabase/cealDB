# Automated Survey Scheduling System

## Overview

This system provides fully automated form opening and closing based on schedules set by super admins. It uses **Vercel Cron Jobs** to check schedules every 15 minutes and automatically:

- ✅ Opens forms for all libraries on the scheduled opening date
- ✅ Closes forms for all libraries on the scheduled closing date
- ✅ Sends email notifications to all CEAL members via Resend
- ✅ Sends separate admin alerts to super admins
- ✅ Logs all actions in the audit trail

## Key Features

### 1. **Automated Scheduling**
- Super admins create a survey session with opening and closing dates
- Vercel cron job runs every 15 minutes to check if any action is needed
- Forms automatically open/close without manual intervention

### 2. **Email Notifications**
- **Member Notifications**: All active users receive beautifully formatted emails when forms open or close
- **Admin Alerts**: Super admins receive separate notifications with system statistics
- **Powered by Resend**: Professional email delivery with high deliverability

### 3. **Current Status Display**
- Real-time view of how many libraries are open vs. closed
- Last updated timestamp for tracking
- Visual indicators for form status

### 4. **Audit Trail**
- All automated actions logged with timestamps
- Full traceability of when forms were opened/closed
- Email delivery statistics tracked

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Cron Job                         │
│              (Runs every 15 minutes)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│   Check SurveySession Table for Scheduled Actions          │
│   - Is openingDate ≤ NOW && !isOpen? → OPEN                │
│   - Is closingDate ≤ NOW && isOpen? → CLOSE                │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐    ┌───────────────┐
│  Update DB    │    │  Send Emails  │
│  Library_Year │    │  via Resend   │
└───────────────┘    └───────────────┘
```

## Setup Instructions

### Step 1: Install Dependencies

All required dependencies are already in `package.json`. No additional packages needed.

### Step 2: Update Prisma Schema

The new `SurveySession` model has been added to:
```
/prisma/schema/survey_session.prisma
```

**Run Prisma commands to apply the schema:**

```bash
# Push schema changes to database
npm run db:push

# Generate Prisma Client with new model
npx prisma generate --schema=./prisma/schema
```

This will create the `SurveySession` table in your database.

### Step 3: Environment Variables

Add the following to your `.env` file (and Vercel environment variables):

```bash
# Resend API Key (required for email notifications)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Cron Secret (for production security)
# Generate with: openssl rand -base64 32
CRON_SECRET=your-random-secret-here

# Database URL (should already exist)
DATABASE_URL=postgresql://...
```

**Get Resend API Key:**
1. Sign up at https://resend.com
2. Create a new API key in the dashboard
3. Add it to your environment variables

### Step 4: Configure Vercel Cron

The `vercel.json` file has been created with the cron configuration:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-form-schedules",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

This runs every 15 minutes. You can adjust the schedule:
- `*/15 * * * *` - Every 15 minutes (recommended)
- `*/30 * * * *` - Every 30 minutes
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours

### Step 5: Deploy to Vercel

1. **Commit all changes:**
```bash
git add .
git commit -m "Add automated survey scheduling system"
git push
```

2. **Vercel will automatically deploy**

3. **Add environment variables in Vercel dashboard:**
   - Go to Project Settings → Environment Variables
   - Add `RESEND_API_KEY`
   - Add `CRON_SECRET`
   - Redeploy if needed

4. **Verify cron is configured:**
   - Go to Vercel dashboard → your project
   - Click on "Cron Jobs" tab
   - You should see `/api/cron/check-form-schedules` listed

## Usage Guide

### For Super Admins

1. **Access the Scheduling Page:**
   - Sign in as a super admin
   - Go to Admin Guide
   - Click "📅 Open/Close Annual Surveys"

2. **Create a New Schedule:**
   - Enter Academic Year (e.g., 2025)
   - Select Opening Date and Time
   - Select Closing Date and Time
   - Click "Preview Email & Continue"

3. **What Happens Next:**
   - The schedule is saved to the database
   - Vercel cron will check every 15 minutes
   - When the opening date arrives:
     - All Library_Year records updated to `is_open_for_editing = true`
     - Email sent to all active users
     - Admin notification sent to super admins
   - When the closing date arrives:
     - All Library_Year records updated to `is_open_for_editing = false`
     - Closure email sent to all users
     - Admin notification sent to super admins

### Managing Schedules

- **View All Schedules:** Listed in the "Scheduled Sessions" table
- **Delete Schedule:** Click "Delete" next to any session (prevents future automation)
- **Check Status:** The "Current Form Status" shows real-time counts

## API Endpoints

### 1. Survey Session Management

**GET** `/api/admin/survey-sessions`
- Get all scheduled sessions
- Optional: `?year=2025` to get specific year

**POST** `/api/admin/survey-sessions`
- Create new survey session
- Body: `{ academicYear, openingDate, closingDate }`

**PUT** `/api/admin/survey-sessions`
- Update existing session
- Body: `{ academicYear, openingDate?, closingDate? }`

**DELETE** `/api/admin/survey-sessions?year=2025`
- Delete scheduled session

### 2. Form Status

**GET** `/api/admin/form-status?year=2025`
- Get current status of forms for a year
- Returns: `{ totalLibraries, openLibraries, closedLibraries, lastUpdated }`

### 3. Cron Endpoint

**GET/POST** `/api/cron/check-form-schedules`
- Automatically called by Vercel every 15 minutes
- Can be manually triggered for testing
- Requires `CRON_SECRET` in production

## Email Templates

### Forms Opened Email
- **To:** All active users
- **Subject:** 🔓 CEAL Database Forms Open for [YEAR] - Action Required
- **Contains:** Opening/closing dates, submission period, direct link to forms

### Forms Closed Email
- **To:** All active users
- **Subject:** 🔒 CEAL Database Forms Closed for [YEAR]
- **Contains:** Session summary, next steps

### Admin Notification (Open)
- **To:** Super admins only
- **Subject:** ✅ Admin Alert: Forms Automatically Opened for [YEAR]
- **Contains:** System statistics, libraries opened count, action log

### Admin Notification (Close)
- **To:** Super admins only
- **Subject:** 🔒 Admin Alert: Forms Automatically Closed for [YEAR]
- **Contains:** System statistics, libraries closed count, next steps

## Monitoring & Debugging

### Check Cron Logs

In Vercel dashboard:
1. Go to your project
2. Click on "Deployments"
3. Click on the latest deployment
4. Click "Functions" tab
5. Look for `/api/cron/check-form-schedules`
6. View logs to see execution details

### Manual Testing

You can manually trigger the cron job for testing:

```bash
# Development
curl http://localhost:3000/api/cron/check-form-schedules

# Production (requires CRON_SECRET)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://cealstats.org/api/cron/check-form-schedules
```

### Check Audit Logs

All automated actions are logged in the `AuditLog` table:
- Action type: `SYSTEM_OPEN_FORMS` or `SYSTEM_CLOSE_FORMS`
- Includes: Academic year, libraries affected, emails sent

## Troubleshooting

### Forms didn't open/close at scheduled time

**Check:**
1. Is the Vercel cron job configured? (Check Vercel dashboard → Cron Jobs)
2. Are environment variables set? (`RESEND_API_KEY`, `CRON_SECRET`)
3. Check cron function logs in Vercel for errors
4. Verify the session exists in database: `SELECT * FROM "SurveySession"`

### Emails not being sent

**Check:**
1. Is `RESEND_API_KEY` set correctly?
2. Check Resend dashboard for email logs and errors
3. Are there active users in the database? (`SELECT * FROM "User" WHERE isactive = true`)
4. Check function logs for email sending errors

### Database errors

**Check:**
1. Did you run `npm run db:push` to create the `SurveySession` table?
2. Did you run `npx prisma generate` to update the Prisma client?
3. Check database connection string in `DATABASE_URL`

## Database Schema

### SurveySession Table

```prisma
model SurveySession {
  id                Int       @id @default(autoincrement())
  academicYear      Int       @unique
  openingDate       DateTime
  closingDate       DateTime
  isOpen            Boolean   @default(false)
  notifiedOnOpen    Boolean   @default(false)
  notifiedOnClose   Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  createdBy         Int?
}
```

**Fields:**
- `academicYear`: The year for this survey session (unique)
- `openingDate`: When forms should open
- `closingDate`: When forms should close
- `isOpen`: Current state (false until opening date, true after opening, false after closing)
- `notifiedOnOpen`: Prevents duplicate open emails
- `notifiedOnClose`: Prevents duplicate close emails

## Security Considerations

1. **Cron Authentication:** Production cron requires `CRON_SECRET` to prevent unauthorized access
2. **Super Admin Only:** Only users with role_id=1 can create/modify schedules
3. **Email Rate Limits:** Resend free tier supports 100 emails/day, 3000/month
4. **Audit Trail:** All actions logged for accountability

## Cost Analysis

### Resend Pricing
- **Free Tier:** 100 emails/day, 3000 emails/month
- **Pro Plan:** $20/month for 50,000 emails
- **Estimate:** With 150 libraries, 2 notifications per year = 300 emails (well within free tier)

### Vercel Cron
- **Hobby Plan:** 100 cron executions/day (included)
- **Pro Plan:** Unlimited cron executions
- **Usage:** 96 executions/day (every 15 min) = within Hobby limits

## Future Enhancements

Potential improvements for future iterations:

1. **Reminder Emails:** Send reminders 1 week before closing
2. **Custom Recipients:** Select specific libraries to notify
3. **Multi-Language Emails:** Support for Chinese, Japanese, Korean
4. **Email Preview:** Preview emails before scheduling
5. **Timezone Support:** Handle different timezones for international members
6. **Rollback Feature:** Ability to undo accidental closures
7. **Analytics Dashboard:** Track email open rates, form completion

## Support

For issues or questions:
1. Check the audit logs for system actions
2. Review Vercel function logs for errors
3. Check Resend dashboard for email delivery status
4. Contact the development team

---

**System Status:** ✅ Production Ready

**Version:** 1.0.0

**Last Updated:** January 2025
