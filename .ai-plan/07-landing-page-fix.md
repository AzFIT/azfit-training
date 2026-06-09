# Kimi Code — Landing Page Fix: Text Visibility & Animation Bugs

> **Mission:** Fix ALL text visibility issues and broken scroll animations on the AzFIT landing page. This is the #1 customer-facing page — it must be flawless.
>
> **Do this in 3 phases. ONE phase at a time.**

---

## CRITICAL ISSUES FOUND (from screenshots)

### Issue 1: Headings Completely Invisible on Dark Backgrounds

These headings use dark text on a near-black background — they are 100% invisible to visitors:

| Section | Text That Should Show | Current Problem |
|---------|----------------------|-----------------|
| Stats bar | "63+ Active Trainers", "6+ Expert Trainers", "1,259+ Training Completed" | Text is dark gray (#111 or similar) on black background — unreadable |
| Journey section | "Your Journey to Better Results" | Title heading is invisible (dark text on dark bg) |
| Trainer/Client section | "Built for Trainers & Clients" | Title heading is invisible (dark text on dark bg) |
| Footer | Footer links under "Resources" and "Company" | All links are invisible against dark background |

**Root cause:** These elements likely have `text-gray-900`, `text-black`, or a hardcoded dark color that matches the background. They need to be `text-white`, `text-gray-100`, or `#F0F0F0`.

### Issue 2: Feature Cards Flash and Disappear on Scroll

| Section | What Happens | What Should Happen |
|---------|-------------|-------------------|
| Feature cards (Progress Tracking, Program Design, Nutrition Management) | Cards briefly appear, then disappear when scrolling past | Cards should fade in ONCE and STAY visible |
| Journey section ("Your Journey to Better Results") | Section heading and cards flash briefly, then vanish | Should fade in ONCE and remain visible |
| "Built for Trainers & Clients" cards | Cards appear then disappear | Should stay visible after animating in |

**Root cause:** Framer Motion `AnimatePresence` with incorrect `exit` animations, or `whileInView` re-triggering when elements scroll out of view. The animation is likely set to `once: false` (re-triggers every time it enters viewport) or has a conflicting exit animation.

### Issue 3: Dark Card Text Too Faint

| Element | Problem |
|---------|---------|
| "Elevate Your Training Business" card | Description text is too dark against the card's dark background |
| Journey floating icons | 3 icons appear disconnected, floating above empty space before cards appear |
| Stats bar labels | Sub-labels under numbers are barely readable |

---

## PHASE 1: Fix ALL Invisible Text (Color Fixes)

### Step 1.1: Stats Bar — Make Numbers and Labels Visible

Find the stats bar section in `src/pages/LandingPage.tsx` (or wherever the landing page is). Look for the section showing:
- "63+" / "Active Trainers"
- "6+" / "Expert Trainers"  
- "1,259+" / "Training Completed"

**Fix:** Change all text in this section to white/light colors:

```tsx
// BEFORE (broken — dark text on dark bg):
<span className="text-4xl font-bold text-gray-900">63+</span>
<span className="text-sm text-gray-700">Active Trainers</span>

// AFTER (fixed — white text on dark bg):
<span className="text-4xl font-bold text-white">63+</span>
<span className="text-sm text-gray-300">Active Trainers</span>
```

If these are inside white/light cards on a dark section, the text should be dark. If they're directly on the dark background, they MUST be white.

### Step 1.2: "Your Journey to Better Results" Heading

Find the heading text "Your Journey to Better Results" in the landing page code.

**Fix:**
```tsx
// BEFORE (invisible):
<h2 className="... text-gray-900 ...">Your Journey to Better Results</h2>

// AFTER (visible):
<h2 className="... text-white ...">Your Journey to Better Results</h2>
```

Also check the subtitle/description text under this heading — it should be `text-gray-300` or `text-gray-400`.

### Step 1.3: "Built for Trainers & Clients" Heading

Find the heading "Built for Trainers & Clients" and the description text under it.

**Fix:**
```tsx
// BEFORE:
<h2 className="... text-gray-800 ...">Built for Trainers & Clients</h2>
<p className="... text-gray-600 ...">...</p>

// AFTER:
<h2 className="... text-white ...">Built for Trainers & Clients</h2>
<p className="... text-gray-300 ...">...</p>
```

### Step 1.4: Footer Links

Find the footer section. The links under "Resources" and "Company" are invisible.

**Fix:**
```tsx
// BEFORE:
<a className="... text-gray-800 hover:text-gray-600 ...">Features</a>

// AFTER:
<a className="... text-gray-400 hover:text-white ...">Features</a>
```

Also check footer column headers ("Product", "Resources", "Company") — should be white.

### Step 1.5: "Elevate Your Training Business" Card Text

The trainer/client cards have text that's too dark. Ensure card text is readable:

```tsx
// Card title should be white or very light:
<h3 className="text-white font-bold text-xl">Elevate Your Training Business</h3>

// Card description should be light gray:
<p className="text-gray-300 text-sm">Manage clients, design science-based programs...</p>

// Card badge "FOR TRAINERS" should be visible:
<span className="text-[#00AEEF] text-xs font-medium uppercase tracking-wider">For Trainers</span>
```

### Step 1.6: Global Check

Search the entire landing page file for these color classes that would be invisible on dark backgrounds:

```bash
grep -n "text-gray-900\|text-black\|text-gray-800\|text-gray-700" src/pages/LandingPage.tsx
```

For EACH match, determine:
- Is it on a dark background? → Change to `text-white` or `text-gray-200`
- Is it on a light/white background? → Keep as-is

**Acceptance Criteria:**
- [ ] Stats bar numbers and labels are clearly readable
- [ ] "Your Journey to Better Results" heading is visible
- [ ] "Built for Trainers & Clients" heading is visible
- [ ] Footer links under all columns are visible
- [ ] "Elevate Your Training Business" card text is readable
- [ ] No dark-gray text remains on dark backgrounds
- [ ] Build passes

**STOP HERE. Tell me when Phase 1 is done. I'll approve Phase 2.**

---

## PHASE 2: Fix Flashing/Disappearing Animations

### The Problem

Framer Motion sections are using `whileInView` animations that re-trigger or have conflicting `exit` states. When a user scrolls past, the elements animate OUT and disappear.

### Step 2.1: Fix Feature Cards (Progress Tracking, Program Design, Nutrition Management)

Find the Framer Motion animation for the 3 feature cards. Look for code like:

```tsx
// BROKEN PATTERN (do NOT use this):
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -50 }}  // ← THIS IS THE BUG
  viewport={{ once: false }}      // ← THIS RE-TRIGGERS
>
```

**Fix:** Remove `exit` animation and set `once: true`:

```tsx
// FIXED:
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}  // once = never re-triggers
  transition={{ duration: 0.6, ease: "easeOut" }}
>
```

Key changes:
- `viewport={{ once: true }}` — animates in once, stays visible forever
- Remove any `exit={{ ... }}` prop — don't let it animate out
- `amount: 0.3` — triggers when 30% of element is visible (good for cards)

### Step 2.2: Fix "Your Journey to Better Results" Section

Same fix pattern — find the motion wrapper for this entire section:

```tsx
// BEFORE (broken):
<motion.section
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: false }}  // ← re-triggers
>

// AFTER (fixed):
<motion.section
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.8 }}
>
```

Also fix the 3 floating icons above this section — they should animate in with the section, not separately.

### Step 2.3: Fix "Built for Trainers & Clients" Section

Same pattern:

```tsx
// BEFORE:
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: false }}
  exit={{ opacity: 0 }}  // ← removes element!
>

// AFTER:
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.6 }}
>
```

### Step 2.4: Global Animation Audit

Search for ALL Framer Motion `whileInView` usage in the landing page:

```bash
grep -n "whileInView\|viewport" src/pages/LandingPage.tsx
```

For EACH occurrence:
1. Check if `once: true` is set on the viewport prop
2. Check if `exit` prop exists — remove it
3. Verify `amount` is reasonable (0.2-0.4)

**Acceptance Criteria:**
- [ ] Feature cards (Progress Tracking, Program Design, Nutrition Management) fade in ONCE and stay visible
- [ ] "Your Journey to Better Results" section fades in ONCE and stays visible
- [ ] Journey floating icons animate in WITH the section, not separately
- [ ] "Built for Trainers & Clients" cards stay visible after scrolling past
- [ ] No section disappears after appearing
- [ ] All animations still feel smooth and professional
- [ ] Build passes

**STOP HERE. Tell me when Phase 2 is done. I'll approve Phase 3.**

---

## PHASE 3: Polish & Additional Improvements

### Step 3.1: Consistent Section Spacing

Add consistent padding between sections. The current page has large uneven gaps:

```tsx
// Add to each major section:
<section className="py-20 md:py-28 lg:py-32">
```

### Step 3.2: Smooth Section Transitions

Add subtle gradient dividers between dark sections to create flow:

```tsx
// Between dark sections, add a subtle gradient divider:
<div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
```

### Step 3.3: Journey Icons — Connect to Content

The 3 floating icons above "Your Journey to Better Results" appear disconnected. Either:
- Remove them if they don't serve a purpose
- Or animate them INTO the section as part of the card reveal (not separately above)

### Step 3.4: Stats Bar — Add Visual Polish

Make the stats bar more prominent:
- Add subtle border: `border-y border-gray-800`
- Add background: `bg-[#0a0e17]/80 backdrop-blur-sm` (sticky effect)
- Ensure numbers have `font-mono` for a data-driven feel
- Consider adding a subtle animation (count-up from 0 on first view)

### Step 3.5: Testimonial Card Style Fix

The testimonial card (Screenshot 7) has a white card on dark background which looks inconsistent with the rest of the page. Change to:

```tsx
// Dark card to match page theme:
<div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8">
  <p className="text-gray-300 italic text-lg">"I've seen a 22% improvement..."</p>
  <p className="text-white font-semibold mt-4">Michael T.</p>
  <p className="text-gray-500 text-sm">AzFIT Client</p>
</div>
```

### Step 3.6: Final Visual Test

Scroll through the ENTIRE landing page and verify:
1. Every heading is visible
2. Every body text is readable
3. Every button is clickable and visible
4. No section disappears after appearing
5. Animations are smooth (not jarring)
6. The page feels cohesive, not disjointed

**Acceptance Criteria:**
- [ ] Consistent spacing between all sections
- [ ] Stats bar has visual polish (border, background)
- [ ] Journey icons are connected to content
- [ ] Testimonial card matches dark theme
- [ ] Entire page scrolls smoothly with no visual glitches
- [ ] Build passes
- [ ] Deploy and verify on https://azfit.fit

---

## Golden Rules

1. **ONE phase at a time** — Do NOT start Phase N until Phase N-1 is approved
2. **Run `npm run build` after EVERY phase** — zero errors
3. **Test by scrolling** through the entire landing page after each phase
4. **Default to `text-white` for text on dark backgrounds**
5. **Default to `text-gray-400` for secondary text on dark backgrounds**
6. **Never use `text-gray-900` or `text-black` on dark backgrounds**
7. **Framer Motion: always use `viewport={{ once: true }}`** for landing page sections
8. **Remove ALL `exit` animations** from landing page motion components
9. **Tell me what you did** — Summary of changes after each phase

---

## Quick Reference: Color Fixes Cheat Sheet

```
DARK BACKGROUND SECTIONS (use these):
  Primary text:     text-white        or  #F0F0F0
  Secondary text:   text-gray-300     or  #A0A0A0
  Muted text:       text-gray-500     or  #6B6B6B
  Accent:           text-[#00AEEF]    (cyan)
  
NEVER USE on dark backgrounds:
  text-black
  text-gray-900
  text-gray-800
  text-gray-700

LIGHT/WHITE BACKGROUND SECTIONS (keep as-is):
  Primary text:     text-gray-900     or  text-black
  Secondary text:   text-gray-600
  Muted text:       text-gray-400
```

---

*Phase 7 of AzFIT Integration Plan*
*Landing Page Critical Fix*
