-- ============================================================
-- AzFIT Excel Data Migration — 2025-06-10
-- Creates tables for all extracted Excel sheet data
-- Run this in Supabase SQL Editor after the base schema exists
-- ============================================================

-- ============================================================
-- 1. MASTER REFERENCE TABLES (Public Read)
-- ============================================================

-- ── motion_categories ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS motion_categories (
  motion_category_id SERIAL PRIMARY KEY,
  motion_category_name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── rep_schemes ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rep_schemes (
  rep_scheme_id SERIAL PRIMARY KEY,
  training_method TEXT NOT NULL,
  rep_range TEXT,
  set_range TEXT,
  protocols TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── food_items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_items (
  food_item_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  serving_size TEXT,
  calories DECIMAL(8,2),
  protein DECIMAL(8,2),
  fats DECIMAL(8,2),
  carbs DECIMAL(8,2),
  category TEXT DEFAULT 'other',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── training_phases ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_phases (
  phase_id SERIAL PRIMARY KEY,
  phase_code TEXT NOT NULL UNIQUE,
  phase_name TEXT NOT NULL,
  method TEXT NOT NULL,
  duration_weeks INTEGER DEFAULT 4,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. PROGRAM TEMPLATE TABLES (Public Read)
-- ============================================================

-- ── program_templates ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS program_templates (
  program_template_id SERIAL PRIMARY KEY,
  phase_id INTEGER REFERENCES training_phases(phase_id),
  name TEXT NOT NULL,
  method TEXT,
  difficulty TEXT DEFAULT 'intermediate',
  duration_weeks INTEGER DEFAULT 4,
  days_per_week INTEGER DEFAULT 4,
  session_duration_minutes INTEGER DEFAULT 60,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── program_template_sessions ───────────────────────────────
CREATE TABLE IF NOT EXISTS program_template_sessions (
  session_id SERIAL PRIMARY KEY,
  program_template_id INTEGER REFERENCES program_templates(program_template_id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  session_name TEXT,
  focus TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── program_template_exercises ──────────────────────────────
CREATE TABLE IF NOT EXISTS program_template_exercises (
  template_exercise_id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES program_template_sessions(session_id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(exercise_id),
  order_notation TEXT, -- "A1", "A2", "B1"
  motion_category TEXT,
  reps TEXT, -- "10", "6-10", "TS: 6-10, BO: 10-12"
  sets INTEGER,
  tempo TEXT, -- "3-2-1-2"
  tut INTEGER, -- time under tension in seconds
  rest_seconds INTEGER,
  rest_display TEXT, -- "45s", "60s", "180s"
  video_link TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. EXERCISE ENHANCEMENTS (Add columns to existing exercises)
-- ============================================================

-- Add motion_category and video_url to existing exercises table
ALTER TABLE exercises 
  ADD COLUMN IF NOT EXISTS motion_category TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_link_text TEXT;

-- Create index for motion category lookups
CREATE INDEX IF NOT EXISTS idx_exercises_motion_category ON exercises(motion_category);

-- ============================================================
-- 4. CLIENT DATA TABLES (RLS Protected)
-- ============================================================

-- ── client_measurements ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_measurements (
  measurement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  assessor TEXT,
  -- Bio-Signature 12-site skinfold
  chin DECIMAL(5,2),
  cheek DECIMAL(5,2),
  pec DECIMAL(5,2),
  tricep DECIMAL(5,2),
  subscapular DECIMAL(5,2),
  midaxillary DECIMAL(5,2),
  suprailiac DECIMAL(5,2),
  umbilical DECIMAL(5,2),
  knee DECIMAL(5,2),
  patellar DECIMAL(5,2),
  hamstring DECIMAL(5,2),
  medial_calf DECIMAL(5,2),
  sum12 DECIMAL(6,2),
  body_fat_percent DECIMAL(5,2),
  -- Circumference
  neck DECIMAL(5,2),
  shoulder DECIMAL(5,2),
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hips DECIMAL(5,2),
  thigh DECIMAL(5,2),
  calf DECIMAL(5,2),
  arm DECIMAL(5,2),
  weight DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, date)
);

-- ── client_daily_logs ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_daily_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  -- Health markers (1-7 scale)
  sleep_hours DECIMAL(3,1),
  stress INTEGER CHECK (stress BETWEEN 1 AND 7),
  energy INTEGER CHECK (energy BETWEEN 1 AND 7),
  hunger INTEGER CHECK (hunger BETWEEN 1 AND 7),
  digestion INTEGER CHECK (digestion BETWEEN 1 AND 7),
  resting_hr INTEGER,
  hrv INTEGER,
  blood_pressure TEXT,
  blood_glucose DECIMAL(4,1),
  cycle_tracker BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, date)
);

-- ── client_weekly_checkins ──────────────────────────────────
CREATE TABLE IF NOT EXISTS client_weekly_checkins (
  checkin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  trainer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, week_number)
);

-- ── client_meal_plans ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_meal_plans (
  meal_plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT, -- "Meal Plan A", "Meal Plan B"
  calorie_target INTEGER,
  protein_target DECIMAL(6,2),
  fat_target DECIMAL(6,2),
  carb_target DECIMAL(6,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── client_meal_plan_items ──────────────────────────────────
CREATE TABLE IF NOT EXISTS client_meal_plan_items (
  meal_plan_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES client_meal_plans(meal_plan_id) ON DELETE CASCADE,
  meal_number INTEGER,
  macro_choice TEXT,
  food_item_id INTEGER REFERENCES food_items(food_item_id),
  food_name TEXT,
  serving TEXT,
  servings_count DECIMAL(4,1),
  calories DECIMAL(6,2),
  protein DECIMAL(5,2),
  fats DECIMAL(5,2),
  carbs DECIMAL(5,2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── client_strength_targets ─────────────────────────────────
CREATE TABLE IF NOT EXISTS client_strength_targets (
  strength_target_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lift_name TEXT,
  test_reps INTEGER,
  test_load DECIMAL(6,2),
  one_rm DECIMAL(6,2),
  three_rm DECIMAL(6,2),
  five_rm DECIMAL(6,2),
  eight_rm DECIMAL(6,2),
  date_tested DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── client_assessments ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_assessments (
  assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT, -- "initial", "quarterly"
  date DATE,
  exercise_name TEXT,
  level_achieved TEXT,
  breakdowns JSONB DEFAULT '{}',
  adjustments_tested JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. NUTRITION ADJUSTMENTS REFERENCE ─────────────────────────
-- ============================================================

CREATE TABLE IF NOT EXISTS nutrition_adjustments (
  adjustment_id SERIAL PRIMARY KEY,
  week_label TEXT NOT NULL,
  calories DECIMAL(8,2),
  protein DECIMAL(8,2),
  carbs DECIMAL(8,2),
  fats DECIMAL(8,2),
  refeed_calories DECIMAL(8,2),
  refeed_protein DECIMAL(8,2),
  refeed_carbs DECIMAL(8,2),
  refeed_fats DECIMAL(8,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. ROW LEVEL SECURITY POLICIES ─────────────────────────────
-- ============================================================

-- Reference tables: public read
ALTER TABLE motion_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_template_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_adjustments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read motion_categories" ON motion_categories;
CREATE POLICY "Public read motion_categories" ON motion_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read rep_schemes" ON rep_schemes;
CREATE POLICY "Public read rep_schemes" ON rep_schemes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read food_items" ON food_items;
CREATE POLICY "Public read food_items" ON food_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read training_phases" ON training_phases;
CREATE POLICY "Public read training_phases" ON training_phases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read program_templates" ON program_templates;
CREATE POLICY "Public read program_templates" ON program_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read program_template_sessions" ON program_template_sessions;
CREATE POLICY "Public read program_template_sessions" ON program_template_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read program_template_exercises" ON program_template_exercises;
CREATE POLICY "Public read program_template_exercises" ON program_template_exercises FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read nutrition_adjustments" ON nutrition_adjustments;
CREATE POLICY "Public read nutrition_adjustments" ON nutrition_adjustments FOR SELECT USING (true);

-- Client data tables: owner only
ALTER TABLE client_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_strength_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_assessments ENABLE ROW LEVEL SECURITY;

-- client_measurements
DROP POLICY IF EXISTS "Users manage own measurements" ON client_measurements;
CREATE POLICY "Users manage own measurements"
  ON client_measurements FOR ALL
  USING (auth.uid()::text = client_id)
  WITH CHECK (auth.uid()::text = client_id);

-- client_daily_logs
DROP POLICY IF EXISTS "Users manage own daily logs" ON client_daily_logs;
CREATE POLICY "Users manage own daily logs"
  ON client_daily_logs FOR ALL
  USING (auth.uid()::text = client_id)
  WITH CHECK (auth.uid()::text = client_id);

-- client_weekly_checkins
DROP POLICY IF EXISTS "Users manage own checkins" ON client_weekly_checkins;
CREATE POLICY "Users manage own checkins"
  ON client_weekly_checkins FOR ALL
  USING (auth.uid()::text = client_id)
  WITH CHECK (auth.uid()::text = client_id);

-- client_meal_plans
DROP POLICY IF EXISTS "Users manage own meal plans" ON client_meal_plans;
CREATE POLICY "Users manage own meal plans"
  ON client_meal_plans FOR ALL
  USING (auth.uid()::text = client_id)
  WITH CHECK (auth.uid()::text = client_id);

-- client_meal_plan_items (via meal plan ownership)
DROP POLICY IF EXISTS "Users manage own meal plan items" ON client_meal_plan_items;
CREATE POLICY "Users manage own meal plan items"
  ON client_meal_plan_items FOR ALL
  USING (meal_plan_id IN (
    SELECT meal_plan_id FROM client_meal_plans WHERE client_id = auth.uid()::text
  ))
  WITH CHECK (meal_plan_id IN (
    SELECT meal_plan_id FROM client_meal_plans WHERE client_id = auth.uid()::text
  ));

-- client_strength_targets
DROP POLICY IF EXISTS "Users manage own strength targets" ON client_strength_targets;
CREATE POLICY "Users manage own strength targets"
  ON client_strength_targets FOR ALL
  USING (auth.uid()::text = client_id)
  WITH CHECK (auth.uid()::text = client_id);

-- client_assessments
DROP POLICY IF EXISTS "Users manage own assessments" ON client_assessments;
CREATE POLICY "Users manage own assessments"
  ON client_assessments FOR ALL
  USING (auth.uid()::text = client_id)
  WITH CHECK (auth.uid()::text = client_id);

-- ============================================================
-- 7. INDEXES ─────────────────────────────────────────────────
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(exercise_name);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category);
CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name);
CREATE INDEX IF NOT EXISTS idx_program_templates_phase ON program_templates(phase_id);
CREATE INDEX IF NOT EXISTS idx_template_sessions_program ON program_template_sessions(program_template_id);
CREATE INDEX IF NOT EXISTS idx_template_exercises_session ON program_template_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_client_measurements_client_date ON client_measurements(client_id, date);
CREATE INDEX IF NOT EXISTS idx_client_daily_logs_client_date ON client_daily_logs(client_id, date);
CREATE INDEX IF NOT EXISTS idx_client_checkins_client_week ON client_weekly_checkins(client_id, week_number);

-- ============================================================
-- 8. HELPER FUNCTIONS ────────────────────────────────────────
-- ============================================================

-- Function to get full program template with exercises
CREATE OR REPLACE FUNCTION get_program_template_with_exercises(p_template_id INTEGER)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'template', row_to_json(pt.*),
    'phase', row_to_json(tp.*),
    'sessions', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'session', row_to_json(pts.*),
          'exercises', (
            SELECT jsonb_agg(row_to_json(pte.*))
            FROM program_template_exercises pte
            WHERE pte.session_id = pts.session_id
            ORDER BY pte.sort_order
          )
        )
      )
      FROM program_template_sessions pts
      WHERE pts.program_template_id = pt.program_template_id
      ORDER BY pts.sort_order
    )
  )
  INTO result
  FROM program_templates pt
  JOIN training_phases tp ON pt.phase_id = tp.phase_id
  WHERE pt.program_template_id = p_template_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to search exercises by motion category
CREATE OR REPLACE FUNCTION search_exercises_by_motion(
  p_motion_category TEXT,
  p_search_term TEXT DEFAULT NULL
)
RETURNS TABLE (
  exercise_id INTEGER,
  exercise_name TEXT,
  motion_category TEXT,
  muscle_group TEXT,
  equipment_primary TEXT,
  video_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.exercise_id,
    e.exercise_name,
    e.motion_category,
    e.muscle_group,
    e.equipment_primary,
    e.video_url
  FROM exercises e
  WHERE e.motion_category = p_motion_category
    AND (p_search_term IS NULL OR e.exercise_name ILIKE '%' || p_search_term || '%')
    AND e.is_active = true
  ORDER BY e.exercise_name;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate 1RM using Brzycki formula
CREATE OR REPLACE FUNCTION calculate_1rm_brzycki(
  p_weight DECIMAL,
  p_reps INTEGER
)
RETURNS DECIMAL AS $$
BEGIN
  IF p_reps <= 0 OR p_weight <= 0 THEN
    RETURN NULL;
  END IF;
  RETURN p_weight / (1.0278 - (0.0278 * p_reps));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get client's latest measurement
CREATE OR REPLACE FUNCTION get_client_latest_measurement(p_client_id TEXT)
RETURNS SETOF client_measurements AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM client_measurements
  WHERE client_id = p_client_id
  ORDER BY date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
