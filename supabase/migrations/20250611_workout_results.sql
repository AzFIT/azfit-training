-- ============================================================
-- Workout Results Table for Leaderboard
-- 2025-06-11
-- ============================================================

CREATE TABLE IF NOT EXISTS workout_results (
  result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id INTEGER REFERENCES workout_sessions(session_id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  program_id INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  week_number INTEGER NOT NULL,

  -- Result for leaderboard
  result_value DECIMAL(8,2) NOT NULL,
  result_type TEXT NOT NULL CHECK (result_type IN ('load', 'reps', 'time', 'rounds')),
  result_label TEXT NOT NULL,

  is_rx BOOLEAN DEFAULT true,
  duration_seconds INTEGER,
  completed_sets INTEGER,
  total_sets INTEGER,
  pr_badges TEXT[] DEFAULT '{}',

  -- Social
  likes INTEGER DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',

  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_workout_results_program_date ON workout_results(program_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_results_client ON workout_results(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_results_rx ON workout_results(is_rx);

-- RLS
ALTER TABLE workout_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read workout_results"
  ON workout_results FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert workout_results"
  ON workout_results FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update own workout_results"
  ON workout_results FOR UPDATE TO authenticated USING (client_id = auth.uid()::text);
