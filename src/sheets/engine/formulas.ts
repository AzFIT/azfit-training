/**
 * AzFIT.ai — Formula Engine
 * Evaluates spreadsheet formulas including fitness-specific functions
 */

import type { CellValue, CellPosition, CellRange, ParsedFormula, FormulaError } from '../types';
import { parseCellRef, parseRange } from '../types';

export type CellResolver = (pos: CellPosition) => CellValue;
export type RangeResolver = (range: CellRange) => CellValue[];

export function createFormulaError(type: FormulaError['type'], message: string): FormulaError {
  return { type, message };
}

export function isFormulaError(value: unknown): value is FormulaError {
  return value !== null && typeof value === 'object' && 'type' in value && 'message' in value;
}

/**
 * Parse a formula string into function name and arguments
 */
export function parseFormula(formula: string): ParsedFormula | FormulaError {
  if (!formula.startsWith('=')) {
    return createFormulaError('VALUE', 'Formula must start with =');
  }

  const body = formula.slice(1).trim();
  
  // Match function call: NAME(args)
  const funcMatch = body.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\((.*)\)$/);
  if (funcMatch) {
    const name = funcMatch[1].toUpperCase();
    const argsStr = funcMatch[2];
    const args = parseArgs(argsStr);
    return { raw: formula, name, args };
  }

  // Simple expression (e.g. =A1+B1)
  return { raw: formula, name: 'EXPR', args: [body] };
}

function parseArgs(argsStr: string): (string | number | CellRange | CellPosition)[] {
  const args: (string | number | CellRange | CellPosition)[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < argsStr.length; i++) {
    const ch = argsStr[i];
    if (ch === '(') { depth++; current += ch; }
    else if (ch === ')') { depth--; current += ch; }
    else if (ch === ',' && depth === 0) {
      args.push(parseArg(current.trim()));
      current = '';
    }
    else { current += ch; }
  }
  if (current.trim()) args.push(parseArg(current.trim()));
  return args;
}

function parseArg(arg: string): string | number | CellRange | CellPosition {
  // Number
  if (/^-?\d+(\.\d+)?$/.test(arg)) return parseFloat(arg);
  // Range
  const range = parseRange(arg);
  if (range) return range;
  // Cell ref
  const cell = parseCellRef(arg);
  if (cell) return cell;
  // String literal (remove quotes)
  if (arg.startsWith('"') && arg.endsWith('"')) return arg.slice(1, -1);
  // Raw string
  return arg;
}

/**
 * Evaluate a formula given cell and range resolvers
 */
export function evaluateFormula(
  formula: string,
  resolveCell: CellResolver,
  resolveRange: RangeResolver
): CellValue | FormulaError {
  const parsed = parseFormula(formula);
  if (isFormulaError(parsed)) return parsed;

  try {
    return evaluateParsed(parsed, resolveCell, resolveRange);
  } catch (err) {
    return createFormulaError('VALUE', err instanceof Error ? err.message : 'Evaluation error');
  }
}

function evaluateParsed(
  parsed: ParsedFormula,
  resolveCell: CellResolver,
  resolveRange: RangeResolver
): CellValue | FormulaError {
  if (parsed.name === 'EXPR') {
    return evaluateExpression(parsed.args[0] as string, resolveCell, resolveRange);
  }

  const args = parsed.args.map(arg => {
    if (typeof arg === 'number') return arg;
    if (typeof arg === 'string') return arg;
    if ('start' in arg && 'end' in arg) return resolveRange(arg as CellRange);
    if ('row' in arg && 'col' in arg) return resolveCell(arg as CellPosition);
    return arg;
  });

  const fn = FORMULA_LIBRARY[parsed.name];
  if (!fn) {
    return createFormulaError('NAME', `Unknown function: ${parsed.name}`);
  }

  return fn(args) as CellValue | FormulaError;
}

function evaluateExpression(
  expr: string,
  resolveCell: CellResolver,
  resolveRange: RangeResolver
): CellValue | FormulaError {
  // Replace cell references with their values
  let processed = expr;
  
  // Replace ranges first (A1:A5)
  processed = processed.replace(/([A-Z]+\d+):([A-Z]+\d+)/g, (_match, start, end) => {
    const range = parseRange(`${start}:${end}`);
    if (!range) return '0';
    const values = resolveRange(range);
    const nums = values.filter((v): v is number => typeof v === 'number');
    if (nums.length === 0) return '0';
    return String(nums.reduce((a, b) => a + b, 0));
  });

  // Replace cell refs (A1, B2)
  processed = processed.replace(/([A-Z]+\d+)/g, (match) => {
    const pos = parseCellRef(match);
    if (!pos) return '0';
    const val = resolveCell(pos);
    if (val === null || val === undefined) return '0';
    if (typeof val === 'boolean') return val ? '1' : '0';
    return String(val);
  });

  // Safe evaluation
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${processed})`)();
    if (typeof result === 'number' && !Number.isFinite(result)) {
      return createFormulaError('DIV/0', 'Division by zero');
    }
    return result;
  } catch {
    return createFormulaError('VALUE', `Invalid expression: ${expr}`);
  }
}

// Helper: flatten mixed args to numbers
function flattenNumbers(args: unknown[]): number[] {
  const result: number[] = [];
  for (const arg of args) {
    if (typeof arg === 'number') result.push(arg);
    else if (Array.isArray(arg)) {
      for (const v of arg) {
        if (typeof v === 'number') result.push(v);
      }
    }
  }
  return result;
}

// Helper: flatten mixed args to all values
function flattenValues(args: unknown[]): CellValue[] {
  const result: CellValue[] = [];
  for (const arg of args) {
    if (Array.isArray(arg)) result.push(...arg);
    else result.push(arg as CellValue);
  }
  return result;
}

// ============================================================================
// FORMULA LIBRARY
// ============================================================================

export const FORMULA_LIBRARY: Record<string, (args: unknown[]) => unknown> = {
  // Math functions
  SUM: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length === 0) return 0;
    return nums.reduce((a, b) => a + b, 0);
  },

  AVG: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length === 0) return createFormulaError('DIV/0', 'No numeric values');
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  },

  AVERAGE: (args) => FORMULA_LIBRARY.AVG(args),

  MIN: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length === 0) return createFormulaError('VALUE', 'No numeric values');
    return Math.min(...nums);
  },

  MAX: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length === 0) return createFormulaError('VALUE', 'No numeric values');
    return Math.max(...nums);
  },

  COUNT: (args) => {
    const nums = flattenNumbers(args);
    return nums.length;
  },

  COUNTA: (args) => {
    const vals = flattenValues(args);
    return vals.filter(v => v !== null && v !== undefined && v !== '').length;
  },

  ROUND: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length === 0) return createFormulaError('VALUE', 'No numeric values');
    const num = nums[0];
    const digits = nums[1] ?? 0;
    const factor = Math.pow(10, digits);
    return Math.round(num * factor) / factor;
  },

  ABS: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length === 0) return createFormulaError('VALUE', 'No numeric values');
    return Math.abs(nums[0]);
  },

  // Logic functions
  IF: (args) => {
    const [condition, trueVal, falseVal] = args;
    const isTrue = condition === true || condition === 1 || condition === 'true';
    return isTrue ? (trueVal ?? true) : (falseVal ?? false);
  },

  AND: (args) => {
    const vals = flattenValues(args);
    return vals.every(v => v === true || v === 1 || v === 'true');
  },

  OR: (args) => {
    const vals = flattenValues(args);
    return vals.some(v => v === true || v === 1 || v === 'true');
  },

  NOT: (args) => {
    const [val] = args;
    return !(val === true || val === 1 || val === 'true');
  },

  // Lookup functions
  VLOOKUP: (args) => {
    const [lookupVal, tableRange, colIndex] = args;
    const table = Array.isArray(tableRange) ? tableRange : [];
    const idx = typeof colIndex === 'number' ? Math.floor(colIndex) : 1;
    
    for (let i = 0; i < table.length; i += idx) {
      const rowStart = i - (i % idx);
      if (table[rowStart] === lookupVal) {
        return table[rowStart + idx - 1] ?? null;
      }
    }
    return createFormulaError('N/A', `Value not found: ${lookupVal}`);
  },

  INDEX: (args) => {
    const [array, rowNum, colNum] = args;
    const arr = Array.isArray(array) ? array : [];
    const row = typeof rowNum === 'number' ? Math.floor(rowNum) - 1 : 0;
    const col = typeof colNum === 'number' ? Math.floor(colNum) - 1 : 0;
    const flat = arr.flat();
    const index = row * (col + 1) + col;
    return flat[index] ?? createFormulaError('REF', 'Index out of range');
  },

  MATCH: (args) => {
    const [lookupVal, lookupArray] = args;
    const arr = Array.isArray(lookupArray) ? lookupArray : [];
    const index = arr.findIndex(v => v === lookupVal);
    if (index === -1) return createFormulaError('N/A', 'No match found');
    return index + 1;
  },

  // ==========================================================================
  // FITNESS-SPECIFIC FORMULAS
  // ==========================================================================

  /** Volume = load × reps × sets */
  VOLUME: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length < 2) return createFormulaError('VALUE', 'VOLUME needs at least load and reps');
    const [load, reps, sets = 1] = nums;
    return load * reps * sets;
  },

  /** Epley 1RM formula: weight × (1 + reps/30) */
  E1RM: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length < 2) return createFormulaError('VALUE', 'E1RM needs weight and reps');
    const [weight, reps] = nums;
    return weight * (1 + reps / 30);
  },

  /** Brzycki 1RM formula: weight / (1.0278 - 0.0278 × reps) */
  B1RM: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length < 2) return createFormulaError('VALUE', 'B1RM needs weight and reps');
    const [weight, reps] = nums;
    return weight / (1.0278 - 0.0278 * reps);
  },

  /** Lombardi 1RM formula: weight × reps^0.10 */
  L1RM: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length < 2) return createFormulaError('VALUE', 'L1RM needs weight and reps');
    const [weight, reps] = nums;
    return weight * Math.pow(reps, 0.10);
  },

  /** BMI = weight(kg) / height(m)^2 */
  BMI: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length < 2) return createFormulaError('VALUE', 'BMI needs weight(kg) and height(m)');
    const [weight, height] = nums;
    if (height <= 0) return createFormulaError('DIV/0', 'Height must be > 0');
    return weight / (height * height);
  },

  /** BMR (Mifflin-St Jeor): 
   * Male: 10W + 6.25H - 5A + 5
   * Female: 10W + 6.25H - 5A - 161
   */
  BMR: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length < 3) return createFormulaError('VALUE', 'BMR needs weight(kg), height(cm), age');
    const [weight, height, age, isMale = 1] = nums;
    const base = 10 * weight + 6.25 * height - 5 * age;
    return isMale ? base + 5 : base - 161;
  },

  /** TDEE = BMR × activity multiplier */
  TDEE: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length < 4) return createFormulaError('VALUE', 'TDEE needs weight, height, age, activity');
    const [weight, height, age, activity, isMale = 1] = nums;
    const bmr = (10 * weight + 6.25 * height - 5 * age) + (isMale ? 5 : -161);
    return bmr * activity;
  },

  /** Body Fat % (Navy method for men): 
   * 86.010 × log10(abdomen - neck) - 70.041 × log10(height) + 36.76
   */
  BFP: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length < 3) return createFormulaError('VALUE', 'BFP needs abdomen, neck, height(cm)');
    const [abdomen, neck, height] = nums;
    const a = abdomen - neck;
    if (a <= 0) return createFormulaError('VALUE', 'Abdomen must be > neck');
    return 86.010 * Math.log10(a) - 70.041 * Math.log10(height) + 36.76;
  },

  /** Progression % = (current - previous) / previous × 100 */
  PCT: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length < 2) return createFormulaError('VALUE', 'PCT needs current and previous');
    const [current, previous] = nums;
    if (previous === 0) return createFormulaError('DIV/0', 'Previous value is 0');
    return ((current - previous) / previous) * 100;
  },

  /** Total Load = sum of (weight × reps) for all sets */
  TLOAD: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length === 0) return 0;
    let total = 0;
    for (let i = 0; i < nums.length; i += 2) {
      const weight = nums[i] ?? 0;
      const reps = nums[i + 1] ?? 0;
      total += weight * reps;
    }
    return total;
  },

  /** Wilks score (simplified) */
  WILKS: (args) => {
    const nums = flattenNumbers(args);
    if (nums.length < 2) return createFormulaError('VALUE', 'WILKS needs total(kg) and bodyweight(kg)');
    const [total, bw] = nums;
    const isMale = nums[2] ?? 1;
    const a = isMale ? -216.0475144 : 594.31747775582;
    const b = isMale ? 16.2606339 : -27.23842536447;
    const c = isMale ? -0.002388645 : 0.82112226871;
    const d = isMale ? -0.00113732 : -0.00930733913;
    const e = isMale ? 7.01863e-6 : 4.731582e-5;
    const f = isMale ? -1.291e-8 : -9.054e-8;
    const coeff = 500 / (a + b * bw + c * bw * bw + d * Math.pow(bw, 3) + e * Math.pow(bw, 4) + f * Math.pow(bw, 5));
    return total * coeff;
  },
  // Placeholder for future formulas
  PLACEHOLDER: (_args) => {
    return createFormulaError('NAME', 'Not implemented');
  },
};

/** List all available formula names for autocomplete */
export function getFormulaNames(): string[] {
  return Object.keys(FORMULA_LIBRARY);
}

/** Get formula description for help text */
export function getFormulaDescription(name: string): string {
  const descriptions: Record<string, string> = {
    SUM: 'SUM(value1, value2, ...): Adds all numbers',
    AVG: 'AVG(value1, value2, ...): Average of all numbers',
    AVERAGE: 'AVERAGE(value1, value2, ...): Same as AVG',
    MIN: 'MIN(value1, value2, ...): Smallest number',
    MAX: 'MAX(value1, value2, ...): Largest number',
    COUNT: 'COUNT(value1, value2, ...): Count of numbers',
    COUNTA: 'COUNTA(value1, value2, ...): Count of non-empty cells',
    ROUND: 'ROUND(number, digits): Round to decimal places',
    ABS: 'ABS(number): Absolute value',
    IF: 'IF(condition, trueVal, falseVal): Conditional value',
    AND: 'AND(value1, value2, ...): True if all are true',
    OR: 'OR(value1, value2, ...): True if any is true',
    NOT: 'NOT(value): Logical negation',
    VLOOKUP: 'VLOOKUP(lookup, table, col): Vertical lookup',
    INDEX: 'INDEX(array, row, col): Value at position',
    MATCH: 'MATCH(lookup, array): Position of match',
    VOLUME: 'VOLUME(load, reps, sets): Training volume',
    E1RM: 'E1RM(weight, reps): Epley 1-rep max',
    B1RM: 'B1RM(weight, reps): Brzycki 1-rep max',
    L1RM: 'L1RM(weight, reps): Lombardi 1-rep max',
    BMI: 'BMI(weight, height): Body mass index',
    BMR: 'BMR(weight, height, age, isMale): Basal metabolic rate',
    TDEE: 'TDEE(weight, height, age, activity, isMale): Total daily energy',
    BFP: 'BFP(abdomen, neck, height): Body fat % (Navy)',
    PCT: 'PCT(current, previous): Percentage change',
    TLOAD: 'TLOAD(w1, r1, w2, r2, ...): Total load from sets',
    WILKS: 'WILKS(total, bw, isMale): Wilks strength score',
  };
  return descriptions[name] ?? `${name}(...): Custom formula`;
}
