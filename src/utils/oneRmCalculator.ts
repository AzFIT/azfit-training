/**
 * One Rep Max (1RM) Calculator
 *
 * Supports four common estimation formulas:
 * - Epley:    weight * (1 + reps / 30)
 * - Brzycki:  weight * (36 / (37 - reps))
 * - Lombardi: weight * reps ^ 0.10
 * - Mayhew:   weight * (100 / (52.2 + 41.9 * e^(-0.055 * reps)))
 */

export type OneRMFormula = 'epley' | 'brzycki' | 'lombardi' | 'mayhew'

export interface OneRMResult {
  formula: OneRMFormula
  formulaName: string
  oneRM: number
  percentages: { percent: number; weight: number }[]
}

const PERCENTAGES = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95]

export function calculateOneRM(weight: number, reps: number, formula: OneRMFormula): number {
  if (weight <= 0 || reps <= 0) return 0

  // Cap reps at practical max for formula accuracy
  const r = Math.min(reps, 12)

  switch (formula) {
    case 'epley':
      return weight * (1 + r / 30)

    case 'brzycki':
      return weight * (36 / (37 - r))

    case 'lombardi':
      return weight * Math.pow(r, 0.10)

    case 'mayhew':
      return weight * (100 / (52.2 + 41.9 * Math.exp(-0.055 * r)))

    default:
      return 0
  }
}

export function calculateAllOneRMs(weight: number, reps: number): OneRMResult[] {
  const formulas: { key: OneRMFormula; name: string }[] = [
    { key: 'epley', name: 'Epley' },
    { key: 'brzycki', name: 'Brzycki' },
    { key: 'lombardi', name: 'Lombardi' },
    { key: 'mayhew', name: 'Mayhew' },
  ]

  return formulas.map(({ key, name }) => {
    const oneRM = calculateOneRM(weight, reps, key)
    return {
      formula: key,
      formulaName: name,
      oneRM: Math.round(oneRM * 10) / 10,
      percentages: PERCENTAGES.map((pct) => ({
        percent: pct,
        weight: Math.round(oneRM * (pct / 100) * 10) / 10,
      })),
    }
  })
}

export function getAverageOneRM(weight: number, reps: number): number {
  const results = calculateAllOneRMs(weight, reps)
  const avg = results.reduce((sum, r) => sum + r.oneRM, 0) / results.length
  return Math.round(avg * 10) / 10
}
