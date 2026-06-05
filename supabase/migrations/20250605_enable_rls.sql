-- ============================================================
-- AzFIT RLS Migration — 2025-06-05
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Public reference tables: allow anonymous read ───────────
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS set_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS training_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS periodization_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS days_per_week ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS time_durations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS program_durations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow public read" ON categories;
DROP POLICY IF EXISTS "Allow public read" ON levels;
DROP POLICY IF EXISTS "Allow public read" ON equipment;
DROP POLICY IF EXISTS "Allow public read" ON exercises;
DROP POLICY IF EXISTS "Allow public read" ON muscle_groups;
DROP POLICY IF EXISTS "Allow public read" ON set_types;
DROP POLICY IF EXISTS "Allow public read" ON training_splits;
DROP POLICY IF EXISTS "Allow public read" ON periodization_phases;
DROP POLICY IF EXISTS "Allow public read" ON programs;
DROP POLICY IF EXISTS "Allow public read" ON program_exercises;
DROP POLICY IF EXISTS "Allow public read" ON days_per_week;
DROP POLICY IF EXISTS "Allow public read" ON time_durations;
DROP POLICY IF EXISTS "Allow public read" ON program_durations;

CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON levels FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON equipment FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON exercises FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON muscle_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON set_types FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON training_splits FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON periodization_phases FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON programs FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON program_exercises FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON days_per_week FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON time_durations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON program_durations FOR SELECT USING (true);

-- ── User data tables: RLS restricted to owner ───────────────
ALTER TABLE IF EXISTS client_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workout_set_logs ENABLE ROW LEVEL SECURITY;

-- client_programs
DROP POLICY IF EXISTS "Users manage own programs" ON client_programs;
CREATE POLICY "Users manage own programs"
  ON client_programs
  FOR ALL
  USING (auth.uid()::text = client_id)
  WITH CHECK (auth.uid()::text = client_id);

-- workout_sessions
DROP POLICY IF EXISTS "Users manage own sessions" ON workout_sessions;
CREATE POLICY "Users manage own sessions"
  ON workout_sessions
  FOR ALL
  USING (auth.uid()::text = client_id)
  WITH CHECK (auth.uid()::text = client_id);

-- workout_set_logs (via session ownership)
DROP POLICY IF EXISTS "Users manage own set logs" ON workout_set_logs;
CREATE POLICY "Users manage own set logs"
  ON workout_set_logs
  FOR ALL
  USING (session_id IN (
    SELECT session_id FROM workout_sessions WHERE client_id = auth.uid()::text
  ))
  WITH CHECK (session_id IN (
    SELECT session_id FROM workout_sessions WHERE client_id = auth.uid()::text
  ));
