# Vanguard Sports App - Comprehensive Fix Plan

## Executive Summary
This plan addresses 16 identified issues across authentication, UI/UX, data persistence, and navigation. All fixes are designed to maintain the existing architecture while improving functionality and user experience.

---

## CRITICAL ISSUES (Priority 1)

### 1. Password Update Not Persisting
**Location**: `src/views/parent/AccountSettings.jsx:84-94`

**Root Cause**:
- `handlePasswordChange` uses `setTimeout` mock implementation
- No actual API call to `/api/auth/change-password`

**Fix**:
```javascript
// Replace lines 84-94 with:
const handlePasswordChange = async () => {
  if (!validateSecurity()) return;

  setLoading(true);
  try {
    await authService.changePassword(
      securityData.currentPassword,
      securityData.newPassword
    );
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordStrength(null);
    showNotificationMessage('Password changed successfully!');
  } catch (error) {
    showNotificationMessage(error.message || 'Failed to change password');
  } finally {
    setLoading(false);
  }
};
```

**Files to modify**:
- `src/views/parent/AccountSettings.jsx`

---

### 2. Profile Update Not Persisting
**Location**: `src/views/parent/AccountSettings.jsx:70-81`

**Root Cause**:
- `handleProfileSave` only updates localStorage
- No API call to `/api/users/me` endpoint

**Fix**:
```javascript
// Need to create userService first (new file)
// Then replace lines 70-81 with:
const handleProfileSave = async () => {
  if (!validateProfile()) return;

  setLoading(true);
  try {
    const [firstName, ...lastNameParts] = profileData.name.split(' ');
    const lastName = lastNameParts.join(' ');

    const updatedUser = await userService.updateProfile({
      firstName,
      lastName,
      phone: profileData.phone
    });

    onUpdate({ ...user, ...updatedUser });
    showNotificationMessage('Profile updated successfully!');
  } catch (error) {
    showNotificationMessage(error.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};
```

**Files to create**:
- `src/services/userService.js`

**Files to modify**:
- `src/views/parent/AccountSettings.jsx`

---

## HIGH PRIORITY ISSUES (Priority 2)

### 3. Notification System Shows Wrong Icon for Errors
**Location**: `src/App.jsx:2393` and similar locations

**Root Cause**:
- `showNotification` function accepts only message, not type
- Notification component always renders green checkmark icon

**Fix**:
1. Update `showNotification` to accept type parameter:
```javascript
const showNotification = (msg, type = 'success') => {
  setNotification({ message: msg, type });
  setTimeout(() => setNotification(null), 3000);
};
```

2. Update notification rendering:
```javascript
{notification && (
  <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in flex items-center gap-3">
    {notification.type === 'error' ? (
      <AlertTriangle className="text-red-400" size={20} />
    ) : notification.type === 'warning' ? (
      <Info className="text-yellow-400" size={20} />
    ) : (
      <Check className="text-green-400" size={20} />
    )}
    {notification.message || notification}
  </div>
)}
```

3. Update all calls to `showNotification` for errors:
   - Error calls: `showNotification('error message', 'error')`
   - Warning calls: `showNotification('warning message', 'warning')`
   - Success calls: `showNotification('success message')` or `showNotification('success message', 'success')`

**Files to modify**:
- `src/App.jsx` (main notification state and multiple locations)
- `src/views/parent/AccountSettings.jsx`
- `src/views/parent/FamilyManagement.jsx`
- `src/views/parent/ParentDashboard.jsx`
- `src/views/parent/BillingPortal.jsx`

---

### 4. Admin Credentials Work on Parent Portal
**Location**: `src/App.jsx:1662`

**Root Cause**:
- Login function doesn't validate role matches selected portal
- Backend returns user regardless of which portal they use

**Proposed Solutions**:

**Option A: Unified Login Portal (Recommended)**
- Remove role selector tabs from login
- Let backend determine role and redirect accordingly
- Simpler UX, less confusing

**Option B: Strict Role Separation**
- Add role validation after login
- Show error if role doesn't match portal
- More complex but enforces separation

**Recommended Fix (Option A)**:
1. Remove role selector UI from `LoginView`
2. After successful login, route based on `response.user.role`:
```javascript
if (response.user) {
  const user = { /* ... */ };

  // Route based on actual role
  switch (user.role) {
    case 'admin':
      setView('adminDashboard');
      break;
    case 'coach':
      setView('coachDashboard');
      break;
    case 'parent':
      setView('dashboard');
      break;
    default:
      throw new Error('Invalid user role');
  }

  showNotification('Login successful! Welcome back.');
  loginUser(user);
}
```

**Files to modify**:
- `src/App.jsx` (LoginView component)

---

### 5. Missing Sign Out Button in Navigation
**Location**: Multiple dashboard components

**Current State**:
- Parent dashboard has sign out button
- Coach dashboard missing sign out button
- Admin dashboard missing sign out button

**Fix**:
Add sign out button to coach and admin dashboards similar to parent dashboard implementation.

For Coach Dashboard (in sidebar at `src/App.jsx:~690`):
```javascript
<div className="p-6 border-t border-slate-800">
  <Button
    variant="ghost"
    className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
    onClick={logoutUser}
  >
    <LogOut size={20} />
    <span className="font-medium hidden lg:block">Sign Out</span>
  </Button>
</div>
```

**Files to modify**:
- `src/App.jsx` (CoachDashboard and AdminDashboard components)

---

## MEDIUM PRIORITY ISSUES (Priority 3)

### 6. Browser Alert for Cancel Subscription
**Location**:
- `src/App.jsx:2376`
- `src/views/parent/ParentDashboard.jsx:21`

**Root Cause**:
- Uses `window.confirm()` instead of custom modal
- Unprofessional UI, shows domain in alert

**Fix**:
Create a reusable ConfirmDialog component:

```javascript
// src/components/ui/ConfirmDialog.jsx
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <Card className="max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            {cancelText || 'Cancel'}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText || 'Confirm'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
```

Then replace `window.confirm` usage:
```javascript
const [showCancelDialog, setShowCancelDialog] = useState(false);

const handleCancelClick = () => {
  setShowCancelDialog(true);
};

const handleCancelConfirm = () => {
  setSubStatus('Canceled');
  showNotificationMessage('Subscription cancelled successfully');
};

// In JSX:
<Button onClick={handleCancelClick}>Cancel Subscription</Button>

<ConfirmDialog
  isOpen={showCancelDialog}
  onClose={() => setShowCancelDialog(false)}
  onConfirm={handleCancelConfirm}
  title="Cancel Subscription"
  message="Are you sure you want to cancel your membership? This action cannot be undone."
  confirmText="Yes, Cancel"
  cancelText="No, Keep It"
  variant="danger"
/>
```

**Files to create**:
- `src/components/ui/ConfirmDialog.jsx`

**Files to modify**:
- `src/App.jsx`
- `src/views/parent/ParentDashboard.jsx`
- `src/views/parent/BillingPortal.jsx`

---

### 7. Cancel Subscription Button Active Without Subscription
**Location**: `src/views/parent/BillingPortal.jsx` and `src/App.jsx`

**Fix**:
```javascript
<Button
  variant="ghost"
  className="text-red-600"
  onClick={handleCancelClick}
  disabled={subStatus !== 'Active'}
>
  Cancel Subscription
</Button>
```

**Files to modify**:
- `src/views/parent/BillingPortal.jsx`
- `src/App.jsx` (BillingPortal component)

---

### 8. Save Changes Button Active Without Data
**Location**: `src/views/parent/FamilyManagement.jsx:107`

**Fix**:
Add validation to check if any athlete data exists:
```javascript
const hasValidData = athletes.some(athlete =>
  athlete.name && athlete.name.trim().length > 0
);

<Button onClick={handleSaveChanges} disabled={loading || !hasValidData}>
  {/* ... */}
</Button>
```

**Files to modify**:
- `src/views/parent/FamilyManagement.jsx`

---

### 9. Action Required Shows With Zero Students
**Location**: `src/App.jsx:497-501` (Coach Dashboard)

**Fix**:
```javascript
{totalStudents > 0 && (
  <Card className="p-6">
    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
      <Info size={18} className="text-orange-500"/> Action Required
    </h3>
    {/* ... rest of content ... */}
  </Card>
)}
```

**Files to modify**:
- `src/App.jsx` (CoachDashboard OverviewTab)

---

### 10. Dead Links - "View Schedule" and "Contact Support"
**Location**: Parent Dashboard and various locations

**Fix**:
Implement actual functionality or remove buttons:

For "View Schedule":
```javascript
<Button onClick={() => onNavigate('schedule')}>View Schedule</Button>
```

For "Contact Support":
```javascript
<a href="mailto:support@vanguardsports.com" className="...">
  Contact Support
</a>
```

**Files to modify**:
- Identify all locations with dead links
- Add proper navigation or external links

---

### 11. Dead Link - "Check" Button in Coach Dashboard
**Location**: `src/App.jsx:505`

**Fix**:
```javascript
<button
  onClick={() => setActiveTab('schedule')}
  className="ml-auto text-xs font-bold text-orange-600 hover:underline"
>
  Check
</button>
```

**Files to modify**:
- `src/App.jsx` (CoachDashboard OverviewTab)

---

## LOW PRIORITY ISSUES (Priority 4)

### 12. Coach Navigation Double-Refresh Issue
**Location**: `src/App.jsx:687`

**Root Cause**:
Likely caused by React StrictMode in development

**Fix**:
Check `src/main.jsx` for `<StrictMode>`:
```javascript
// This is expected in development with StrictMode
// If it persists in production build, investigate further

// Temporary fix: Remove StrictMode for testing
createRoot(document.getElementById('root')).render(
  <App /> // Remove <StrictMode> wrapper
)
```

**Note**: StrictMode intentionally double-renders in development to catch side effects. This is not a bug unless it happens in production.

**Files to check**:
- `src/main.jsx`

---

### 13. Create New Session Modal Too Large
**Location**: Need to identify the exact modal

**Fix Strategy**:
1. Find the modal component
2. Add max-height and overflow-y-auto:
```javascript
<div className="max-h-[80vh] overflow-y-auto">
  {/* Modal content */}
</div>
```

**Investigation needed**:
- Search for "Create.*Session" modal in codebase
- Check parent dashboard for session creation flow

---

### 14. Missing Coach Security/Profile Settings
**Location**: Coach Dashboard

**Fix**:
Reuse the `AccountSettings` component from parent views:
```javascript
// In CoachDashboard, add a settings tab or button
{view === 'coachSettings' && (
  <AccountSettings
    user={user}
    onUpdate={updateUser}
    onBack={() => setView('coachDashboard')}
  />
)}
```

**Files to modify**:
- `src/App.jsx` (Add settings option to CoachDashboard)

---

### 15. Duplicate Asterisk on Required Fields
**Location**: Input component and form usage

**Investigation Needed**:
The Input component at `src/components/ui/Input.jsx:37` correctly shows one asterisk when `required` prop is true. Need to check if forms are passing both the `required` prop AND using the HTML `required` attribute, which might cause visual duplication.

**Potential Fix**:
Ensure forms only use the `required` prop, not the HTML attribute:
```javascript
// CORRECT:
<Input label="Name" required />

// INCORRECT (might cause duplication):
<Input label="Name" required={true} ... />
<input required /> // Don't add HTML required if using component prop
```

**Investigation locations**:
- Search for `<Input.*required` patterns
- Check registration and enrollment forms

---

### 16. Payment Method Section Missing
**Location**: `src/views/parent/BillingPortal.jsx`

**Status**: Marked as "Pending Feature" in user feedback

**Recommendation**:
Either implement or add "Coming Soon" placeholder:
```javascript
<Card className="p-6 opacity-50">
  <h3 className="font-bold text-slate-900 mb-4">Payment Methods</h3>
  <p className="text-slate-500 text-sm">Coming soon</p>
</Card>
```

**Files to modify**:
- `src/views/parent/BillingPortal.jsx`

---

## Implementation Order

### Phase 1: Critical Fixes (Week 1)
1. Fix password update API integration
2. Fix profile update API integration
3. Create userService
4. Test data persistence

### Phase 2: High Priority (Week 1-2)
5. Fix notification system (add type parameter)
6. Update all notification calls
7. Implement unified login (remove role selector)
8. Add sign out buttons to coach/admin dashboards

### Phase 3: Medium Priority (Week 2)
9. Create ConfirmDialog component
10. Replace window.confirm with ConfirmDialog
11. Fix button states (cancel subscription, save changes)
12. Fix coach dashboard action required logic
13. Fix dead links

### Phase 4: Low Priority (Week 3)
14. Investigate and fix duplicate asterisk
15. Add coach settings page
16. Fix/find create session modal
17. Add payment method placeholder
18. Test double-refresh in production build

---

## Testing Checklist

### Critical Features
- [ ] Password change persists after logout/login
- [ ] Profile updates persist after logout/login
- [ ] Error notifications show error icon
- [ ] Success notifications show checkmark icon

### Authentication
- [ ] Admin can only access admin dashboard
- [ ] Coach can only access coach dashboard
- [ ] Parent can only access parent dashboard
- [ ] Sign out works from all dashboards

### UI/UX
- [ ] Confirm dialogs are professional (no browser alerts)
- [ ] Buttons disabled when appropriate
- [ ] No dead links
- [ ] No duplicate asterisks on required fields

### Coach Dashboard
- [ ] Navigation doesn't double-refresh (check production build)
- [ ] Action required only shows when needed
- [ ] All links functional

---

## Risk Assessment

### Low Risk
- Notification icon changes (isolated component)
- Button state fixes (simple logic)
- Dead link fixes (straightforward)

### Medium Risk
- Password/profile API integration (need error handling)
- Login flow changes (affects all users)
- ConfirmDialog component (need thorough testing)

### High Risk
- None - all changes are additive or isolated

---

## Rollback Plan

1. Keep backup of all modified files
2. Use git branches for each phase
3. Test each phase before merging
4. Can revert individual phases if issues arise

---

## Notes

- Backend APIs already exist for password and profile updates
- No database schema changes needed
- All fixes maintain existing architecture
- No breaking changes to existing functionality
