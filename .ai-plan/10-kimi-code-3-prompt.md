# ═══════════════════════════════════════════════════════════════
# 🤖 YOU ARE KIMI CODE 3 — AZFIT LANDING PAGE + SETTINGS + QUICK FIXES
# ═══════════════════════════════════════════════════════════════

> Your exclusive focus: Fix the AzFIT landing page (invisible text, broken animations), build the Settings page, and handle quick audit fixes.
>
> You are ONE of three Kimi Code instances working in parallel:
> - **Kimi Code 1** = Program Builder v2 (building `/program-builder`)
> - **Kimi Code 2** = Nutrition & Meal Planner (building nutrition features)
> - **YOU = Kimi Code 3** = Landing Page + Settings + Quick Fixes
>
> **Do NOT touch files owned by Kimi Code 1 or Kimi Code 2.**

---

## 🚫 FILES YOU MUST NOT TOUCH

| Owner | Files/Routes | Why |
|-------|-------------|-----|
| **Kimi Code 1** | `src/components/program-builder-v2/`, `/program-builder` route, `src/pages/ProgramBuilderLandingPage.tsx`, `src/pages/ProgramWizardPage.tsx` | They are building the new program builder |
| **Kimi Code 2** | `src/pages/NutritionPage.tsx`, `src/components/nutrition/`, anything in `/nutrition` route | They are building meal planner features |

**If you need to add routes in `App.tsx`**, only add routes for YOUR features (landing page polish, settings). Do not touch `/program-builder` or `/nutrition` routes.

---

## ✅ YOUR EXCLUSIVE DOMAIN

```
src/pages/LandingPage.tsx          ← Fix invisible text + broken animations
src/pages/SettingsPage.tsx         ← Build/test all 5 tabs (34 untested elements)
src/components/AppSidebar.tsx      ← Fix broken Help link
src/components/Layout.tsx          ← Sidebar/structure fixes if needed
src/pages/DashboardPage.tsx        ← Quick polish (KPI cards, alerts) — if time
```

---

## 📋 READ THIS FIRST

Before starting, read these reference files:

| File | What It Contains |
|------|-----------------|
| `C:\Users\85254\Documents\azfit-training-main\.ai-plan\07-landing-page-fix.md` | Full landing page fix instructions (invisible text + animations) |
| `C:\Users\85254\Documents\azfit-training-main\.ai-plan\08-xlsx-audit-analysis.md` | XLSX audit breakdown — see "Settings" section for 34 untested elements |

---

## PHASE 1: Fix Invisible Text on Landing Page

### The Problem
Multiple headings and text elements on the AzFIT landing page are **completely invisible** because they use dark text (`text-gray-900`, `text-black`) on a dark background.

### Elements to Fix

| # | Element | Current (Broken) | Fix To |
|---|---------|-----------------|--------|
| 1 | Stats bar numbers (63+, 6+, 1,259+) | `text-gray-900` or similar dark | `text-white font-bold` |
| 2 | Stats bar labels ("Active Trainers" etc.) | Dark text | `text-gray-400` |
| 3 | "Your Journey to Better Results" heading | `text-gray-900` or dark | `text-white` |
| 4 | "Your Journey" subtitle/description | Dark text | `text-gray-300` |
| 5 | "Built for Trainers & Clients" heading | `text-gray-800` or dark | `text-white` |
| 6 | "Built for Trainers" description | `text-gray-600` | `text-gray-300` |
| 7 | Footer links (Privacy/Terms/Contact/Resources/Company) | `text-gray-800` or dark | `text-gray-400 hover:text-white` |
| 8 | Footer column headers ("Product", "Resources", "Company") | Dark text | `text-white font-semibold` |
| 9 | "Elevate Your Training Business" card text | Too dark | `text-gray-300` |

### How to Find All Issues

Run this search in the landing page file:
```bash
grep -n "text-gray-900\|text-black\|text-gray-800\|text-gray-700" src/pages/LandingPage.tsx
```

For each match, determine:
- **On dark background?** → Change to `text-white` or `text-gray-300`
- **On light/white background?** → Keep as-is

### Golden Rule
> **On dark backgrounds: NEVER use text-black, text-gray-900, text-gray-800, or text-gray-700. Always use `text-white`, `text-gray-200`, or `text-gray-300`.**

### Acceptance Criteria
- [ ] Stats bar numbers and labels are clearly readable
- [ ] "Your Journey to Better Results" heading is visible
- [ ] "Built for Trainers & Clients" heading is visible
- [ ] Footer links under all columns are visible
- [ ] "Elevate Your Training Business" card text is readable
- [ ] No dark-gray text remains on dark backgrounds
- [ ] `npm run build` passes with zero errors

**STOP HERE. Tell me what you changed. I'll approve Phase 2.**

---

## PHASE 2: Fix Disappearing Scroll Animations

### The Problem
Feature cards and section headings **flash briefly then disappear** when scrolling. This is caused by Framer Motion `whileInView` with `once: false` + `exit` animations.

### The Fix Pattern

Find ALL Framer Motion `whileInView` usage in `src/pages/LandingPage.tsx`. For each one:

```tsx
// ❌ BROKEN (causes flash then disappear):
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -50 }}          // ← REMOVE THIS
  viewport={{ once: false }}             // ← CHANGE TO true
>

// ✅ FIXED (animates in once, stays visible forever):
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }} // ← once: true!
  transition={{ duration: 0.6, ease: "easeOut" }}
>
```

### Elements to Fix

| Element | Problem |
|---------|---------|
| Feature cards (Progress Tracking, Program Design, Nutrition Management) | Flash then vanish — `once: false` + `exit` prop |
| "Your Journey to Better Results" section | Same issue — flashes then gone |
| Journey floating icons | Animate separately, appear disconnected |
| "Built for Trainers & Clients" cards | Appear then disappear |

### Search Command
```bash
grep -n "whileInView\|exit={\|once:" src/pages/LandingPage.tsx
```

For each result:
1. ✅ Ensure `viewport={{ once: true }}` (never `once: false`)
2. ✅ Remove any `exit={{ ... }}` prop entirely
3. ✅ Add `transition={{ duration: 0.6 }}` for smoothness

### Acceptance Criteria
- [ ] Feature cards fade in ONCE and stay visible after scrolling past
- [ ] "Your Journey" section fades in ONCE and stays visible
- [ ] Journey icons animate WITH the section (not separately)
- [ ] "Built for Trainers & Clients" cards stay visible
- [ ] No section disappears after appearing
- [ ] Animations still feel smooth and professional
- [ ] `npm run build` passes

**STOP HERE. Tell me what you changed. I'll approve Phase 3.**

---

## PHASE 3: Settings Page (34 Untested Elements)

### The Problem
The Settings page has 34 UI elements — **zero are tested/verified**. It may render but hasn't been functionally checked.

### What to Build/Test

The Settings page should have **5 tabs**:

#### Tab 1: Profile
| Element | Type | What It Should Do |
|---------|------|-------------------|
| Avatar upload | Button | Placeholder for now (simulated) |
| Full Name input | Input | Updates state, saves to localStorage |
| Business Name input | Input | Updates state, saves to localStorage |
| Email input | Input | Updates state, validates email |
| Phone input | Input | Updates state |
| Bio textarea | Textarea | Updates state |
| [Save Changes] button | Button | Saves all profile data to localStorage |

#### Tab 2: Appearance
| Element | Type | What It Should Do |
|---------|------|-------------------|
| Theme toggle [Light/Dark/System] | Button | Updates theme store (already built) |
| Sidebar mode [Expanded/Collapsed/Auto] | Button | Updates sidebar preference |
| Accent color swatches (×8) | Button | Sets accent color in Tailwind config |
| Font Size [Small/Medium/Large] | Button | Sets font size class |
| [Save Preferences] | Button | Saves to localStorage |

#### Tab 3: Notifications
| Element | Type | What It Should Do |
|---------|------|-------------------|
| Toggle switches (×6 types × 2 channels) | Switch | Updates notification preferences |
| Types: New Client, Session Booking, Payment, Assessment Due, Milestone, System | | |
| Channels: In-App, Email | | |
| Quiet hours time range | Input | Sets quiet hours (no notifications) |
| [Save Preferences] | Button | Saves to localStorage |

#### Tab 4: Security
| Element | Type | What It Should Do |
|---------|------|-------------------|
| Current password input | Input | Updates state |
| New password input | Input | Updates state |
| Confirm password input | Input | Match check with new password |
| Show/hide password toggles | Button | Toggles visibility |
| 2FA toggle | Switch | Mock enable/disable (placeholder) |
| Active sessions list | Static | Display only (mock data) |
| [Revoke] per session | Button | Removes session from list |
| [Update Password] | Button | Validates + shows success toast |

#### Tab 5: Data
| Element | Type | What It Should Do |
|---------|------|-------------------|
| [Export Clients as CSV] | Button | Generates CSV download (mock) |
| [Export Sessions as CSV] | Button | Generates CSV download (mock) |
| [Backup Now] | Button | Creates localStorage backup |
| [Clear All Data] | Button | Opens confirmation dialog |
| Confirm Clear (dialog) | Dialog | Clears all localStorage on confirm |
| [Reset App] | Button | Opens confirmation dialog |

### File Structure
```
src/pages/SettingsPage.tsx              ← Main settings page with tabs
src/components/settings/
├── ProfileTab.tsx
├── AppearanceTab.tsx
├── NotificationsTab.tsx
├── SecurityTab.tsx
└── DataTab.tsx
```

### Acceptance Criteria
- [ ] All 5 tabs render correctly
- [ ] Tab switching works smoothly
- [ ] Profile inputs update state
- [ ] [Save Changes] saves to localStorage
- [ ] Appearance theme toggle works
- [ ] Notification toggles update state
- [ ] Security password match validation works
- [ ] Data export buttons trigger download (mock is fine)
- [ ] Clear All Data shows confirmation dialog
- [ ] `npm run build` passes

**STOP HERE. Tell me what you built. I'll approve Phase 4.**

---

## PHASE 4: Quick Audit Fixes

### Fix 1: Broken Help Sidebar Link
- **Problem:** Sidebar "Help" links to `/help` which is a 404
- **Fix:** Either:
  - Option A: Create a simple `src/pages/HelpPage.tsx` (placeholder is fine)
  - Option B: Remove the Help link from sidebar
  - Option C: Change link to external URL or `#`

### Fix 2: Landing Page Polish (if time)
- Change testimonial card from white to dark theme (`bg-[#141414] border-[#2A2A2A]`)
- Ensure consistent section spacing (`py-20 md:py-28`)
- Make stats bar more prominent with `border-y border-gray-800`

### Fix 3: Dashboard Quick Polish (if time)
- Add severity-colored left borders to alert items (red=urgent, yellow=warning, blue=info)
- Change alert timestamps to relative format ("2h ago" instead of "5 day")

### Acceptance Criteria
- [ ] Help link no longer 404s
- [ ] Testimonial card matches dark theme
- [ ] `npm run build` passes

**STOP HERE. This completes your assignment.**

---

## 📊 YOUR COMPLETE CHECKLIST

| Phase | What | Est. Time |
|-------|------|-----------|
| 1 | Fix invisible text on Landing Page | 1-2 hours |
| 2 | Fix disappearing scroll animations | 1-2 hours |
| 3 | Build/test Settings page (5 tabs) | 4-6 hours |
| 4 | Quick audit fixes (Help link, polish) | 1-2 hours |
| | **Total** | **7-12 hours** |

---

## 🎯 REMEMBER

1. **You are Kimi Code 3.** Your domain is Landing Page + Settings + Quick Fixes.
2. **Do NOT touch Program Builder files.** That's Kimi Code 1's job.
3. **Do NOT touch Nutrition files.** That's Kimi Code 2's job.
4. **ONE phase at a time.** Stop and confirm after each phase.
5. **Run `npm run build` after EVERY phase.** Zero errors.
6. **Tell me what you changed** — file names and line numbers.
7. **Ask if unclear.** Don't guess.

---

## 📁 WHERE TO WRITE YOUR FILES

```
C:\Users\85254\Documents\azfit-training-main\src\pages\LandingPage.tsx          (modify)
C:\Users\85254\Documents\azfit-training-main\src\pages\SettingsPage.tsx         (modify/build)
C:\Users\85254\Documents\azfit-training-main\src\components\settings\           (create folder + files)
C:\Users\85254\Documents\azfit-training-main\src\components\AppSidebar.tsx      (modify - Help link)
C:\Users\85254\Documents\azfit-training-main\src\App.tsx                        (add routes if needed)
```

---

**Start with Phase 1 now. Good luck! 🚀**

*Kimi Code 3 — AzFIT Landing Page + Settings + Quick Fixes*
*Assigned: June 2026*
