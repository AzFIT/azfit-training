/**
 * CoachRx Letter Notation Algorithm
 *
 * Reference: https://www.coachrx.app/articles/pro-tip-set-types
 *
 * Rules:
 * - Straight Set (set_type_id === 1): Plain letter — A, B, C, D
 * - Superset/Triset/Giant Set/Circuit/Complex (any non-straight): ALL numbered — A1, A2, B1, B2
 * - Each group of consecutive same-type exercises gets one letter
 * - Number restarts at 1 for each new letter group
 */

export interface NotationInput {
  exercise_order: number
  set_type_id: number
}

/**
 * Compute CoachRx letter notation for a list of exercises in a day's workout.
 *
 * @param exercises - Array of exercises ordered by exercise_order, each with set_type_id
 * @returns Array of notation strings (e.g., ['A', 'B1', 'B2', 'C', 'D1', 'D2', 'D3'])
 */
export function computeLetterNotation(exercises: NotationInput[]): string[] {
  const letters: string[] = []
  let letterIdx = 0 // 0 = 'A'

  for (let i = 0; i < exercises.length; i++) {
    const st = exercises[i].set_type_id

    if (st === 1) {
      // Straight Set = plain letter
      letters.push(String.fromCharCode(65 + letterIdx))
      letterIdx++
    } else {
      // Non-straight: find consecutive group with same set_type
      const groupStart = i
      while (i < exercises.length && exercises[i].set_type_id === st) {
        i++
      }
      const groupSize = i - groupStart
      i-- // back up one (for loop will increment)

      const letter = String.fromCharCode(65 + letterIdx)
      for (let j = 1; j <= groupSize; j++) {
        letters.push(`${letter}${j}`)
      }
      letterIdx++
    }
  }

  return letters
}

/**
 * Check if a notation is a plain letter (straight set) or numbered (group).
 */
export function isPlainLetter(notation: string): boolean {
  return notation.length === 1 && /^[A-Z]$/.test(notation)
}

/**
 * Get the base letter from a notation (e.g., 'B2' → 'B').
 */
export function getBaseLetter(notation: string): string {
  return notation.charAt(0)
}
