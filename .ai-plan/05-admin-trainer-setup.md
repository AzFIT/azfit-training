# Kimi Code — Admin & Trainer Login Setup + Calendar Fix

> **Mission:** Create pre-built login accounts (Admin + Personal Trainer) that work immediately without sign-up. Also fix calendar time range. Do this in CLEAN phases — no spaghetti code.
>
> **Rule:** One phase at a time. Build → Test → Deploy → Next phase.

---

## BEFORE YOU START — Important Rules

1. **One phase at a time** — Finish Phase 1 completely before starting Phase 2
2. **Run `npm run build` after EVERY phase** — must pass with zero errors
3. **No spaghetti code** — Use proper components, utilities, and types. Don't hack things together.
4. **Secure the admin accounts** — These are permanent accounts. Use proper Supabase Auth. Don't hardcode credentials in source code.
5. **After each phase, tell me what was done and confirm it works** before I approve the next phase.

---

## PHASE 1: Calendar Time Range Fix (05:00 — 22:00)

### What to Change
Current calendar shows 00:00 (midnight) start. Change to 05:00. Also cap at 22:00.

### Files to Modify
- `src/pages/CalendarPage.tsx` — find the time range config
- Or check if it's in a calendar component library config (FullCalendar, react-big-calendar, etc.)

### Implementation
```
Current: minTime = 00:00, maxTime = 24:00
New:     minTime = 05:00, maxTime = 22:00
```

### Acceptance Criteria
- [ ] Calendar day view starts at 05:00
- [ ] Calendar day view ends at 22:00
- [ ] Week view also respects 05:00-22:00 range
- [ ] Build passes
- [ ] Deploy and verify on https://azfit.fit/#/calendar

**STOP HERE. Tell me when Phase 1 is done. I'll approve Phase 2.**

---

## PHASE 2: Supabase Admin + Trainer Accounts Setup

### Goal
Create two permanent login accounts that ALWAYS work:

| Role | Email | Purpose |
|------|-------|---------|
| **Admin** | `admin@azfit.fit` | Full platform access — admin dashboard, all clients, all settings |
| **Trainer** | `trainer@azfit.fit` | Personal trainer view — clients, programs, workouts, calendar |

### CRITICAL: How to Handle Passwords (DO NOT hardcode)

**Option A (Recommended):** Use Supabase Dashboard to manually create accounts, then store the credentials securely in an environment variable or a secure config file that is NOT committed to git.

**Option B:** Create a one-time seed script that creates the accounts via Supabase Auth API, then the script is removed/deactivated after first run.

**NEVER DO:**
- ❌ Hardcode passwords in `.tsx` files
- ❌ Store plain text passwords in the codebase
- ❌ Create a "dev backdoor" that bypasses auth
- ❌ Use `btoa()` or any fake hashing

### What I Need From You

Tell me:
1. What are the current Supabase project credentials? (anon key, URL)
2. Should I create the accounts via Supabase Dashboard manually, or do you want a seed script?
3. What passwords should I set? (you choose — I'll use them to create the accounts)

### Files Involved
- `src/lib/supabase.ts` — Supabase client config
- `.env` or `.env.local` — environment variables (NOT committed to git)
- Possibly a one-time seed script: `scripts/seedAccounts.ts`

### Acceptance Criteria
- [ ] Two accounts exist in Supabase Auth (admin@azfit.fit, trainer@azfit.fit)
- [ ] Both accounts have corresponding entries in the `profiles` table
- [ ] Admin account has `role = 'admin'`
- [ ] Trainer account has `role = 'coach'`
- [ ] Both accounts can log in via the login page
- [ ] No passwords are visible in source code
- [ ] Build passes

**STOP HERE. Tell me when Phase 2 is done. I'll approve Phase 3.**

---

## PHASE 3: Auto-Seed Accounts on First Run (Optional but Recommended)

### Problem
If the database is ever reset or a new dev environment is set up, the accounts disappear.

### Solution
Create a seed utility that:
1. Checks if admin/trainer accounts exist on app startup
2. If NOT, creates them automatically using Supabase Auth API
3. Uses environment variables for credentials (not hardcoded)
4. Only runs once — subsequent runs are no-ops

### Implementation Pattern

```typescript
// src/utils/seedAccounts.ts
// This runs once on app mount (in main.tsx or AuthProvider)

import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const TRAINER_EMAIL = import.meta.env.VITE_TRAINER_EMAIL;
const TRAINER_PASSWORD = import.meta.env.VITE_TRAINER_PASSWORD;

export async function seedDefaultAccounts() {
  // Check if accounts exist
  // If not, create them via supabase.auth.signUp()
  // Create corresponding profile rows
  // Log result (but not passwords!)
}
```

### Environment Variables (.env.local)
```env
VITE_ADMIN_EMAIL=admin@azfit.fit
VITE_ADMIN_PASSWORD=your-secure-admin-password
VITE_TRAINER_EMAIL=trainer@azfit.fit
VITE_TRAINER_PASSWORD=your-secure-trainer-password
```

### Files to Create/Modify
- `src/utils/seedAccounts.ts` — seed utility
- `src/contexts/AuthContext.tsx` or `src/main.tsx` — call seed on startup
- `.env.local` — add credentials (add to `.gitignore`!)
- `.gitignore` — ensure `.env.local` is not committed

### Acceptance Criteria
- [ ] Seed utility creates accounts if they don't exist
- [ ] No-op if accounts already exist (idempotent)
- [ ] Credentials come from environment variables
- [ ] `.env.local` is in `.gitignore` (never committed)
- [ ] No passwords in source code
- [ ] Console logs confirm seed status ("Admin account verified" / "Trainer account created")
- [ ] Build passes

**STOP HERE. Tell me when Phase 3 is done. I'll approve Phase 4.**

---

## PHASE 4: Login Page Enhancement — Quick Login Buttons

### Goal
On the login page, add two "Quick Login" buttons for the admin and trainer accounts. This makes testing fast — one click and you're logged in.

### Design
Add a section below the normal login form:

```
─────────────────────────────────
  Or log in as:

  [👤 Log in as Admin]    [👤 Log in as Trainer]

  (For testing and development)
─────────────────────────────────
```

### Implementation
```typescript
// In LoginPage.tsx, add two buttons:

const handleQuickLogin = async (email: string, password: string) => {
  // Read password from environment variable
  // Call supabase.auth.signInWithPassword()
  // Handle redirect on success
};

<button onClick={() => handleQuickLogin(adminEmail, adminPassword)}>
  Log in as Admin
</button>

<button onClick={() => handleQuickLogin(trainerEmail, trainerPassword)}>
  Log in as Trainer
</button>
```

### Files to Modify
- `src/pages/LoginPage.tsx` — add quick login section

### Acceptance Criteria
- [ ] Two "Quick Login" buttons visible on login page
- [ ] "Log in as Admin" logs in as admin@azfit.fit
- [ ] "Log in as Trainer" logs in as trainer@azfit.fit
- [ ] Buttons are clearly labeled with role
- [ ] A note says "For testing and development" (small, gray text)
- [ ] Buttons are styled consistently with the app (cyan/white)
- [ ] Works on both desktop and mobile
- [ ] Build passes
- [ ] Deploy and verify

**STOP HERE. Tell me when Phase 4 is done. I'll approve Phase 5.**

---

## PHASE 5: Admin Route Guards + Dashboard Access

### Goal
Ensure the Admin account can access the Admin Dashboard, and the Trainer account CANNOT.

### What to Check/Implement
1. **AdminGuard already exists** — verify it checks `role === 'admin'`
2. **Admin nav item** — only shows when `role === 'admin'`
3. **Route protection** — `/admin` redirects non-admins to `/dashboard`
4. **Admin dashboard data** — should show ALL clients, not just assigned ones

### Files to Check/Modify
- `src/components/AdminGuard.tsx` — verify role check
- `src/components/Layout.tsx` or `src/components/AppSidebar.tsx` — conditional admin nav
- `src/pages/AdminDashboardPage.tsx` — ensure it loads for admin

### Acceptance Criteria
- [ ] Admin login shows "Admin Dashboard" in sidebar navigation
- [ ] Trainer login does NOT show "Admin Dashboard" in sidebar
- [ ] `/admin` route works for admin
- [ ] `/admin` route redirects trainer to `/dashboard`
- [ ] Admin dashboard loads without errors
- [ ] Build passes

---

## Summary of All Phases

| Phase | What | Est. Time | Complexity |
|-------|------|-----------|------------|
| 1 | Calendar 05:00-22:00 | 30 min | Low |
| 2 | Create Supabase accounts (admin + trainer) | 30 min | Medium |
| 3 | Auto-seed utility | 1 hour | Medium |
| 4 | Quick login buttons | 1 hour | Low |
| 5 | Admin route guards | 30 min | Low |
| | **Total** | **~4 hours** | |

---

## Golden Rules (Read Before Every Phase)

1. **One phase at a time** — Do NOT start Phase N until Phase N-1 is approved
2. **Build → Test → Deploy → Confirm** — Every phase
3. **No spaghetti code** — Use proper components, types, and utilities
4. **No hardcoded passwords in source** — Environment variables only
5. **`npm run build` must pass** — Zero errors, zero warnings
6. **Tell me what you did** — Summary of changes after each phase
7. **Ask if unclear** — Don't guess, confirm

---

*Phase 5 of AzFIT Integration Plan*
*Admin & Trainer Account Setup*
