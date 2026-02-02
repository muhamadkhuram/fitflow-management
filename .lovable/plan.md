
# M4Gym - Rebranding and Flow Improvements

## Summary
Remove the landing page, redirect users directly to authentication or dashboard, rebrand from "GymFlow" to "M4Gym", and continue improving the application flow.

---

## Changes Overview

### 1. Remove Landing Page and Update Routing
- Change the root route (`/`) to redirect authenticated users to dashboard, and non-authenticated users to the auth page
- Delete the Landing.tsx page (no longer needed)
- Update Settings page signOut to redirect to `/auth` instead of `/`

### 2. Rebrand to M4Gym
Update branding across all files:
- **Logo component**: Change "GymFlow" to "M4Gym" 
- **Auth page**: Update welcome text
- **Dashboard**: Update welcome messages
- **index.html**: Update title and meta tags
- **Landing page references**: Update any remaining mentions

### 3. Flow Improvements
- **GymProfile page**: Fix the useState hook issue (currently using useState incorrectly for side effects - should use useEffect)
- **Dashboard sidebar**: Show actual user name instead of hardcoded "Gym Owner"
- **Auth redirect**: After successful sign-in, smoothly redirect to dashboard

---

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Update root route to show Auth or redirect to Dashboard |
| `src/components/Logo.tsx` | Change "GymFlow" to "M4Gym" |
| `src/pages/Auth.tsx` | Update text references to M4Gym |
| `src/pages/Dashboard.tsx` | Update "Welcome to GymFlow" to "Welcome to M4Gym" |
| `src/pages/Settings.tsx` | Redirect to `/auth` on signOut |
| `src/components/DashboardSidebar.tsx` | Display actual user email/name |
| `src/pages/GymProfile.tsx` | Fix useState to useEffect for data sync |
| `index.html` | Update title and meta tags to M4Gym |

### File to Delete

| File | Reason |
|------|--------|
| `src/pages/Landing.tsx` | No longer needed - direct auth flow |

### Routing Changes

```text
Current Flow:
/ (Landing) → /auth → /dashboard

New Flow:  
/ (redirects based on auth state)
  ├─ If authenticated → /dashboard
  └─ If not authenticated → /auth
```

### GymProfile Fix
The current code incorrectly uses `useState` to sync data:
```typescript
// Current (incorrect)
useState(() => {
  if (activeGym) { setFormData(...) }
});

// Fixed (correct)
useEffect(() => {
  if (activeGym) { setFormData(...) }
}, [activeGym]);
```

---

## Implementation Sequence

1. Update branding in Logo, Auth, Dashboard, and index.html
2. Create redirect logic in App.tsx for root route
3. Fix GymProfile useEffect issue
4. Update DashboardSidebar to show user info
5. Delete Landing.tsx
6. Update Settings signOut redirect
