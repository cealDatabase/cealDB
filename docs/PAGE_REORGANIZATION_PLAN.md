# Page Reorganization Plan

## Problem Statement

The current three-page system is confusing with overlapping responsibilities:
- Survey Dates Management sets dates per year
- Open Forms for New Year creates records manually
- Open/Close Annual Surveys duplicates date setting

## New Organization

### **Page 1: Survey Dates Settings** (`/admin/survey-dates`)

**Purpose**: Set system-wide default dates that apply to ALL future years

**Features**:
- Set default opening date (e.g., "October 1" → stored as "10-01")
- Set default closing date (e.g., "December 2" → stored as "12-02")
- These are system-wide settings, NOT year-specific
- Stored in `SystemSettings` table (single row, ID=1)
- Changes take effect immediately for future operations

**What It Does NOT Do**:
- Does NOT create Library_Year records
- Does NOT open/close forms
- Does NOT send broadcasts
- Just saves default date templates

**UI Flow**:
```
┌───────────────────────────────────┐
│ Survey Dates Settings             │
├───────────────────────────────────┤
│ Default Opening Date: [10-01]     │
│ Default Closing Date: [12-02]     │
│                                   │
│ [Save System Defaults]            │
└───────────────────────────────────┘
```

---

### **Page 2: Open Forms for New Year** (`/admin/forms`)

**Purpose**: Create Library_Year records for a new academic year using saved defaults

**Features**:
- User selects year (e.g., 2025)
- Click "Open Forms for 2025"
- System automatically:
  1. Loads default dates from SystemSettings
  2. Creates Library_Year records for all libraries
  3. Sets opening_date and closing_date using defaults
  4. Does NOT open forms yet (is_open_for_editing = false)
  5. Does NOT send emails

**What It Does NOT Do**:
- Does NOT let user pick dates (uses system defaults)
- Does NOT open forms immediately
- Does NOT send broadcast emails
- Just creates the records with scheduled dates

**UI Flow**:
```
┌────────────────────────────────────────────┐
│ Open Forms for New Year                    │
├────────────────────────────────────────────┤
│ This will create records for Year: [2025]  │
│                                            │
│ Using system default dates:                │
│ • Opening: October 1, 2025                 │
│ • Closing: December 2, 2025                │
│                                            │
│ [Create Forms for 2025]                    │
└────────────────────────────────────────────┘
```

---

### **Page 3: Open/Close Annual Surveys** (`/admin/broadcast`)

**Purpose**: Monitor status, manage sessions, preview email, and send broadcasts

**Features**:

#### Section 1: Current Form Status (Dashboard)
- Shows current year's status
- Total libraries
- How many open for editing
- How many closed
- Last updated timestamp
- **[Close All Forms]** button (if needed)

#### Section 2: Session Queue
- Shows scheduled, active, and recently closed sessions
- Displays opening/closing dates
- Countdown timers
- **[Delete Session]** button for each
- Can delete schedules if needed

#### Section 3: Email Preview & Send
**Step 1**: Preview Email Template
- Shows what the broadcast email will look like
- Uses actual scheduled dates from session
- **[Continue to Send]** button

**Step 2**: Send Broadcast
- Confirms action
- When clicked, triggers the scheduled process:
  - Opens forms on scheduled opening date/time
  - Sends broadcast email to all users
  - Closes forms on scheduled closing date/time
  - Sends confirmation to super admin

**What It Does NOT Do**:
- Does NOT let user set/change dates (dates come from session)
- Focus is on monitoring and triggering broadcasts
- Admin can manually close all forms if needed

**UI Flow**:
```
┌──────────────────────────────────────────────┐
│ Open/Close Annual Surveys                    │
├──────────────────────────────────────────────┤
│                                              │
│ ┌─ Current Form Status ─────────────────┐   │
│ │ Year: 2025                            │   │
│ │ Total: 149  │ Open: 149  │ Closed: 0 │   │
│ │ [Close All Forms]                      │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ ┌─ Session Queue ────────────────────────┐   │
│ │ Academic Year 2025 [ACTIVE]           │   │
│ │ Opens: Oct 1  │  Closes: Dec 2        │   │
│ │ [Delete Session]                       │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ ┌─ Email Preview & Send ─────────────────┐   │
│ │ Step 1: Preview Email                  │   │
│ │ [Shows email template]                 │   │
│ │ [Continue to Send] →                   │   │
│ │                                        │   │
│ │ Step 2: Confirm & Send Broadcast       │   │
│ │ [Send Broadcast Now]                   │   │
│ └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

---

## New User Flow

### Scenario: Setting up forms for Year 2025

**Step 1**: Set System Defaults (One-time setup)
```
Admin → Survey Dates Settings
  → Set Opening: October 1
  → Set Closing: December 2
  → Click "Save"
  ✅ System defaults saved
```

**Step 2**: Create Year 2025 Records
```
Admin → Open Forms for New Year
  → Year: 2025
  → Click "Create Forms for 2025"
  ✅ 149 Library_Year records created
  ✅ opening_date set to Oct 1, 2025
  ✅ closing_date set to Dec 2, 2025
  ✅ is_open_for_editing = false (not yet open)
```

**Step 3**: Monitor & Send Broadcast
```
Admin → Open/Close Annual Surveys
  → See Session Queue showing Year 2025
  → See "Opens in 5 days" countdown
  → Preview email template
  → Click "Send Broadcast Now"
  ✅ System schedules:
     - Open forms on Oct 1
     - Send broadcast email
     - Close forms on Dec 2
     - Send confirmation
```

---

## Database Schema Changes

### New Table: SystemSettings
```sql
CREATE TABLE "SystemSettings" (
  id INT PRIMARY KEY DEFAULT 1,
  default_opening_date VARCHAR(5),  -- "10-01" format
  default_closing_date VARCHAR(5),  -- "12-02" format
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(255)
);
```

### Migration Script
```sql
-- Create SystemSettings table
CREATE TABLE IF NOT EXISTS "SystemSettings" (
  id INT PRIMARY KEY DEFAULT 1,
  default_opening_date VARCHAR(5),
  default_closing_date VARCHAR(5),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(255)
);

-- Insert default values
INSERT INTO "SystemSettings" (id, default_opening_date, default_closing_date, updated_by)
VALUES (1, '10-01', '12-02', 'system')
ON CONFLICT (id) DO NOTHING;
```

---

## API Endpoints

### New: GET/POST `/api/admin/system-settings`
- **GET**: Retrieve default dates
- **POST**: Update default dates (Super Admin only)

### Modified: POST `/api/admin/forms/create-year`
- Reads default dates from SystemSettings
- Creates Library_Year records with those dates
- No date parameters needed in request

### Keep: `/api/admin/broadcast`
- Preview email
- Send broadcast
- Triggers opening/closing based on scheduled dates

### Keep: `/api/admin/delete-session`
- Delete scheduled sessions
- Does NOT change form open/closed status

---

## Benefits of New Structure

1. **Clear Separation of Concerns**
   - Settings page = set defaults
   - Forms page = create records
   - Broadcast page = monitor & broadcast

2. **Reduced Confusion**
   - No duplicate date setting
   - Each page has one clear purpose
   - Linear workflow

3. **Flexibility**
   - Change system defaults anytime
   - Defaults apply to all future years
   - Can still manage individual sessions

4. **Better User Experience**
   - Simpler interfaces
   - Fewer fields to fill
   - Clear next steps

---

## Implementation Steps

1. ✅ Add SystemSettings table to Prisma schema
2. ✅ Create system-settings API endpoint
3. □ Rewrite Survey Dates Settings page (simple)
4. □ Update Open Forms for New Year page
5. □ Simplify Open/Close Annual Surveys page
6. □ Update documentation
7. □ Test complete workflow

---

## Migration Plan

### For Existing Data
- Run migration to create SystemSettings table
- Initialize with defaults (10-01, 12-02)
- Existing Library_Year records unchanged
- Future operations use new defaults

### For Users
- Survey Dates Settings: Completely new simple interface
- Open Forms: Simpler (no date picking)
- Broadcast: Remove date setting section, keep monitoring

---

## Testing Checklist

- [ ] Set system defaults via Survey Dates Settings
- [ ] Create new year using Open Forms
- [ ] Verify dates applied correctly
- [ ] Check Session Queue displays correctly
- [ ] Preview email shows correct dates
- [ ] Send test broadcast
- [ ] Verify forms open/close on schedule
- [ ] Test delete session functionality

---

## Documentation Updates

- Update user guide with new workflow
- Create migration guide for existing admins
- Document new SystemSettings table
- Update API documentation

