/**
 * Date utilities for workout program scheduling
 */

/**
 * Calculate the current week and day for a client program given a start date.
 */
export function getCurrentWeekAndDay(
  startDate: string | Date,
  daysPerWeek: number,
  totalWeeks: number
): { week: number; day: number; isComplete: boolean } {
  const start = new Date(startDate)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Assume workouts happen on consecutive days for simplicity
  // In production, you'd map to actual scheduled days
  const totalWorkoutDays = totalWeeks * daysPerWeek
  const currentWorkoutDay = Math.min(diffDays + 1, totalWorkoutDays)

  const week = Math.ceil(currentWorkoutDay / daysPerWeek)
  const day = ((currentWorkoutDay - 1) % daysPerWeek) + 1

  return {
    week: Math.min(week, totalWeeks),
    day: day,
    isComplete: currentWorkoutDay >= totalWorkoutDays,
  }
}

/**
 * Calculate progress percentage through a program.
 */
export function calculateProgramProgress(
  startDate: string | Date,
  totalWeeks: number,
  daysPerWeek: number
): number {
  const { week, day, isComplete } = getCurrentWeekAndDay(startDate, daysPerWeek, totalWeeks)

  if (isComplete) return 100

  const totalDays = totalWeeks * daysPerWeek
  const completedDays = (week - 1) * daysPerWeek + (day - 1)

  return Math.round((completedDays / totalDays) * 100)
}

/**
 * Format seconds into mm:ss or "Xs" display.
 */
export function formatRestTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) return `${mins}m`
  return `${mins}m ${secs}s`
}

/**
 * Format tempo string for display (e.g., "2010" → "2-0-1-0").
 */
export function formatTempo(tempo: string | null | undefined): string {
  if (!tempo) return '-'
  if (tempo.toLowerCase() === 'hold') return 'Hold'
  // If already contains dashes or commas, return as-is
  if (/[-,]/.test(tempo)) return tempo
  // Otherwise, split digits and join with dashes
  const digits = tempo.split('')
  if (digits.length === 4) {
    return `${digits[0]}-${digits[1]}-${digits[2]}-${digits[3]}`
  }
  return tempo
}

/**
 * Format a program duration string.
 */
export function formatDuration(weeks: number): string {
  return `${weeks} week${weeks !== 1 ? 's' : ''}`
}

/**
 * Format days per week string.
 */
export function formatDaysPerWeek(days: number): string {
  return `${days} day${days !== 1 ? 's' : ''}/week`
}

/**
 * Get a readable date string.
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
