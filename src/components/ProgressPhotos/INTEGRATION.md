# AzFIT Progress Photos — Integration Guide

This document explains how to wire the **Progress Photos** feature into the
existing `ClientProfile` component (12 tabs → 13 tabs).

---

## 1. Add the Progress Photos Tab

### a) Import the tab component + icon

Open `src/components/ClientProfile.tsx` (or wherever the tabs array lives)
and add the following imports:

```tsx
// ---- Add these two imports ----
import { Camera } from 'lucide-react';
import { ProgressPhotosTab } from './ProgressPhotos';
```

### b) Insert the 13th tab object

Locate the `tabs` array (usually near the top of the component or in a
static config object). It currently contains 12 entries such as:
`Overview`, `Assessments`, `Workouts`, `Nutrition`, `Goals`, …

**Add the new tab object immediately after the `Goals` entry:**

```typescript
const tabs = [
  // … existing tabs 1-11 …

  // --- GOALS (tab 12) ---
  {
    id: 'goals',
    label: 'Goals',
    icon: Target,
    component: GoalsTab,
  },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  INSERT THIS BLOCK — Progress Photos (tab 13)               ║
  // ╚══════════════════════════════════════════════════════════════╝
  {
    id: 'progress-photos',
    label: 'Progress Photos',
    icon: Camera,
    component: ProgressPhotosTab,
  },
];
```

> **Note:** The `id` value `'progress-photos'` is used as the tab slug.
> If your router uses hash / query-string routing (e.g. `?tab=goals`),
> this id becomes the active param automatically.

### c) Pass props in the tab renderer

Most tab panels render via a loop:

```tsx
{tabs.map((tab) => (
  <TabsContent key={tab.id} value={tab.id} className="mt-0 p-6">
    <tab.component
      clientId={clientId}
      // ... other props
    />
  </TabsContent>
))}
```

Update the prop-spread so that `ProgressPhotosTab` receives its required
props:

```tsx
{tabs.map((tab) => (
  <TabsContent key={tab.id} value={tab.id} className="mt-0 p-6">
    {tab.id === 'progress-photos' ? (
      <ProgressPhotosTab
        clientId={clientId}
        clientName={clientName}      // optional: shown in header
        isTrainer={userRole === 'trainer'} // or however you determine role
      />
    ) : (
      <tab.component clientId={clientId} />
    )}
  </TabsContent>
))}
```

If all tab components accept `clientId` (and optionally `clientName`,
`isTrainer`) you can simplify to a single render path — just ensure the
three props are available.

---

## 2. Router / URL Sync (if applicable)

If `ClientProfile` syncs the active tab to the URL (e.g. `?tab=assessments`):

- No additional route registration is needed.
- Visiting `?tab=progress-photos` will activate the new tab automatically
  because the tab `id` matches the query parameter.

If your router uses explicit route definitions, add:

```tsx
// React Router example
<Route path="client/:clientId" element={<ClientProfile />}>
  {/* child routes if you use nested route tabs */}
  <Route path="progress-photos" element={<ProgressPhotosTab />} />
</Route>
```

---

## 3. Add the Barrel Export (if not already present)

Ensure `src/components/index.ts` (or `src/components/ProgressPhotos/index.ts`)
re-exports everything so other modules can import cleanly:

```typescript
// src/components/index.ts
export * from './ProgressPhotos';
```

The barrel file already lives at `src/components/ProgressPhotos/index.ts`
and exports:

| Export             | What it is                                         |
| ------------------ | -------------------------------------------------- |
| `ProgressPhotos`   | Main container — orchestrates all sub-components   |
| `ProgressPhotosTab`| Tab wrapper — drop this into the tabs array        |
| `PhotoGallery`     | Grid view of photos                                |
| `PhotoComparison`  | Side-by-side comparison mode                       |
| `PhotoUpload`      | Drag-and-drop upload flow                          |
| `PhotoCard`        | Individual photo card (used by Gallery)            |
| `PhotoFilterBar`   | Category / date / milestone filter controls        |
| `PhotoLightbox`    | Full-screen photo viewer overlay                   |
| `TrainerAnnotation`| Inline trainer note editor                         |
| `usePhotoStore`    | Zustand store — photo state management             |
| `demoPhotos`       | Seed data for Storybook / dev testing              |
| `types`            | All shared TypeScript interfaces & type aliases    |

---

## 4. Props Reference

### `ProgressPhotosTabProps`

| Prop        | Type      | Required | Description                                           |
| ----------- | --------- | -------- | ----------------------------------------------------- |
| `clientId`  | `string`  | Yes      | Client document id — drives photo loading & upload    |
| `clientName`| `string`  | No       | Display name rendered in the header                   |
| `isTrainer` | `boolean` | No       | Enables trainer annotation tools when `true`          |

### `ProgressPhotosProps` (internal)

| Prop        | Type      | Required | Description                                           |
| ----------- | --------- | -------- | ----------------------------------------------------- |
| `clientId`  | `string`  | Yes      | Client document id                                    |
| `clientName`| `string`  | No       | Display name rendered in the header                   |
| `isTrainer` | `boolean` | No       | Enables trainer annotation tools when `true`          |

---

## 5. Quick Checklist

- [ ] `Camera` icon imported from `lucide-react` in `ClientProfile.tsx`
- [ ] `ProgressPhotosTab` imported from `@/components/ProgressPhotos`
- [ ] Tab object added to the `tabs` array (13th position, after Goals)
- [ ] Props `clientId`, `clientName`, `isTrainer` passed to tab component
- [ ] Barrel export `export * from './ProgressPhotos'` present in
      `src/components/index.ts` (or equivalent)
- [ ] No new routes needed if tab system uses id-based query params

---

## 6. Architecture Overview

```
ClientProfile (existing)
└── Tabs (shadcn Tabs)
    └── TabsContent value="progress-photos"
        └── ProgressPhotosTab              ← thin wrapper, cancels tab padding
            └── ProgressPhotos             ← main orchestrator
                ├── PhotoFilterBar         ← category / date / milestone filters
                ├── <AnimatePresence>
                │   ├── PhotoGallery       ← grid view (default)
                │   ├── PhotoComparison    ← side-by-side compare
                │   └── PhotoUpload        ← drag-and-drop upload
                └── PhotoLightbox (portal) ← fixed overlay, full-screen viewer
```

**State management**: A single Zustand store (`usePhotoStore`) owns all
photo state — filtering, sorting, selection, upload, trainer notes. The
container (`ProgressPhotos`) reads from the store and passes derived data
to child components via props. Children dispatch actions back through the
store (never through prop callbacks).

---

## 7. Troubleshooting

| Symptom                             | Fix                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------ |
| Double padding inside tab panel     | `ProgressPhotosTab` already applies `-m-6` to cancel parent `p-6`       |
| Tab not appearing                   | Verify the tab object was actually pushed into the `tabs` array          |
| Photos not loading                  | Check that `clientId` is non-empty and the store `loadPhotos()` action   |
|                                     | resolves correctly (look at network tab for API call)                    |
| "Camera is not defined" error       | Add `Camera` to the `lucide-react` import in `ClientProfile`             |
| Compare button disabled             | Need ≥ 2 photos selected — click "Select for Compare" on gallery cards  |
| Trainer tools not visible           | Ensure `isTrainer={true}` is passed (check user role logic)              |
