# Form Integration with Session Control

## Overview

Now that we've updated the system to work with your existing `Library_Year.is_open_for_editing` field, here's how to integrate the session control with your existing forms.

## Integration Methods

### Method 1: Using FormSessionController (Recommended)

Wrap your existing form components:

```jsx
// In your existing form page (e.g., /app/(authentication)/admin/forms/[libid]/fiscal/page.tsx)
import FormSessionController from '@/components/FormSessionController';
import { YourExistingFiscalForm } from '@/components/forms/FiscalForm';

export default function FiscalFormPage({ params }) {
  const { libid } = params;

  return (
    <FormSessionController libraryId={parseInt(libid)}>
      {({ canEdit, StatusMessage }) => (
        <>
          <StatusMessage />
          <YourExistingFiscalForm 
            libraryId={libid}
            disabled={!canEdit}
          />
        </>
      )}
    </FormSessionController>
  );
}
```

### Method 2: Using the Hook Directly

For more control over the UI:

```jsx
import { useCanEditForm } from '@/hooks/useFormSession';

export default function CustomFormPage({ params }) {
  const { libid } = params;
  const { canEdit, isSessionOpen, loading } = useCanEditForm(parseInt(libid));

  if (loading) {
    return <div>Checking form access...</div>;
  }

  return (
    <div>
      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800">Forms Currently Closed</h3>
          <p className="text-sm text-yellow-700">
            Forms are not currently open for editing. Please contact the CEAL Database Administrator for assistance.
          </p>
        </div>
      )}
      
      <YourExistingForm 
        disabled={!canEdit}
        onSubmit={canEdit ? handleSubmit : undefined}
      />
    </div>
  );
}
```

### Method 3: Higher-Order Component

For consistent styling across all forms:

```jsx
import { withFormSessionControl } from '@/components/FormSessionController';
import { YourExistingForm } from '@/components/forms/YourForm';

// This creates a new component with automatic session control
const ControlledForm = withFormSessionControl(YourExistingForm, libraryId);

// Use it in your page
export default function FormPage() {
  return <ControlledForm {...yourFormProps} />;
}
```

## Form Component Updates

Update your existing form components to handle the `disabled` prop:

```jsx
// Example: Updated form component
export function FiscalSupportForm({ disabled = false, ...otherProps }) {
  return (
    <form>
      {/* All input fields should respect the disabled state */}
      <input 
        type="text" 
        disabled={disabled}
        {...inputProps}
      />
      
      <button 
        type="submit" 
        disabled={disabled}
        className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {disabled ? 'Form Closed' : 'Submit'}
      </button>
    </form>
  );
}
```

## Super Admin Workflow

1. **Opening Forms:**
   - Navigate to Super Guide
   - Click "📧 Open Forms & Broadcast" 
   - Select year and opening date
   - Preview email template
   - Send broadcast (opens all forms automatically)

2. **Managing Active Sessions:**
   - View current status in Super Guide
   - Close all forms with one click
   - Reopen if needed

3. **Monitoring:**
   - Check which libraries have forms open
   - View last updated timestamps
   - Monitor form completion status

## Technical Notes

### Database Changes

The system now works entirely with your existing schema:
- `Library_Year.is_open_for_editing` controls form access
- No additional tables needed
- Existing audit logging captures all actions

### API Endpoints

- `POST /api/admin/broadcast` - Opens forms and sends notifications
- `GET /api/admin/form-session` - Check current form status
- `PATCH /api/admin/form-session` - Close/reopen forms

### Environment Variables Required

```env
RESEND_API_KEY="your-resend-api-key"
RESEND_BROADCAST_LIST_ID="your-audience-id-from-resend"
```

## Testing the Integration

1. **Test Form Access Control:**
   ```bash
   # Check if forms respond to Library_Year.is_open_for_editing
   # Verify role-based access (members can only edit their library)
   ```

2. **Test Super Admin Workflow:**
   ```bash
   # Test opening forms for a year
   # Verify email sending
   # Test closing forms
   ```

3. **Test Member Experience:**
   ```bash
   # Login as regular member
   # Verify can only see own library forms
   # Test form disable/enable based on session
   ```

## Migration Steps

1. **Update Form Pages:**
   - Add FormSessionController wrapper to existing form pages
   - Update form components to handle `disabled` prop

2. **Test Integration:**
   - Test with super admin account
   - Test with member accounts
   - Verify email notifications work

3. **Deploy:**
   - Set environment variables
   - Update production database schema (already compatible)
   - Test in production environment

The system is now fully compatible with your existing `Library_Year` schema and provides comprehensive form session management without requiring additional database tables.
