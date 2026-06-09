# AzFIT Excel Sheets Analysis & Integration Plan

## 1. Executive Summary

The `NEWAZFIT Trainer master sheet.xlsx` is a comprehensive 39-tab Excel workbook that serves as the **entire AzFIT training methodology** — containing everything from client onboarding, body composition tracking, nutrition planning, 12-month periodized workout programs, exercise libraries, and progress monitoring. This document analyzes every tab and proposes a phased integration plan into the existing Supabase + React web app.

---

## 2. Complete Tab Inventory & Classification

### A. Client Profile & Onboarding (5 tabs)
| Tab | Purpose | Data Type | Priority |
|-----|---------|-----------|----------|
| **INTRO** | Client name, start date, bodyweight, gender, goal, goal date, weekly schedule | Client metadata | **HIGH** |
| **MEASUREMENTS 1** | Bio-Signature 12-site skinfold (Chin, Cheek, Pec, Tricep, Sub-scap, Mid-ax, Supra, Umbil, Knee, Calf, Quad, Ham) + circumference | Assessment data | **HIGH** |
| **Measurements** | Same as above — appears to be a duplicate/template | Assessment data | LOW |
| **TIMELINE** | Bodyweight tracking chart + measurements tracking over time | Progress visualization | **HIGH** |
| **Goal Setting Calculator** | Weight projection over 25+ weeks with phase breakdown, body fat % tracking | Goal projection | MEDIUM |

### B. Daily Tracking & Nutrition (4 tabs)
| Tab | Purpose | Data Type | Priority |
|-----|---------|-----------|----------|
| **Daily Log** | Daily bodyweight, nutrition (calories, protein, carbs, fats), activity (steps, cardio), health markers (sleep, stress, energy, hunger, digestion, HR, HRV, BP, blood glucose, cycle tracker) | Daily journal | **HIGH** |
| **Meal Plan** | Two meal plan templates (A & B) with macro targets, food selections from FoodList | Nutrition planning | **HIGH** |
| **Mediterranean RESET** | Specialized meal plan template (higher calories — appears to be for bulking) | Nutrition planning | MEDIUM |
| **FOOD PHOTOS** | Photo logging for meals | Media | LOW |

### C. Weekly & Periodic Check-ins (3 tabs)
| Tab | Purpose | Data Type | Priority |
|-----|---------|-----------|----------|
| **Weekly Check-In** | 10+ questions per week (wins, stress, gym performance, nutrition adherence, sleep, etc.) | Weekly questionnaire | **HIGH** |
| **QUARTER 1 REVIEW** | Quarterly progress review | Periodic assessment | MEDIUM |
| **QUARTERLY ASSESSMENT** | Strength re-testing, 1RM estimates, heart rate zones | Quarterly testing | **HIGH** |

### D. Workout Program Library — 12 Training Phases (12 tabs)
| Tab | Phase Name | Method | Duration | Focus |
|-----|-----------|--------|----------|-------|
| **Phase 1 Week 1-4** | GBC Block 1 | GBC (German Body Composition) | 4 weeks | Full Body |
| **Phase 2 Weeks 5-8** | GBC Block 2 | GBC | 4 weeks | Full Body |
| **Phase 3 Week 9-12** | GBC Block 3 | GBC | 4 weeks | Full Body |
| **BLSB 1** | Back Loaded Structural Balance 1 | Structural Balance | 4 weeks | Lower Body |
| **BLSB 2** | Back Loaded Structural Balance 2 | Structural Balance | 4 weeks | Lower Body |
| **Strength Phase 1** | Strength Phase 1 | Relative Strength | 4 weeks | Squat/Bench/Deadlift |
| **Strength Phase 2** | Strength Phase 2 | Relative Strength | 4 weeks | Squat/Bench/Deadlift |
| **Strength Phase 3** | Strength Phase 3 | Relative Strength | 4 weeks | Squat/Bench/Deadlift |
| **TRANSITION PHASE** | Transition Phase | Functional Hypertrophy | 4 weeks | Upper/Lower |
| **Hypertrophy Phase 1** | High Intensity Tension | Hypertrophy | 4 weeks | Front/Back Body |
| **Hypertrophy Phase 2** | Metabolite Sustained Tension | Metabolic/Strength Endurance | 4 weeks | Front/Back Body |
| **MONTH 12** | Month 12 | Maintenance/Deload | 4 weeks | Full Body |

**Each workout tab contains:**
- Session structure (Session 1, 2, 3...)
- Exercise order (A1, A2, B1, B2, C1, C2, C3...)
- Exercise name (linked to Exercise Database)
- Reps (range or specific)
- Sets
- Tempo (4 digits: eccentric, pause, concentric, pause)
- TUT (Time Under Tension)
- Rest periods
- Video link (linked to Exercise Links tab)
- Motion category (PRESSING, PULLING, QUAD, POSTERIOR, etc.)

### E. Reference & Configuration (8 tabs)
| Tab | Purpose | Data Type | Priority |
|-----|---------|-----------|----------|
| **Exercise Database** | Master list of 100+ exercises organized by movement pattern (Pressing, Pulling, Bilateral Quad, Unilateral Quad, Posterior, Target Areas, Metcon/Bracing, Bracing, Biceps, Triceps, etc.) | Master reference | **HIGH** |
| **Exercise Links** | 300+ exercise-to-video mappings (exercise name → video link → muscle group) | Media reference | **HIGH** |
| **FoodList** | 340+ food items with serving sizes and macros (calories, protein, fats, carbs) | Master reference | **HIGH** |
| **REP SCHEMES** | Training methods matrix: Relative Strength, Functional Hypertrophy, Hypertrophy, Metabolic/Strength Endurance with specific protocols (GBC, Doubles, Wave Loading, Drop Sets, 6-12-25, etc.) | Methodology reference | **HIGH** |
| **Strength Targets** | 1RM predictor table (Deadlift, Squat, Bench, Chin Up, etc.) with rep/load → 1RM/3RM/5RM/8RM estimates | Strength reference | MEDIUM |
| **Volume Tracker** | (Not found in scan — may be empty or named differently) | Volume tracking | MEDIUM |
| **Copy of Habit Tracker** | Duplicate of habit tracker | Tracking | LOW |
| **HIDE DATA** | Hidden data table (appears to be heart rate zone thresholds: 93, 111, 130, 148, 167, 185) | Configuration | LOW |

### F. Assessments (2 tabs)
| Tab | Purpose | Data Type | Priority |
|-----|---------|-----------|----------|
| **INITIAL GYM FLOOR ASSESSMENT** | Core assessment with levels (Squat, Lunge, Push, Pull, Bracing) + breakdowns + adjustments tested | Initial screening | **HIGH** |
| **QUARTERLY ASSESSMENT** | Re-test strength, bodyweight, HR zones | Progress testing | **HIGH** |

### G. Progress Tracking (2 tabs)
| Tab | Purpose | Data Type | Priority |
|-----|---------|-----------|----------|
| **WeightPhoto Progression** | Photo + weight progression over time | Progress media | MEDIUM |
| **BeforeAfter** | Before/after photo comparison layout | Progress media | LOW |

### H. Program Builder (1 tab)
| Tab | Purpose | Data Type | Priority |
|-----|---------|-----------|----------|
| **Program creator (HIDE)** | Master workout builder with session templates, exercise slots, motion categories, auto-calculated TUT and rest | Builder engine | **HIGH** |

### I. Scheduling & Habits (2 tabs)
| Tab | Purpose | Data Type | Priority |
|-----|---------|-----------|----------|
| **Daily Schedule & Habit Tracker** | Hour-by-hour daily schedule (5am–9pm+) with work, gym, meals, steps, wake/sleep tracking | Habit tracking | MEDIUM |
| **Copy of Habit Tracker** | Duplicate | Habit tracking | LOW |

### J. Hidden/Backend (3 tabs)
| Tab | Purpose | Data Type | Priority |
|-----|---------|-----------|----------|
| **ADVANCED MACRO CALCULATOR (HIDE** | Macro calculation engine | Nutrition config | MEDIUM |
| **Adjustments Database (HIDE)** | Weekly calorie/protein/carb/fat adjustments across program + refeed days | Nutrition adjustments | **HIGH** |
| **HIDE DATA** | HR zone thresholds | Config | LOW |

---

## 3. Data Model Mapping: Excel → Supabase

### Proposed Database Schema Extensions

The existing app already has a solid foundation. Here's what needs to be added/modified:

#### 3.1 Master Reference Tables (NEW)

```sql
-- exercises (expand existing or create new)
-- Already exists but needs: motion_category, video_url, tempo_notes

-- food_items (NEW)
CREATE TABLE food_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  serving_size TEXT,
  calories DECIMAL(8,2),
  protein DECIMAL(8,2),
  fats DECIMAL(8,2),
  carbs DECIMAL(8,2),
  category TEXT, -- proteins, carbs, fats, nuts, etc.
  is_active BOOLEAN DEFAULT true
);

-- rep_schemes (NEW)
CREATE TABLE rep_schemes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL, -- "GBC", "Doubles", "Wave Loading", "6-12-25"
  training_method TEXT, -- "Relative Strength", "Hypertrophy", etc.
  rep_range TEXT,
  set_range TEXT,
  description TEXT,
  protocol_details JSONB,
  is_active BOOLEAN DEFAULT true
);

-- training_phases (NEW)
CREATE TABLE training_phases (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL, -- "Phase 1: GBC Block 1"
  phase_code TEXT, -- "P1-GBC1"
  method TEXT, -- "GBC"
  duration_weeks INTEGER,
  focus TEXT,
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true
);
```

#### 3.2 Program Builder Tables (NEW)

```sql
-- program_templates (master programs from Excel)
CREATE TABLE program_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phase_id INTEGER REFERENCES training_phases(id),
  method TEXT,
  difficulty TEXT,
  duration_weeks INTEGER,
  days_per_week INTEGER,
  session_duration_minutes INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- program_template_sessions (workouts within a template)
CREATE TABLE program_template_sessions (
  id SERIAL PRIMARY KEY,
  program_template_id INTEGER REFERENCES program_templates(id),
  session_number INTEGER,
  session_name TEXT, -- "FULL BODY 1", "SQUAT", "UPPER BODY 1"
  focus TEXT,
  sort_order INTEGER
);

-- program_template_exercises (exercises within a session)
CREATE TABLE program_template_exercises (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES program_template_sessions(id),
  exercise_id INTEGER REFERENCES exercises(exercise_id),
  order_notation TEXT, -- "A1", "A2", "B1"
  motion_category TEXT, -- "PRESSING", "PULLING", "QUAD"
  reps TEXT, -- "10", "6-10", "TS: 6-10, BO: 10-12"
  sets INTEGER,
  tempo TEXT, -- "3-2-1-2"
  tut INTEGER, -- time under tension in seconds
  rest_seconds INTEGER,
  rest_display TEXT, -- "45s", "60s", "180s"
  video_link TEXT,
  notes TEXT,
  sort_order INTEGER
);
```

#### 3.3 Client Data Tables (NEW / Extend)

```sql
-- client_profiles (extend existing)
-- Add: start_date, goal_date, overarching_goal, starting_bodyweight

-- client_measurements (NEW — Bio-Signature + Circumference)
CREATE TABLE client_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT REFERENCES auth.users(id),
  date DATE NOT NULL,
  assessor TEXT,
  -- Bio-Signature 12-site
  chin DECIMAL(5,2), cheek DECIMAL(5,2), pec DECIMAL(5,2),
  tricep DECIMAL(5,2), subscapular DECIMAL(5,2), midaxillary DECIMAL(5,2),
  suprailiac DECIMAL(5,2), umbilical DECIMAL(5,2), knee DECIMAL(5,2),
  patellar DECIMAL(5,2), hamstring DECIMAL(5,2), medial_calf DECIMAL(5,2),
  sum12 DECIMAL(6,2),
  body_fat_percent DECIMAL(5,2),
  -- Circumference
  neck DECIMAL(5,2), shoulder DECIMAL(5,2), chest DECIMAL(5,2),
  waist DECIMAL(5,2), hips DECIMAL(5,2), thigh DECIMAL(5,2),
  calf DECIMAL(5,2), arm DECIMAL(5,2),
  weight DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- client_daily_logs (NEW)
CREATE TABLE client_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT REFERENCES auth.users(id),
  date DATE NOT NULL,
  bodyweight DECIMAL(5,2),
  is_training_day BOOLEAN,
  -- Nutrition
  calories INTEGER,
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fats DECIMAL(5,2),
  meals_out INTEGER,
  -- Activity
  steps INTEGER,
  cardio_kcals INTEGER,
  -- Health markers
  sleep_hours DECIMAL(3,1),
  stress INTEGER CHECK (stress BETWEEN 1 AND 7),
  energy INTEGER CHECK (energy BETWEEN 1 AND 7),
  hunger INTEGER CHECK (hunger BETWEEN 1 AND 7),
  digestion INTEGER CHECK (digestion BETWEEN 1 AND 7),
  resting_hr INTEGER,
  hrv INTEGER,
  blood_pressure TEXT,
  blood_glucose DECIMAL(4,1),
  cycle_tracker BOOLEAN,
  UNIQUE(client_id, date)
);

-- client_weekly_checkins (NEW)
CREATE TABLE client_weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT REFERENCES auth.users(id),
  week_number INTEGER NOT NULL,
  date DATE,
  wins TEXT,
  stress_comments TEXT,
  gym_performance TEXT,
  nutrition_adherence TEXT,
  sleep_quality TEXT,
  energy_levels TEXT,
  digestion_comments TEXT,
  motivation TEXT,
  questions_for_trainer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- client_meal_plans (NEW)
CREATE TABLE client_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT REFERENCES auth.users(id),
  name TEXT, -- "Meal Plan A", "Meal Plan B"
  calorie_target INTEGER,
  protein_target DECIMAL(6,2),
  fat_target DECIMAL(6,2),
  carb_target DECIMAL(6,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- client_meal_plan_items (NEW)
CREATE TABLE client_meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES client_meal_plans(id),
  meal_number INTEGER, -- 1, 2, 3, 4, 5
  macro_choice TEXT, -- "Proteins", "Carbs", "Fats"
  food_item_id INTEGER REFERENCES food_items(id),
  serving TEXT,
  servings_count DECIMAL(4,1),
  calories DECIMAL(6,2),
  protein DECIMAL(5,2),
  fats DECIMAL(5,2),
  carbs DECIMAL(5,2),
  sort_order INTEGER
);

-- client_strength_targets (NEW)
CREATE TABLE client_strength_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT REFERENCES auth.users(id),
  lift_name TEXT, -- "Deadlift", "Squat", "Bench Press"
  test_reps INTEGER,
  test_load DECIMAL(6,2),
  one_rm DECIMAL(6,2),
  three_rm DECIMAL(6,2),
  five_rm DECIMAL(6,2),
  eight_rm DECIMAL(6,2),
  date_tested DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- client_assessments (NEW)
CREATE TABLE client_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT REFERENCES auth.users(id),
  assessment_type TEXT, -- "initial", "quarterly"
  date DATE,
  exercise_name TEXT,
  level_achieved TEXT,
  breakdowns JSONB,
  adjustments_tested JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. The Program Builder Vision

### What the Program Builder Should Do

1. **Template Selection**: Trainer selects from the 12 pre-built phase templates (GBC 1-3, BLSB 1-2, Strength 1-3, Transition, Hypertrophy 1-2, Month 12)

2. **Auto-Population**: Builder auto-fills:
   - Exercises from the Exercise Database
   - Rep schemes from REP SCHEMES based on phase method
   - Tempo prescriptions
   - Rest periods
   - Video links from Exercise Links
   - Motion categories for balanced programming

3. **Smart Substitution**: When swapping an exercise:
   - Filter by same motion category (e.g., replace one PULLING with another PULLING)
   - Show equipment alternatives
   - Auto-adjust reps/sets based on new exercise difficulty
   - Preserve video links

4. **Client Assignment**: 
   - Assign program to client with start date
   - Auto-calculate week numbers
   - Link to Daily Log, Weekly Check-In, Measurements

5. **Progression Tracking**:
   - Track actual loads vs. prescribed
   - Auto-suggest progression based on REP SCHEMES rules
   - Flag when client is ready for next phase

---

## 5. Recommended Implementation Phases

### Phase 1: Foundation — Data Migration & Master Tables (Week 1-2)
**Goal**: Get all reference data into Supabase

- [ ] Create `food_items` table + seed from FoodList tab
- [ ] Create `rep_schemes` table + seed from REP SCHEMES tab
- [ ] Expand `exercises` table with motion_category, video_url
- [ ] Seed exercises from Exercise Database + Exercise Links tabs
- [ ] Create `training_phases` table + seed all 12 phases
- [ ] Create `program_templates`, `program_template_sessions`, `program_template_exercises`
- [ ] Build data migration script from Excel → Supabase

### Phase 2: Program Builder Core (Week 3-4)
**Goal**: Working program builder in the web app

- [ ] Build Program Builder UI page
- [ ] Phase selector (dropdown of 12 phases)
- [ ] Session viewer (display workouts with exercises, sets, reps, tempo)
- [ ] Exercise swap modal (filter by motion category, equipment)
- [ ] Auto-save program templates
- [ ] Assign program to client flow

### Phase 3: Client Tracking Features (Week 5-6)
**Goal**: Client can log daily data

- [ ] Daily Log form (bodyweight, nutrition, activity, health markers)
- [ ] Weekly Check-In form (10 questions)
- [ ] Measurements entry form (Bio-Signature 12-site + circumference)
- [ ] Meal Plan builder (select from FoodList, auto-calculate macros)
- [ ] Strength Targets tracker (1RM predictor)

### Phase 4: Dashboard & Analytics (Week 7-8)
**Goal**: Visualize progress and auto-suggest adjustments

- [ ] Bodyweight timeline chart
- [ ] Measurements progression charts
- [ ] Compliance dashboard (daily log completion %)
- [ ] Auto-adjustment suggestions based on Adjustments Database
- [ ] Phase progression recommendations

### Phase 5: Advanced Features (Week 9-10)
**Goal**: Polish and advanced functionality

- [ ] Before/After photo upload & comparison
- [ ] Habit tracker integration
- [ ] Trainer notes & alerts based on data trends
- [ ] Export to PDF (program, measurements, progress)
- [ ] Mobile-optimized daily log

---

## 6. Key Integration Points

### Excel → Supabase Data Flow
```
FoodList ───────────────► food_items
Exercise Database ──────► exercises (+ motion_category)
Exercise Links ─────────► exercises.video_url
REP SCHEMES ────────────► rep_schemes
12 Phase Tabs ──────────► program_templates + sessions + exercises
Adjustments Database ───► adjustment_rules (NEW table)
INTRO ──────────────────► client_profiles
Daily Log ──────────────► client_daily_logs
Meal Plan ──────────────► client_meal_plans + items
Measurements ───────────► client_measurements
Weekly Check-In ────────► client_weekly_checkins
Strength Targets ───────► client_strength_targets
```

### Web App Feature Mapping
```
Existing: Program Design Wizard ──► Enhanced with Excel templates
Existing: Exercise Library ───────► Enhanced with motion categories + videos
Existing: Client Dashboard ───────► Add Daily Log, Measurements, Check-ins
Existing: Calendar ───────────────► Link to workout sessions
NEW: Program Builder ─────────────► Core new feature
NEW: Daily Log ───────────────────► Client daily tracking
NEW: Meal Planner ────────────────► FoodList-based meal builder
NEW: Measurements ────────────────► Bio-Signature + Circumference
NEW: Weekly Check-In ─────────────► Questionnaire form
NEW: Strength Tracker ────────────► 1RM predictor + progress
```

---

## 7. Immediate Next Steps

1. **Export & Clean Excel Data**: Create structured JSON/CSV exports from each tab
2. **Design Final DB Schema**: Create migration SQL files
3. **Seed Supabase**: Run migrations and populate reference tables
4. **Build Program Builder UI**: Start with phase selector + session display
5. **Test End-to-End**: Create a test client, assign program, log data

---

## 8. Files Created

- This analysis document: `.ai-plan/07-excel-sheets-analysis-and-integration-plan.md`
- Data extraction scripts: `.temp/Sheets/scripts/` (to be created)
- Database migrations: `supabase/migrations/` (to be created)
- Program Builder components: `src/components/program-builder/` (to be created)

---

*Analysis completed: 2026-06-09*
*Next: Awaiting user direction on which phase to begin*
