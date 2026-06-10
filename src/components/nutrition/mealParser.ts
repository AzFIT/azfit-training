/* ═══════════════════════════════════════════
   MEAL PARSER — Natural language → food items
   Parses: "2 eggs, 1 cup rice, 150g chicken"
   ═══════════════════════════════════════════ */

export interface ParsedFoodItem {
  rawText: string
  foodName: string
  quantity: number
  unit: string
  confidence: 'high' | 'medium' | 'low'
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  a: 1, an: 1,
}

const UNIT_NORMALIZATION: Record<string, string> = {
  g: 'g', gram: 'g', grams: 'g',
  kg: 'kg', kilo: 'kg', kilogram: 'kg',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
  ml: 'ml', milliliter: 'ml',
  l: 'l', liter: 'l', litres: 'l',
  cup: 'cup', cups: 'cup',
  tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  slice: 'slice', slices: 'slice',
  piece: 'piece', pieces: 'piece',
  scoop: 'scoop', scoops: 'scoop',
  bowl: 'bowl', bowls: 'bowl',
  plate: 'plate', plates: 'plate',
  serving: 'serving', servings: 'serving',
  large: 'large', medium: 'medium', small: 'small',
}

function parseQuantity(raw: string): { quantity: number; unit: string; remaining: string } {
  const trimmed = raw.trim().toLowerCase()

  // Try pattern: "150g chicken" (number + unit stuck together)
  const attachedMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(g|gram|grams|kg|oz|lb|lbs|ml|l|cup|cups|tbsp|tsp|slice|slices|piece|pieces)\s+(.+)/i)
  if (attachedMatch) {
    const qty = parseFloat(attachedMatch[1])
    const unitRaw = attachedMatch[2].toLowerCase()
    const unit = UNIT_NORMALIZATION[unitRaw] || unitRaw
    return { quantity: qty, unit, remaining: attachedMatch[3].trim() }
  }

  // Try pattern: "2 eggs", "2.5 cups"
  const standardMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)/i)
  if (standardMatch) {
    const qty = parseFloat(standardMatch[1])
    const unitRaw = standardMatch[2].toLowerCase()
    const unit = UNIT_NORMALIZATION[unitRaw] || unitRaw
    return { quantity: qty, unit, remaining: standardMatch[3].trim() }
  }

  // Try pattern: "one egg", "a slice"
  const wordMatch = trimmed.match(/^(one|two|three|four|five|six|seven|eight|nine|ten|a|an)\s+(\w+)\s+(.+)/i)
  if (wordMatch) {
    const qty = NUMBER_WORDS[wordMatch[1].toLowerCase()] || 1
    const unitRaw = wordMatch[2].toLowerCase()
    const unit = UNIT_NORMALIZATION[unitRaw] || unitRaw
    return { quantity: qty, unit, remaining: wordMatch[3].trim() }
  }

  // Try pattern: "1/2 cup"
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)\s+(\w+)\s+(.+)/i)
  if (fractionMatch) {
    const qty = parseInt(fractionMatch[1]) / parseInt(fractionMatch[2])
    const unitRaw = fractionMatch[3].toLowerCase()
    const unit = UNIT_NORMALIZATION[unitRaw] || unitRaw
    return { quantity: qty, unit, remaining: fractionMatch[4].trim() }
  }

  // Fallback: no quantity found, assume 1 serving
  return { quantity: 1, unit: 'serving', remaining: trimmed }
}

export function parseMealDescription(text: string): ParsedFoodItem[] {
  if (!text.trim()) return []

  // Split by common delimiters
  const parts = text
    .split(/[,;\n]+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const results: ParsedFoodItem[] = []

  for (const part of parts) {
    const { quantity, unit, remaining } = parseQuantity(part)

    // Clean up food name
    let foodName = remaining
      .replace(/^(of\s+|with\s+|and\s+)/i, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Remove trailing descriptors for cleaner matching
    foodName = foodName.replace(/\s+(cooked|raw|grilled|fried|boiled|steamed|baked|roasted)$/i, '')

    if (foodName) {
      results.push({
        rawText: part,
        foodName,
        quantity,
        unit,
        confidence: unit === 'serving' && quantity === 1 ? 'low' : 'medium',
      })
    }
  }

  // Boost confidence for clear quantity+unit patterns
  results.forEach((r) => {
    if (r.unit === 'g' || r.unit === 'kg' || r.unit === 'oz' || r.unit === 'lb') {
      r.confidence = 'high'
    }
  })

  return results
}

/* ─── Convert parsed item to grams ─── */
export function convertToGrams(quantity: number, unit: string): number {
  switch (unit) {
    case 'g': return quantity
    case 'kg': return quantity * 1000
    case 'oz': return quantity * 28.35
    case 'lb': return quantity * 453.6
    case 'cup': return quantity * 240 // avg for solids
    case 'tbsp': return quantity * 15
    case 'tsp': return quantity * 5
    case 'slice': return quantity * 30 // avg bread slice
    case 'piece': return quantity * 50 // generic
    case 'scoop': return quantity * 30 // protein scoop
    case 'bowl': return quantity * 350
    case 'plate': return quantity * 500
    case 'serving': return quantity * 100 // default to 100g
    case 'large': return quantity * 60 // large egg
    case 'medium': return quantity * 50
    case 'small': return quantity * 40
    default: return quantity * 100
  }
}
