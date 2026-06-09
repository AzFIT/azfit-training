# AzFIT Program Builder — Complete Workflow Design

## 1. Overview & Philosophy

The Program Builder is the **crown jewel** of AzFIT. It transforms the trainer's Excel-based workflow into an intelligent, web-based system that:

1. **Starts from proven templates** — The 12 AzFIT phases (GBC 1-3, BLSB 1-2, Strength 1-3, Transition, Hypertrophy 1-2, Month 12)
2. **Auto-populates everything** — Exercises, sets, reps, tempo, TUT, rest, video links
3. **Enables smart customization** — Swap exercises within the same motion category, adjust loads, modify reps
4. **Assigns to clients** — With auto-calculated week numbers and linked tracking
5. **Tracks progress** — Actual vs. prescribed, auto-suggest progression, phase readiness

---

## 2. User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              TRAINER WORKFLOW (Program Builder)                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

[ENTRY POINTS]
     │
     ├──► Dashboard "Create Program" button
     ├──► Sidebar "Program Builder" nav item
     ├──► Client Profile → "Assign New Program" button
     └──► Programs Page → "Build Custom Program" button
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  PAGE 1: PROGRAM BUILDER LANDING                             │
│  Route: /program-builder                                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  HEADER: "Program Builder" + "New from Template"    │    │
│  │         + "New from Scratch" + "Recent Programs"    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  SECTION A: Quick Start Cards                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  GBC Block  │ │   Strength  │ │ Hypertrophy │          │
│  │     1-3     │ │   Phase 1   │ │   Phase 1   │          │
│  │  [Select]   │ │  [Select]   │ │  [Select]   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                              │
│  SECTION B: All 12 Phase Templates (Grid/Filter)            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Filter: [Method ▼] [Duration ▼] [Difficulty ▼]    │    │
│  │                                                      │    │
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │    │
│  │ │Phase 1 │ │Phase 2 │ │ BLSB 1 │ │ BLSB 2 │ ...   │    │
│  │ │GBC     │ │GBC     │ │Struct  │ │Struct  │       │    │
│  │ │[View]  │ │[View]  │ │[View]  │ │[View]  │       │    │
│  │ └────────┘ └────────┘ └────────┘ └────────┘       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  SECTION C: Recent Custom Programs                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • Anne Tan - GBC Modified (edited 2h ago) [Edit]    │    │
│  │ • John Doe - Strength Phase 2 (edited yesterday)    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
     │
     │ Click "Select" on any phase template
     ▼
┌─────────────────────────────────────────────────────────────┐
│  PAGE 2: PHASE CONFIGURATOR                                  │
│  Route: /program-builder/phase/:phaseCode                    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  BREADCRUMB: Builder > Phase 1: GBC Block 1         │    │
│  │  HEADER: "Phase 1: GBC Block 1"                     │    │
│  │  SUB: German Body Composition • 4 weeks • Full Body │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  STEP 1: CLIENT CONTEXT (Collapsible)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Client: [Select or Search... ▼] Anne Tan            │    │
│  │ Start Date: [2025-06-15 ▼]                          │    │
│  │ Goal: [Lose Fat ▼]                                  │    │
│  │ Experience: [Intermediate ▼]                        │    │
│  │ Available Days: [Mon✓] [Tue✓] [Wed✓] [Thu✓] [Fri✓]│    │
│  │ Session Duration: [60 min ▼]                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  STEP 2: SESSION PREVIEW (Tabs)                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Session 1: Full Body 1] [Session 2: Full Body 2]   │    │
│  │ [Session 3: Full Body 3] [Session 4: Full Body 4]   │    │
│  │ [Session 5: Full Body 5]                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ACTIVE SESSION VIEW (e.g., Session 1: Full Body 1)         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ EXERCISE LIST (with swap/edit capabilities)          │    │
│  │                                                      │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │ A1 │ Chin up - Semi supinated    │ 10 reps │ 2s │ │    │
│  │ │    │ PULLING  │ Tempo: 3-2-1-2-1 │ TUT: 60s│    │ │    │
│  │ │    │ [🎥 Video] [🔄 Swap] [✏️ Edit]              │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │ A2 │ DB Split Squat              │ 10 reps │ 2s │ │    │
│  │ │    │ UNILATERAL_QUAD │ Tempo: 3-2-1-2-1      │    │ │    │
│  │ │    │ [🎥 Video] [🔄 Swap] [✏️ Edit]              │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │ B1 │ 15° DB Incline Press        │ 10 reps │ 2s │ │    │
│  │ │    │ PRESSING │ Tempo: 3-2-1-2-1 │ TUT: 72s│    │ │    │
│  │ │    │ [🎥 Video] [🔄 Swap] [✏️ Edit]              │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │ ... (more exercises)                                │    │
│  │                                                      │    │
│  │ SESSION STATS: 7 exercises • 14 sets • ~45 min      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  BOTTOM ACTION BAR                                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [💾 Save as Template]    [📋 Review & Assign →]     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
     │
     │ Click "🔄 Swap" on any exercise
     ▼
┌─────────────────────────────────────────────────────────────┐
│  MODAL: EXERCISE SWAP                                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ CURRENT: Chin up - Semi supinated (PULLING)         │    │
│  │                                                      │    │
│  │ FILTER: [All ▼] [PULLING ✓] [Equipment ▼] [Diff ▼] │    │
│  │ Search: [____________________]                      │    │
│  │                                                      │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │ Pull up - Pronated Grip    │ PULLING │ Back    │ │    │
│  │ │ [Select]                                        │ │    │
│  │ ├─────────────────────────────────────────────────┤ │    │
│  │ │ Chin Up - Supinated        │ PULLING │ Back    │ │    │
│  │ │ [Select]                                        │ │    │
│  │ ├─────────────────────────────────────────────────┤ │    │
│  │ │ Lat Pulldown - Supinated   │ PULLING │ Back    │ │    │
│  │ │ [Select]                                        │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │                                                      │    │
│  │ [❌ Cancel]              [✓ Confirm Swap]           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
     │
     │ Click "✏️ Edit" on any exercise
     ▼
┌─────────────────────────────────────────────────────────────┐
│  MODAL: EDIT EXERCISE PARAMETERS                             │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Exercise: Chin up - Semi supinated                  │    │
│  │                                                      │    │
│  │ Sets:        [ 2 ▲▼ ]                               │    │
│  │ Reps:        [ 10 ▲▼ ]  or  [ 8-12 ] range          │    │
│  │ Tempo:       [3] - [2] - [1] - [2] - [1]           │    │
│  │ Rest:        [ 45 ▲▼ ] seconds                      │    │
│  │ TUT:         60s (auto-calculated)                  │    │
│  │ Notes:       [____________________]                 │    │
│  │                                                      │    │
│  │ [❌ Cancel]              [💾 Save Changes]          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
     │
     │ Click "📋 Review & Assign →"
     ▼
┌─────────────────────────────────────────────────────────────┐
│  PAGE 3: REVIEW & ASSIGN                                     │
│  Route: /program-builder/review                              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  BREADCRUMB: Builder > Phase 1 > Review & Assign    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  PROGRAM SUMMARY CARD                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📋 Phase 1: GBC Block 1 (Modified)                  │    │
│  │                                                      │    │
│  │ Client: Anne Tan                                    │    │
│  │ Start Date: June 15, 2025                           │    │
│  │ Duration: 4 weeks                                   │    │
│  │ Frequency: 5 days/week                              │    │
│  │ Method: German Body Composition                     │    │
│  │                                                      │    │
│  │ Sessions: 5                                         │    │
│  │ Total Exercises: 35                                 │    │
│  │ Est. Time/Session: 45 min                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  WEEK-BY-WEEK OVERVIEW                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Week 1: GBC Block 1 - Session 1-5                   │    │
│  │ Week 2: GBC Block 1 - Session 1-5                   │    │
│  │ Week 3: GBC Block 1 - Session 1-5                   │    │
│  │ Week 4: GBC Block 1 - Session 1-5                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  SESSION BREAKDOWN (Expandable)                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ▼ Session 1: Full Body 1 (7 exercises, 14 sets)     │    │
│  │   A1. Chin up - Semi supinated — 2x10 @ 3-2-1-2-1   │    │
│  │   A2. DB Split Squat — 2x10 @ 3-2-1-2-1              │    │
│  │   B1. 15° DB Incline Press — 2x10 @ 3-2-1-2-1       │    │
│  │   ...                                                │    │
│  │ ▶ Session 2: Full Body 2 (6 exercises, 12 sets)     │    │
│  │ ▶ Session 3: Full Body 3 (7 exercises, 14 sets)     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ASSIGNMENT OPTIONS                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Assign to: [Anne Tan ▼] (or search clients)         │    │
│  │ Start Date: [2025-06-15 ▼]                          │    │
│  │                                                      │    │
│  │ [✓] Link to Daily Log                               │    │
│  │ [✓] Link to Weekly Check-In                         │    │
│  │ [✓] Link to Measurements                            │    │
│  │                                                      │    │
│  │ [💾 Save as Custom Template]                        │    │
│  │                                                      │    │
│  │ [🚀 ASSIGN PROGRAM]                                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
     │
     │ Click "🚀 ASSIGN PROGRAM"
     ▼
┌─────────────────────────────────────────────────────────────┐
│  SUCCESS / REDIRECT                                          │
│                                                              │
│  Toast: "Program assigned to Anne Tan! Starting Week 1."    │
│  Redirect: /clients/:clientId → Client Profile              │
│                                                              │
│  Client now sees:                                            │
│  • Today's workout in Dashboard                              │
│  • Daily Log tab for tracking                                │
│  • Weekly Check-In form (due every Sunday)                   │
│  • Measurements entry (due at start + every 4 weeks)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Page-by-Page Detailed Spec

### PAGE 1: Program Builder Landing
**Route:** `/program-builder`  
**Existing:** Yes (currently filters generic programs)  
**Changes Needed:** Major redesign

#### Layout
```
┌────────────────────────────────────────┐
│  ← Back    Program Builder    [+] New  │  ← Sticky header
├────────────────────────────────────────┤
│                                        │
│  QUICK START (Horizontal scroll)       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│  │ GBC │ │STR  │ │HYP  │ │BLSB │    │
│  │ 1-3 │ │ 1-3 │ │ 1-2 │ │ 1-2 │    │
│  └─────┘ └─────┘ └─────┘ └─────┘    │
│                                        │
│  ───────────────────────────────────── │
│                                        │
│  ALL PHASES                            │
│  Filter: [Method ▼] [Weeks ▼] [Diff ▼]│
│  Search: [____________________]       │
│                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ PHASE 1│ │ PHASE 2│ │ BLSB 1 │    │
│  │ GBC    │ │ GBC    │ │Struct  │    │
│  │ 4 wks  │ │ 4 wks  │ │ 4 wks  │    │
│  │ Full   │ │ Full   │ │ Lower  │    │
│  │ Body   │ │ Body   │ │ Body   │    │
│  │        │ │        │ │        │    │
│  │[Select]│ │[Select]│ │[Select]│    │
│  └────────┘ └────────┘ └────────┘    │
│                                        │
│  ... (more cards)                      │
│                                        │
│  ───────────────────────────────────── │
│                                        │
│  MY CUSTOM PROGRAMS                    │
│  • Anne Tan - Modified GBC [Edit][📋] │
│  • John Doe - Strength+ [Edit][📋]    │
│                                        │
└────────────────────────────────────────┘
```

#### Components
| Component | Props | Behavior |
|-----------|-------|----------|
| `PhaseTemplateCard` | `phase: TrainingPhase`, `onSelect` | Shows phase name, method, duration, focus, session count. Hover reveals "Preview" and "Select" buttons |
| `QuickStartStrip` | `phases: TrainingPhase[]` | Horizontal scroll of 4-6 most-used phases |
| `PhaseFilterBar` | `filters, onChange` | Method dropdown, duration slider, difficulty pills |
| `CustomProgramList` | `programs: Program[]` | List of trainer's previously modified programs |

#### Buttons & Actions
| Button | Action | Destination |
|--------|--------|-------------|
| "Select" on phase card | Load phase template into configurator | `/program-builder/phase/:phaseCode` |
| "Preview" on phase card | Open preview modal (read-only view) | Modal |
| "Edit" on custom program | Load saved custom program | `/program-builder/phase/:phaseCode?edit=:programId` |
| "New from Scratch" | Open blank wizard (existing ProgramWizard) | `/programs/new` |
| "Import from Excel" | Upload Excel file (future feature) | Modal |

#### Data Fetching
```sql
-- Get all training phases
SELECT * FROM training_phases WHERE is_active = true ORDER BY sort_order;

-- Get trainer's custom programs
SELECT * FROM program_templates WHERE created_by = :trainer_id ORDER BY updated_at DESC;
```

---

### PAGE 2: Phase Configurator
**Route:** `/program-builder/phase/:phaseCode`  
**Existing:** No — new page  
**Parent:** Replaces/extends the existing ProgramWizard

#### Layout
```
┌────────────────────────────────────────┐
│  ← Back   Phase 1: GBC Block 1   [💾]  │  ← Sticky header
├────────────────────────────────────────┤
│                                        │
│  CLIENT CONTEXT (Collapsible card)     │
│  ┌──────────────────────────────────┐  │
│  │ Client: [Anne Tan          ▼]   │  │
│  │ Start:  [June 15, 2025     ▼]   │  │
│  │ Goal:   [Lose Fat          ▼]   │  │
│  │ Exp:    [Intermediate      ▼]   │  │
│  │ Days:   [M✓][T✓][W✓][T✓][F✓][S][S]│
│  │ Duration:[60 min           ▼]   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ───────────────────────────────────── │
│                                        │
│  SESSION TABS (Sticky below header)    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │S1    │ │S2    │ │S3    │ │S4    │ │
│  │Full  │ │Full  │ │Full  │ │Full  │ │
│  │Body 1│ │Body 2│ │Body 3│ │Body 4│ │
│  │[active]       │       │       │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ │
│                                        │
│  ACTIVE SESSION: Full Body 1           │
│  ┌──────────────────────────────────┐  │
│  │ A1  Chin up - Semi supinated     │  │
│  │     PULLING │ 2 sets │ 10 reps   │  │
│  │     Tempo: 3-2-1-2-1 │ TUT: 60s  │  │
│  │     Rest: 45s                      │  │
│  │     [🎥] [🔄 Swap] [✏️] [🗑️]      │  │
│  ├──────────────────────────────────┤  │
│  │ A2  DB Split Squat               │  │
│  │     UNILATERAL_QUAD │ 2s │ 10r    │  │
│  │     [🎥] [🔄 Swap] [✏️] [🗑️]      │  │
│  ├──────────────────────────────────┤  │
│  │ B1  15° DB Incline Press         │  │
│  │     PRESSING │ 2s │ 10r           │  │
│  │     [🎥] [🔄 Swap] [✏️] [🗑️]      │  │
│  ├──────────────────────────────────┤  │
│  │ ... more exercises ...           │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [+ Add Exercise]  [+ Add Superset]    │
│                                        │
│  SESSION STATS                         │
│  7 exercises • 14 sets • ~45 min       │
│                                        │
│  ───────────────────────────────────── │
│                                        │
│  [💾 Save Draft]  [📋 Review & Assign→]│  ← Sticky bottom bar
│                                        │
└────────────────────────────────────────┘
```

#### Components
| Component | Props | Behavior |
|-----------|-------|----------|
| `ClientContextCard` | `client, onChange` | Collapsible form for client selection and context |
| `SessionTabs` | `sessions, activeIndex, onChange` | Horizontal scrollable tabs for each session |
| `ExerciseCard` | `exercise, onSwap, onEdit, onDelete` | Displays exercise with action buttons |
| `ExerciseSwapModal` | `currentExercise, onConfirm` | Filters exercises by same motion category |
| `ExerciseEditModal` | `exercise, onSave` | Editable form for sets, reps, tempo, rest |
| `SessionStats` | `exercises` | Auto-calculates total exercises, sets, estimated time |
| `AddExerciseButton` | `motionCategory, onSelect` | Opens exercise picker filtered by motion category |

#### Buttons & Actions
| Button | Action | Notes |
|--------|--------|-------|
| 🎥 Video | Opens video modal/player | Uses `exercise.video_url` |
| 🔄 Swap | Opens ExerciseSwapModal | Filters by same `motion_category` |
| ✏️ Edit | Opens ExerciseEditModal | Edits sets, reps, tempo, rest |
| 🗑️ Delete | Removes exercise from session | Confirmation toast |
| + Add Exercise | Opens exercise picker | Default filters by session's missing motion categories |
| + Add Superset | Adds paired exercise | Auto-suggests antagonist motion category |
| 💾 Save Draft | Saves to `program_templates` | Sets `is_draft = true` |
| 📋 Review & Assign | Navigates to review page | Validates all sessions have exercises |

#### State Management
```typescript
interface BuilderState {
  // Client context
  selectedClientId: string | null
  startDate: string
  goal: string
  experience: string
  availableDays: string[]
  sessionDuration: number

  // Phase data
  phaseCode: string
  phaseName: string
  method: string
  durationWeeks: number

  // Sessions (mutable copy of template)
  sessions: Session[]
  activeSessionIndex: number

  // Modifications tracking
  modifiedExercises: Map<string, ExerciseModification>
  originalTemplateId: number
}

interface Session {
  sessionNumber: number
  sessionName: string
  focus: string
  exercises: SessionExercise[]
}

interface SessionExercise {
  orderNotation: string  // "A1", "A2", "B1"
  exerciseId: number
  exerciseName: string
  motionCategory: string
  sets: number
  reps: string
  tempo: string
  tut: number
  restSeconds: number
  restDisplay: string
  videoLink: string
  notes: string
  isModified: boolean
  isSubstituted: boolean
  originalExerciseId: number
}
```

#### Data Fetching
```sql
-- Get phase template with all sessions and exercises
SELECT * FROM get_program_template_with_exercises(:phase_id);

-- Search exercises for swap
SELECT * FROM search_exercises_by_motion(:motion_category, :search_term);

-- Get client list for assignment
SELECT id, name, email FROM profiles WHERE role = 'client';
```

---

### PAGE 3: Review & Assign
**Route:** `/program-builder/review`  
**Existing:** No — new page  
**Parent:** Final step before saving

#### Layout
```
┌────────────────────────────────────────┐
│  ← Back   Review & Assign              │
├────────────────────────────────────────┤
│                                        │
│  PROGRAM CARD                          │
│  ┌──────────────────────────────────┐  │
│  │  📋 Phase 1: GBC Block 1         │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │  Client: Anne Tan                │  │
│  │  Start: June 15, 2025            │  │
│  │  Duration: 4 weeks (Weeks 1-4)   │  │
│  │  Frequency: 5 days/week          │  │
│  │  Method: GBC (German Body Comp)  │  │
│  │                                  │  │
│  │  [Edit Context]                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  TIMELINE                              │
│  ┌──────────────────────────────────┐  │
│  │ W1 ████████████ GBC Block 1      │  │
│  │ W2 ████████████ GBC Block 1      │  │
│  │ W3 ████████████ GBC Block 1      │  │
│  │ W4 ████████████ GBC Block 1      │  │
│  │ W5 ░░░░░░░░░░░░ (Next phase?)    │  │
│  └──────────────────────────────────┘  │
│                                        │
│  SESSIONS (Expandable)                 │
│  ┌──────────────────────────────────┐  │
│  │ ▼ Session 1: Full Body 1         │  │
│  │   A1. Chin up — 2x10 @ 3-2-1-2-1 │  │
│  │   A2. DB Split Squat — 2x10      │  │
│  │   B1. 15° DB Incline — 2x10      │  │
│  │   ... (7 exercises total)        │  │
│  │                                  │  │
│  │ ▶ Session 2: Full Body 2         │  │
│  │ ▶ Session 3: Full Body 3         │  │
│  │ ▶ Session 4: Full Body 4         │  │
│  │ ▶ Session 5: Full Body 5         │  │
│  └──────────────────────────────────┘  │
│                                        │
│  LINKED TRACKING                       │
│  ┌──────────────────────────────────┐  │
│  │ [✓] Daily Log (bodyweight,       │  │
│  │     nutrition, activity)         │  │
│  │ [✓] Weekly Check-In (Sundays)    │  │
│  │ [✓] Measurements (start + every  │  │
│  │     4 weeks)                     │  │
│  │ [✓] Strength Targets (Week 4)    │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [💾 Save as Custom Template]          │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  🚀 ASSIGN TO ANNE TAN           │  │
│  └──────────────────────────────────┘  │  ← Primary CTA
│                                        │
└────────────────────────────────────────┘
```

#### Components
| Component | Props | Behavior |
|-----------|-------|----------|
| `ProgramSummaryCard` | `program, client, dates` | Displays program metadata with edit button |
| `WeekTimeline` | `phases, startDate` | Visual timeline of the full program |
| `SessionAccordion` | `sessions` | Expandable list of sessions with exercise details |
| `TrackingLinksCard` | `options, onToggle` | Checkboxes for linked tracking features |
| `AssignConfirmationModal` | `client, program, onConfirm` | Final confirmation before assignment |

#### Buttons & Actions
| Button | Action | Destination |
|--------|--------|-------------|
| Edit Context | Returns to configurator | `/program-builder/phase/:phaseCode` |
| Expand Session | Shows full exercise list | Inline expand |
| Save as Template | Saves to `program_templates` | Toast confirmation, stays on page |
| 🚀 Assign | Creates `client_programs` record | `/clients/:clientId` with success toast |

#### Data Mutation
```sql
-- Create client program assignment
INSERT INTO client_programs (
  client_id, program_id, start_date, status,
  current_week, current_day, assigned_by
) VALUES (
  :client_id, :program_template_id, :start_date, 'active',
  1, 1, :trainer_id
);

-- Create linked tracking records
INSERT INTO client_daily_logs (client_id, date, ...)
  -- Pre-populate with target values

-- If saving as template
INSERT INTO program_templates (
  phase_id, name, method, difficulty, duration_weeks,
  days_per_week, session_duration_minutes, is_custom, created_by
) VALUES (...);
```

---

## 4. Modal Specifications

### Modal A: Exercise Swap
**Trigger:** Click "🔄 Swap" on any exercise card  
**Purpose:** Replace exercise with another from same motion category

```
┌────────────────────────────────────────┐
│  🔄 Swap Exercise              [×]     │
├────────────────────────────────────────┤
│                                        │
│  CURRENT:                              │
│  ┌──────────────────────────────────┐  │
│  │ Chin up - Semi supinated         │  │
│  │ PULLING │ Back │ Bodyweight      │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ───────────────────────────────────── │
│                                        │
│  FILTERS:                              │
│  [PULLING ✓] [All Equipment ▼] [All   │
│  Difficulty ▼]                        │
│  Search: [____________________]       │
│                                        │
│  ALTERNATIVES:                         │
│  ┌──────────────────────────────────┐  │
│  │ Pull up - Pronated Grip          │  │
│  │ PULLING │ Back │ Barbell         │  │
│  │ [🎥 Preview]  [Select →]         │  │
│  ├──────────────────────────────────┤  │
│  │ Chin Up - Supinated              │  │
│  │ PULLING │ Back │ Bodyweight      │  │
│  │ [🎥 Preview]  [Select →]         │  │
│  ├──────────────────────────────────┤  │
│  │ Lat Pulldown - Supinated         │  │
│  │ PULLING │ Back │ Cable           │  │
│  │ [🎥 Preview]  [Select →]         │  │
│  ├──────────────────────────────────┤  │
│  │ Prone DB Row                     │  │
│  │ PULLING │ Back │ Dumbbell        │  │
│  │ [🎥 Preview]  [Select →]         │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [❌ Cancel]              [✓ Confirm]  │
└────────────────────────────────────────┘
```

**Smart Defaults:**
- Motion category filter is locked to current exercise's category
- Equipment filter defaults to "All" but remembers trainer's gym setup
- Difficulty filter defaults to client's experience level
- Exercises sorted by: video available → popularity → alphabetical

---

### Modal B: Exercise Edit
**Trigger:** Click "✏️ Edit" on any exercise card  
**Purpose:** Modify training parameters

```
┌────────────────────────────────────────┐
│  ✏️ Edit Exercise              [×]     │
├────────────────────────────────────────┤
│                                        │
│  Chin up - Semi supinated              │
│  PULLING │ Back                        │
│                                        │
│  Sets:          [ 2 ▲▼ ]               │
│                                        │
│  Reps:          [ 10 ▲▼ ]              │
│  or Range:      [____] - [____]        │
│                                        │
│  Tempo:         [3]↓-[2]↓-[1]↓-[2]↓-[1]│
│  (Ecc-Pause-Con-Pause-?)              │
│                                        │
│  Rest:          [ 45 ▲▼ ] seconds      │
│                                        │
│  TUT:           60s (auto)             │
│                                        │
│  Notes:         [________________]     │
│                                        │
│  [❌ Cancel]              [💾 Save]    │
└────────────────────────────────────────┘
```

**Auto-Calculations:**
- TUT = Sets × Reps × Tempo sum (e.g., 2 × 10 × (3+2+1+2+1) = 180s... wait, that's wrong. TUT in Excel is per set: 10 reps × (3+2+1+2) = 80s... let me check the actual formula)
- Actually TUT in the Excel = reps × (eccentric + pause1 + concentric + pause2). For A1: 10 × (3+2+1+2) = 80s... but Excel shows 60. Let me recalculate: 10 × (3+2+1+0) = 60? Or maybe tempo is 3-2-1-0? Need to verify.

**Validation:**
- Sets: 1-20
- Reps: 1-100 or range format "8-12"
- Tempo: Each digit 0-9
- Rest: 0-600 seconds

---

### Modal C: Video Preview
**Trigger:** Click "🎥 Video" on any exercise  
**Purpose:** Show exercise tutorial video

```
┌────────────────────────────────────────┐
│  🎥 Chin up - Semi supinated   [×]     │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │     [Video Player]               │  │
│  │     (YouTube/Vimeo embed)        │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Muscle Groups: Back, Biceps           │
│  Equipment: Pull-up Bar                │
│  Difficulty: Intermediate              │
│                                        │
│  [📖 Full Exercise Details →]          │
└────────────────────────────────────────┘
```

---

## 5. Route Map

| Route | Page | Access | Notes |
|-------|------|--------|-------|
| `/program-builder` | Landing | Trainer | Entry point, shows all templates |
| `/program-builder/phase/:phaseCode` | Configurator | Trainer | Main builder interface |
| `/program-builder/phase/:phaseCode?edit=:id` | Configurator | Trainer | Edit existing custom program |
| `/program-builder/review` | Review & Assign | Trainer | Final confirmation |
| `/program-builder/card/:programId` | Program Card | Trainer/Client | Read-only view (existing) |
| `/clients/:clientId/workout/:programId` | Workout Session | Client | Active workout (existing) |
| `/clients/:clientId/workouts` | Workout History | Client | Past workouts (existing) |

---

## 6. State Flow & Data Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GLOBAL STATE (Zustand)                    │
│              useProgramBuilderStore.ts                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  phaseSelection: {                                          │
│    phaseCode: string                                        │
│    phaseId: number                                          │
│    phaseName: string                                        │
│  }                                                          │
│                                                             │
│  clientContext: {                                           │
│    clientId: string | null                                  │
│    clientName: string                                       │
│    startDate: string                                        │
│    goal: string                                             │
│    experience: string                                       │
│    availableDays: string[]                                  │
│    sessionDuration: number                                  │
│  }                                                          │
│                                                             │
│  sessions: Session[]  ← Mutable working copy                │
│                                                             │
│  modifications: {                                           │
│    swappedExercises: Map<string, number>  // old→new ID    │
│    editedParameters: Map<string, ExerciseEdit>              │
│    addedExercises: SessionExercise[]                        │
│    deletedExercises: string[]  // order_notations           │
│  }                                                          │
│                                                             │
│  ui: {                                                      │
│    activeSessionIndex: number                               │
│    showSwapModal: boolean                                   │
│    showEditModal: boolean                                   │
│    selectedExerciseId: number                               │
│    isSaving: boolean                                        │
│    saveError: string | null                                 │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER STATE (React Query)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  useTrainingPhases()     → training_phases table            │
│  useProgramTemplate(id)  → get_program_template_with_exercises│
│  useExercises(filters)   → exercises table (with motion_cat)│
│  useClients()            → profiles table                   │
│  useClientProgram(id)    → client_programs table            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Supabase)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Reference Data (read-only, cached):                        │
│    - training_phases                                        │
│    - exercises (with motion_category, video_url)            │
│    - motion_categories                                      │
│    - rep_schemes                                            │
│                                                             │
│  Program Templates (trainer-managed):                       │
│    - program_templates                                      │
│    - program_template_sessions                              │
│    - program_template_exercises                             │
│                                                             │
│  Client Assignments (RLS-protected):                        │
│    - client_programs                                        │
│    - client_daily_logs                                      │
│    - client_weekly_checkins                                 │
│    - client_measurements                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Component Architecture

```
src/
├── pages/
│   ├── ProgramBuilderLandingPage.tsx      ← /program-builder
│   ├── ProgramBuilderConfiguratorPage.tsx ← /program-builder/phase/:phaseCode
│   ├── ProgramBuilderReviewPage.tsx       ← /program-builder/review
│   └── (existing pages remain)
│
├── components/
│   └── program-builder-v2/                ← NEW folder
│       ├── landing/
│       │   ├── PhaseTemplateCard.tsx
│       │   ├── QuickStartStrip.tsx
│       │   ├── PhaseFilterBar.tsx
│       │   └── CustomProgramList.tsx
│       │
│       ├── configurator/
│       │   ├── ClientContextCard.tsx
│       │   ├── SessionTabs.tsx
│       │   ├── ExerciseCard.tsx
│       │   ├── SessionStats.tsx
│       │   ├── AddExerciseButton.tsx
│       │   └── BottomActionBar.tsx
│       │
│       ├── modals/
│       │   ├── ExerciseSwapModal.tsx
│       │   ├── ExerciseEditModal.tsx
│       │   ├── VideoPreviewModal.tsx
│       │   └── AssignConfirmationModal.tsx
│       │
│       ├── review/
│       │   ├── ProgramSummaryCard.tsx
│       │   ├── WeekTimeline.tsx
│       │   ├── SessionAccordion.tsx
│       │   └── TrackingLinksCard.tsx
│       │
│       └── shared/
│           ├── MotionCategoryBadge.tsx
│           ├── TempoDisplay.tsx
│           ├── TUTBadge.tsx
│           ├── RepRangeInput.tsx
│           └── VideoButton.tsx
│
├── stores/
│   └── useProgramBuilderV2Store.ts        ← NEW Zustand store
│
├── hooks/
│   ├── useTrainingPhases.ts               ← NEW
│   ├── useProgramTemplate.ts              ← NEW
│   ├── useExerciseSwap.ts                 ← NEW
│   ├── useProgramAssignment.ts            ← NEW
│   └── (existing hooks remain)
│
└── types/
    └── program-builder.ts                 ← NEW type definitions
```

---

## 8. API Endpoints (Supabase RPC / Queries)

```typescript
// Get all training phases for landing page
const { data: phases } = useQuery({
  queryKey: ['training-phases'],
  queryFn: () => supabase
    .from('training_phases')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
})

// Get full program template with nested data
const { data: template } = useQuery({
  queryKey: ['program-template', phaseId],
  queryFn: () => supabase
    .rpc('get_program_template_with_exercises', { p_template_id: phaseId })
})

// Search exercises for swap (same motion category)
const { data: alternatives } = useQuery({
  queryKey: ['exercise-alternatives', motionCategory, searchTerm],
  queryFn: () => supabase
    .rpc('search_exercises_by_motion', {
      p_motion_category: motionCategory,
      p_search_term: searchTerm
    })
})

// Save custom program template
const saveMutation = useMutation({
  mutationFn: async (program: CustomProgram) => {
    // 1. Insert program_template
    // 2. Insert program_template_sessions
    // 3. Insert program_template_exercises
    return supabase.rpc('save_custom_program', { program_json: program })
  }
})

// Assign program to client
const assignMutation = useMutation({
  mutationFn: async (assignment: ProgramAssignment) => {
    // 1. Insert client_programs
    // 2. Create linked tracking records
    return supabase.rpc('assign_program_to_client', { assignment_json: assignment })
  }
})
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create `useProgramBuilderV2Store` with full state shape
- [ ] Build `ProgramBuilderLandingPage` with phase cards
- [ ] Create `PhaseTemplateCard`, `QuickStartStrip`, `PhaseFilterBar`
- [ ] Wire up to `training_phases` table

### Phase 2: Configurator Core (Week 2)
- [ ] Build `ProgramBuilderConfiguratorPage`
- [ ] Create `ClientContextCard` with client search
- [ ] Build `SessionTabs` and `ExerciseCard`
- [ ] Implement exercise display with sets/reps/tempo/TUT/rest
- [ ] Add video link buttons

### Phase 3: Modals & Interactions (Week 3)
- [ ] Build `ExerciseSwapModal` with motion category filtering
- [ ] Build `ExerciseEditModal` with parameter editing
- [ ] Build `VideoPreviewModal`
- [ ] Implement swap/edit/delete/add exercise actions
- [ ] Add session stats auto-calculation

### Phase 4: Review & Assign (Week 4)
- [ ] Build `ProgramBuilderReviewPage`
- [ ] Create `WeekTimeline`, `SessionAccordion`, `TrackingLinksCard`
- [ ] Implement save as template
- [ ] Implement assign to client with linked tracking
- [ ] Add success toasts and redirects

### Phase 5: Polish (Week 5)
- [ ] Add drag-and-drop for exercise reordering
- [ ] Add keyboard shortcuts (Swap: S, Edit: E, Delete: Del)
- [ ] Add undo/redo for modifications
- [ ] Mobile responsiveness for configurator
- [ ] Performance optimization (virtualize long exercise lists)

---

## 10. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Motion category is locked during swap** | Ensures balanced programming — you can't accidentally replace a pulling exercise with a pressing one |
| **Templates are immutable, modifications create copies** | Preserves the original AzFIT methodology while allowing customization |
| **Auto-calculate TUT from tempo** | Reduces trainer cognitive load, ensures consistency |
| **Week timeline shows phase progression** | Helps trainers visualize the full program journey |
| **Linked tracking is opt-out, not opt-in** | Most clients need all tracking features; easier to uncheck than remember to check |
| **Draft auto-save every 30s** | Prevents lost work during long configuration sessions |
| **Session tabs are sticky** | Trainers often jump between sessions to compare/modify |

---

*Document version: 1.0*  
*Created: 2026-06-09*  
*Next: Implement Phase 1 — Foundation*
