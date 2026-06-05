# AzFIT Landing Page Components

Two standalone, self-contained HTML components extracted from the AzFIT landing page.

---

## What's Included

| File | Description | Preview |
|------|-------------|---------|
| `AzFIT_Hero_Orb.html` | Hero section with the AzFIT logo inside an animated circular orb | Giant glowing cyan orb with rotating wireframe rings, orbiting dots, and the AzFIT "A" logo in the center |
| `AzFIT_AI_Showcase.html` | "AI That Coaches With You" section with rotating icons | Central brain icon with 8 orbiting skill icons (dumbbell, heart, chart, calendar, etc.) that rotate around it, plus floating coaching cue cards and data stream ticker |

---

## How to Use

### Option 1: Copy-paste into your existing website

1. Open either HTML file in a browser to see it
2. Copy the `<style>` block into your site's CSS
3. Copy the HTML structure into your page
4. Adapt colors/fonts to match your site

### Option 2: Use as an iframe

```html
<iframe src="AzFIT_Hero_Orb.html" style="width:100%;height:100vh;border:none;"></iframe>
```

### Option 3: Extract just the orb (no text)

The orb is contained inside `.orb-wrapper` (Hero) or `.ai-visual-inner` (AI Showcase). You can copy just that div + the CSS for it.

---

## Customization

### Replace the Logo

**In `AzFIT_Hero_Orb.html`, find this section:**

```html
<div class="orb-logo">
  <!-- REPLACE THIS SVG WITH YOUR OWN LOGO -->
  <svg viewBox="0 0 200 200">...</svg>
</div>
```

**Option A — Use an image:**
```html
<div class="orb-logo">
  <img src="./your-logo.png" alt="Your Brand" style="width:100%;height:100%;object-fit:contain;">
</div>
```

**Option B — Use your SVG:**
Replace the inline SVG with your own logo SVG code.

### Change Colors

The orb uses these CSS custom properties (find/replace in the CSS):

| Color | Used For | Default |
|-------|----------|---------|
| `#00AEEF` | Primary cyan — orb glow, borders, hotspots | Cyan |
| `#3B82F6` | Secondary blue — inner core, orbiting dots | Blue |
| `#030712` | Page background (top) | Near-black |
| `#111827` | Page background (bottom) | Dark blue-gray |

### Change Orbiting Icons (AI Showcase)

In the `<script>` section of `AzFIT_AI_Showcase.html`, find the `skillIcons` array. Replace the SVG strings with your own icons.

---

## Animations Included

| Animation | Duration | Effect |
|-----------|----------|--------|
| `orb-breathe` | 4s | Subtle scale pulse (1.0 → 1.03) |
| `pulse-ring` | 3s | Expanding ring that fades out |
| `rotate-wireframe` | 10-20s | Rotating wireframe rings inside orb |
| `spin-slow` | 20-30s | Slow rotation of orbiting elements |
| `cue-fade` | 4s | Coaching cue card text rotation |
| `ticker-scroll` | 40-55s | Infinite horizontal text scroll |

All animations are pure CSS (no JavaScript animation libraries needed).

---

## Dependencies

**None.** Both files are 100% self-contained with:
- All CSS embedded in `<style>`
- All SVG icons inline (no icon font needed)
- No external images, fonts, or libraries
- Only dependency: Lucide icons for the AI showcase ring (already inlined as SVG)

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Uses CSS `mask-image`, `backdrop-filter`, and CSS animations — all widely supported.
