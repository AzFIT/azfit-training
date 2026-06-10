-- ═══════════════════════════════════════════
-- Nutrition Tables for AzFIT
-- Phase 6: Supabase Persistence
-- ═══════════════════════════════════════════

-- ── Nutrition Plans ────────────────────────────────────────────────
-- Stores generated meal plans per client per day
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  date DATE NOT NULL,
  target_calories INTEGER NOT NULL,
  target_protein INTEGER NOT NULL,
  target_carbs INTEGER NOT NULL,
  target_fat INTEGER NOT NULL,
  meals JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, date)
);

COMMENT ON TABLE nutrition_plans IS 'Daily meal plans generated from TDEE calculations';
COMMENT ON COLUMN nutrition_plans.meals IS 'Array of meals with primary + alternative options';

-- ── Meal Logs ──────────────────────────────────────────────────────
-- Stores what the client actually ate (planned vs actual)
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planned', 'eaten', 'swapped', 'missed', 'custom')),
  option_name TEXT NOT NULL,
  foods JSONB NOT NULL DEFAULT '[]',
  actual_calories INTEGER NOT NULL DEFAULT 0,
  actual_protein INTEGER NOT NULL DEFAULT 0,
  actual_carbs INTEGER NOT NULL DEFAULT 0,
  actual_fats INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE meal_logs IS 'Daily meal adherence tracking';
COMMENT ON COLUMN meal_logs.status IS 'planned/eaten/swapped/missed/custom';

-- ── Water Logs ─────────────────────────────────────────────────────
-- Stores daily water intake
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  date DATE NOT NULL,
  glasses_consumed INTEGER NOT NULL DEFAULT 0,
  target_glasses INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, date)
);

COMMENT ON TABLE water_logs IS 'Daily water intake tracking';

-- ── Indexes ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_client_date ON nutrition_plans(client_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_logs_client_date ON meal_logs(client_id, date);
CREATE INDEX IF NOT EXISTS idx_water_logs_client_date ON water_logs(client_id, date);

-- ── RLS Policies ───────────────────────────────────────────────────
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

-- Coaches can CRUD their clients' nutrition data
CREATE POLICY nutrition_plans_coach ON nutrition_plans
  FOR ALL USING (auth.uid()::text = client_id OR EXISTS (
    SELECT 1 FROM coach_clients WHERE coach_id = auth.uid()::text AND client_id = nutrition_plans.client_id
  ));

CREATE POLICY meal_logs_coach ON meal_logs
  FOR ALL USING (auth.uid()::text = client_id OR EXISTS (
    SELECT 1 FROM coach_clients WHERE coach_id = auth.uid()::text AND client_id = meal_logs.client_id
  ));

CREATE POLICY water_logs_coach ON water_logs
  FOR ALL USING (auth.uid()::text = client_id OR EXISTS (
    SELECT 1 FROM coach_clients WHERE coach_id = auth.uid()::text AND client_id = water_logs.client_id
  ));

-- ── Updated At Trigger ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nutrition_plans_updated_at BEFORE UPDATE ON nutrition_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_logs_updated_at BEFORE UPDATE ON meal_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_water_logs_updated_at BEFORE UPDATE ON water_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
