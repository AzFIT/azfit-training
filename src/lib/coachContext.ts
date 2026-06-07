/**
 * Coach Context Helper for Supabase RLS
 *
 * The azfit-client-portal uses a multi-tenant pattern where each coach's data
 * is isolated via Row Level Security (RLS) policies. This helper sets the
 * `app.current_coach_id` session variable before making Supabase queries,
 * ensuring RLS policies filter data correctly.
 *
 * Usage:
 *   import { withCoachContext } from './coachContext'
 *   const data = await withCoachContext(coachId, () => supabase.from('clients').select('*'))
 *
 * Prerequisites (run in Supabase SQL Editor):
 *   CREATE OR REPLACE FUNCTION set_coach_id(coach_id TEXT)
 *   RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
 *   BEGIN
 *     PERFORM set_config('app.current_coach_id', coach_id, false);
 *   END;
 *   $$;
 *
 * Then enable RLS on tables and create policies like:
 *   ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY coach_clients ON clients
 *     FOR ALL USING (coach_id::text = current_setting('app.current_coach_id', true));
 */

import { supabase } from './supabase'

let currentCoachId: string | null = null

/**
 * Set the coach context for subsequent Supabase queries.
 * Call this once after login or when switching coaches.
 */
export async function setCoachContext(coachId: string): Promise<void> {
  const { error } = await supabase.rpc('set_coach_id', { coach_id: coachId })
  if (error) {
    console.error('[CoachContext] Failed to set coach context:', error)
    throw error
  }
  currentCoachId = coachId
}

/**
 * Get the currently set coach ID (client-side cache).
 */
export function getCurrentCoachId(): string | null {
  return currentCoachId
}

/**
 * Clear the coach context (e.g., on logout).
 */
export async function clearCoachContext(): Promise<void> {
  currentCoachId = null
}

/**
 * Wrap a Supabase query with coach context.
 * Ensures the coach ID is set before executing the query.
 */
export async function withCoachContext<T>(
  coachId: string,
  queryFn: () => Promise<T>
): Promise<T> {
  await setCoachContext(coachId)
  return queryFn()
}
