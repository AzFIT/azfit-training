-- ============================================================
-- AzFIT Multi-Tenant RLS Policies
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Coach Context Helper ─────────────────────────────────

CREATE OR REPLACE FUNCTION set_coach_id(coach_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_coach_id', coach_id, false);
END;
$$;

-- ── 2. Admin Check Helper ───────────────────────────────────

CREATE OR REPLACE FUNCTION is_current_coach_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM coaches
    WHERE id::text = current_setting('app.current_coach_id', true)
    AND role = 'admin'
  );
$$;

-- ── 3. Enable RLS on Core Tables ────────────────────────────

ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- ── 4. Coach-Scoped Policies ────────────────────────────────

-- Coaches can only see their own record
CREATE POLICY coach_self ON coaches
  FOR ALL USING (id::text = current_setting('app.current_coach_id', true));

-- Coaches can only see their own clients
CREATE POLICY coach_clients ON clients
  FOR ALL USING (coach_id::text = current_setting('app.current_coach_id', true));

-- Coaches can only see their own programs
CREATE POLICY coach_programs ON programs
  FOR ALL USING (coach_id::text = current_setting('app.current_coach_id', true));

-- Exercises are read-only for all coaches (shared library)
CREATE POLICY exercises_read ON exercises
  FOR SELECT USING (true);

-- Coaches can only see their own notes
CREATE POLICY coach_notes ON notes
  FOR ALL USING (coach_id::text = current_setting('app.current_coach_id', true));

-- Coaches can only see their own photos
CREATE POLICY coach_photos ON photos
  FOR ALL USING (coach_id::text = current_setting('app.current_coach_id', true));

-- Coaches can only see their own workout sessions
CREATE POLICY coach_workouts ON workout_sessions
  FOR ALL USING (coach_id::text = current_setting('app.current_coach_id', true));

-- ── 5. Admin Override Policies ──────────────────────────────

-- Admins can see all coaches
CREATE POLICY admin_all_coaches ON coaches
  FOR ALL USING (is_current_coach_admin())
  WITH CHECK (is_current_coach_admin());

-- Admins can see all clients
CREATE POLICY admin_all_clients ON clients
  FOR ALL USING (is_current_coach_admin())
  WITH CHECK (is_current_coach_admin());

-- Admins can see all programs
CREATE POLICY admin_all_programs ON programs
  FOR ALL USING (is_current_coach_admin())
  WITH CHECK (is_current_coach_admin());

-- ── 6. Admin RPC Functions ──────────────────────────────────

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT is_current_coach_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  SELECT jsonb_build_object(
    'total_coaches', (SELECT COUNT(*) FROM coaches),
    'total_clients', (SELECT COUNT(*) FROM clients),
    'total_programs', (SELECT COUNT(*) FROM programs),
    'total_exercises', (SELECT COUNT(*) FROM exercises),
    'active_clients', (SELECT COUNT(*) FROM clients WHERE status = 'active'),
    'paused_clients', (SELECT COUNT(*) FROM clients WHERE status = 'paused'),
    'archived_clients', (SELECT COUNT(*) FROM clients WHERE status = 'archived'),
    'recent_signups', (SELECT COUNT(*) FROM coaches WHERE created_at >= NOW() - INTERVAL '30 days')
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_all_coaches_with_stats()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  business_name TEXT,
  specialty TEXT,
  role TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  client_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF NOT is_current_coach_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.full_name,
    c.email,
    c.business_name,
    c.specialty,
    c.role,
    c.last_login,
    c.created_at,
    COUNT(cl.id) AS client_count
  FROM coaches c
  LEFT JOIN clients cl ON cl.coach_id = c.id::text
  GROUP BY c.id
  ORDER BY c.created_at DESC;
END;
$$;
