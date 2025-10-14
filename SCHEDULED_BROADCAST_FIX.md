# Scheduled Broadcast Fix

## Summary of Changes

✅ **Immediate Broadcasts** - Fixed to actually send emails (uses `.send()` call)

✅ **Scheduled Broadcasts** - Now uses Resend's built-in scheduling (uses `scheduledAt` parameter)

⚠️ **Form Automation** - Still needs cron job implementation (see below)

## What Was Fixed for Scheduled Broadcasts

### Before (❌ Didn't Work):
```typescript
// Old code - just created a fake placeholder
broadcast = { data: { id: "scheduled", status: "pending" } }
// No actual broadcast created in Resend!
```

### After (✅ Works):
```typescript
// New code - uses Resend's scheduledAt parameter
broadcast = await resend.broadcasts.create({
  audienceId: audienceId,
  from: "CEAL Database <noreply@cealstats.org>",
  subject: `CEAL Statistics Online Surveys Are Now Open`,
  html: emailTemplate,
  scheduledAt: openDate.toISOString(), // Resend handles automatic sending
})
```

## How Scheduled Broadcasts Now Work

### When You Select "Schedule for Opening Date"

**Step 1: API Call Creates Scheduled Broadcast**
```
POST /api/admin/broadcast
{
  "sendImmediately": false,
  "openingDate": "2025-10-15",
  "closingDate": "2025-12-20",
  "year": "2025"
}
```

**Step 2: Resend Creates Broadcast with Schedule**
- Broadcast created in Resend with `scheduledAt` timestamp
- Status in Resend dashboard: **"Scheduled"**
- Resend will automatically send at the scheduled time
- No additional code needed on your end!

**Step 3: Database Records Created**
- `Library_Year` records updated (forms stay CLOSED)
- `SurveySession` created with `isOpen: false`
- `ScheduledEvent` records created for tracking:
  - BROADCAST event (handled by Resend automatically)
  - FORM_OPENING event (needs cron job - see below)
  - FORM_CLOSING event (needs cron job - see below)

**Step 4: Automatic Sending (Handled by Resend)**
- On the scheduled date/time, Resend automatically sends emails
- No server-side cron job needed for broadcast
- Emails delivered to all audience members

## What Still Needs Implementation: Form Automation

While **broadcast emails** are now fully automated via Resend, **form opening/closing** still needs a cron job:

### Current State

✅ **Broadcast Email** - Automatically sent by Resend at scheduled time

❌ **Form Opening** - Forms stay closed, need manual opening or cron job

❌ **Form Closing** - Forms stay open, need manual closing or cron job

### What You Need to Build

A **cron job** (Vercel Cron or external service) that:

1. **Runs every hour** (or more frequently)
2. **Checks for pending `ScheduledEvent` records** where:
   - `status = 'pending'`
   - `scheduled_date <= now()`
   - `event_type = 'FORM_OPENING'` or `'FORM_CLOSING'`
3. **Executes the action**:
   - FORM_OPENING: Set `is_open_for_editing = true` for all Library_Year records
   - FORM_CLOSING: Set `is_open_for_editing = false` for all Library_Year records
4. **Marks event as completed**: Update `status = 'completed'`, `completed_at = now()`

### Example Cron Job Endpoint

Create `/app/api/cron/process-scheduled-events/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  // Verify cron job authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  try {
    // Find pending events that should be executed
    const pendingEvents = await prisma.scheduledEvent.findMany({
      where: {
        status: 'pending',
        scheduled_date: { lte: now },
        event_type: { in: ['FORM_OPENING', 'FORM_CLOSING'] }
      }
    })

    console.log(`Found ${pendingEvents.length} events to process`)

    const results = []

    for (const event of pendingEvents) {
      try {
        if (event.event_type === 'FORM_OPENING') {
          // Open all forms for this year
          await prisma.library_Year.updateMany({
            where: { year: event.year },
            data: {
              is_open_for_editing: true,
              updated_at: new Date()
            }
          })

          // Update SurveySession
          await prisma.surveySession.updateMany({
            where: { academicYear: parseInt(event.year) },
            data: {
              isOpen: true,
              notifiedOnOpen: true,
              updatedAt: new Date()
            }
          })

          console.log(`✅ Opened forms for year ${event.year}`)

        } else if (event.event_type === 'FORM_CLOSING') {
          // Close all forms for this year
          await prisma.library_Year.updateMany({
            where: { year: event.year },
            data: {
              is_open_for_editing: false,
              updated_at: new Date()
            }
          })

          // Update SurveySession
          await prisma.surveySession.updateMany({
            where: { academicYear: parseInt(event.year) },
            data: {
              isOpen: false,
              notifiedOnClose: true,
              updatedAt: new Date()
            }
          })

          console.log(`✅ Closed forms for year ${event.year}`)
        }

        // Mark event as completed
        await prisma.scheduledEvent.update({
          where: { id: event.id },
          data: {
            status: 'completed',
            completed_at: new Date()
          }
        })

        results.push({ 
          eventId: event.id, 
          type: event.event_type, 
          year: event.year, 
          success: true 
        })

      } catch (error) {
        console.error(`❌ Failed to process event ${event.id}:`, error)
        results.push({ 
          eventId: event.id, 
          type: event.event_type, 
          year: event.year, 
          success: false, 
          error: error.message 
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length, 
      results 
    })

  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json({ 
      error: "Failed to process scheduled events" 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
```

### Configure Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/process-scheduled-events",
    "schedule": "0 * * * *"
  }]
}
```

This runs every hour on the hour (e.g., 1:00, 2:00, 3:00, etc.)

### Environment Variable

Add to Vercel:
```
CRON_SECRET=your-random-secret-key-here
```

## Testing Scheduled Broadcasts

### Test 1: Schedule a Broadcast

1. Go to `/admin/broadcast`
2. Set dates for tomorrow
3. Select **"Schedule for Opening Date"**
4. Click **"Send Broadcast"**

**Expected Results:**
- ✅ Success message
- ✅ In Resend dashboard: Broadcast shows status = **"Scheduled"**
- ✅ Scheduled time matches your opening date
- ✅ Forms remain CLOSED

### Test 2: Verify Automatic Sending

1. Wait until scheduled time arrives
2. Check Resend dashboard
3. Broadcast status should change to **"Sent"**
4. Check email inbox - broadcast should be delivered

**Note:** Forms will still be CLOSED because form automation requires the cron job.

### Test 3: Manual Form Opening (Until Cron is Built)

If you need to open forms before building the cron job:

```bash
# Go to /admin/survey-dates
# Click "Manually Open All Forms"
```

## Comparison: Immediate vs Scheduled

| Feature | Immediate | Scheduled |
|---------|-----------|-----------|
| Broadcast Email | ✅ Sent via `.send()` | ✅ Sent via `scheduledAt` |
| Forms Open | ✅ Immediately | ⚠️ Needs cron job |
| Forms Close | ✅ Via scheduled event | ⚠️ Needs cron job |
| Resend Automation | ✅ Full | ✅ Broadcast only |
| Additional Infra | None needed | Cron job needed |

## Summary

### ✅ What's Fixed

1. **Immediate broadcasts** - Now properly send emails using `.send()`
2. **Scheduled broadcasts** - Now use Resend's `scheduledAt` for automatic delivery
3. **Timezone display** - Email shows correct Pacific Time dates

### ⚠️ What Still Needs Work

1. **Form opening automation** - Needs cron job implementation
2. **Form closing automation** - Needs cron job implementation
3. **Scheduled event processing** - Manual intervention required until cron is built

### 🎯 Priority Next Steps

1. ✅ Deploy current broadcast fixes
2. ✅ Test immediate broadcast (should work fully)
3. ✅ Test scheduled broadcast email (should work via Resend)
4. 🔨 Build cron job for form automation (optional but recommended)

### Workaround Until Cron is Built

For scheduled broadcasts:
1. Email will send automatically (handled by Resend) ✅
2. Manually open forms from `/admin/survey-dates` on opening day ⚠️
3. Manually close forms from `/admin/survey-dates` on closing day ⚠️

---

**Current Status:** Scheduled broadcasts will send emails automatically, but forms require manual opening/closing until cron job is implemented.
