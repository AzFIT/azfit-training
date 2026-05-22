/**
 * Client data types and demo data generators for the AzFIT Client Portal.
 * These extend the base Client/CalendarEvent types with profile-specific fields.
 */

/** BioPrint measurement entry */
export interface BioPrintEntry {
  date: string;
  subscapular: number;
  tricep: number;
  bicep: number;
  iliac: number;
  supraspinal: number;
  abdominal: number;
  thigh: number;
  calf: number;
  sum: number;
  bodyFatPercent: number;
  leanMass: number;
  fatMass: number;
}

/** Body stats measurement */
export interface BodyStatsEntry {
  date: string;
  weight: number;
  neck: number;
  shoulder: number;
  chest: number;
  waist: number;
  hips: number;
  thigh: number;
  calf: number;
  arm: number;
  bodyFatPercent: number;
  bmi: number;
  whr: number;
}

/** Lifestyle assessment score */
export interface LifestyleScores {
  sleep: number;
  stress: number;
  nutrition: number;
  hydration: number;
  energy: number;
  digestion: number;
  recovery: number;
}

export interface LifestyleEntry {
  date: string;
  scores: LifestyleScores;
  notes: string;
  assessor: string;
}

/** Client note */
export interface ClientNote {
  id: string;
  date: string;
  author: string;
  category: 'Trainer Note' | 'Assessment Note' | 'General';
  content: string;
}

/** Session record */
export interface SessionRecord {
  id: string;
  date: string;
  type: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes: string;
}

/** PAR-Q response */
export interface PARQResponse {
  question1: boolean;
  question2: boolean;
  question3: boolean;
  question4: boolean;
  question5: boolean;
  question6: boolean;
  question7: boolean;
}

/** Full client profile data */
export interface FullClientProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive';
  age: number;
  weight: number;
  height: number;
  bodyFatPercent: number;
  program: string;
  complianceScore: number;
  joinDate: string;
  bioPrintHistory: BioPrintEntry[];
  bodyStatsHistory: BodyStatsEntry[];
  lifestyleHistory: LifestyleEntry[];
  notes: ClientNote[];
  sessions: SessionRecord[];
}

// Module-level caches to prevent repeated expensive data generation
let _cachedProfile: FullClientProfile | null = null;
let _cachedProfileIndex = -1;
const _sparklineCache: Record<string, number[]> = {};

// Demo data generators
const NAMES = ['Sarah Chen', 'Marcus Tan', 'David Lim', 'Jane Wong', 'Michael Lee', 'Emma Ng', 'James Koh', 'Lisa Ong', 'Robert Goh', 'Anna Chua', 'John Tan', 'Maria Lee'];
const PROGRAMS = ['Strength Builder', 'Fat Loss Pro', 'Hypertrophy', 'Athletic Performance', 'Rehabilitation', 'General Fitness'];
const SESSION_TYPES = ['Upper Body', 'Lower Body', 'Full Body', 'Cardio & Core', 'HIIT', 'Mobility', 'Strength Test', 'Program Review'];

function rand(min: number, max: number) { return Math.round((min + Math.random() * (max - min)) * 10) / 10; }
function randInt(min: number, max: number) { return Math.floor(min + Math.random() * (max - min + 1)); }
function dateDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

/** Generate a full client profile with complete data — cached per index */
export function generateClientProfile(index: number): FullClientProfile {
  if (_cachedProfile && _cachedProfileIndex === index) return _cachedProfile;
  _cachedProfileIndex = index;
  const name = NAMES[index % NAMES.length];
  _cachedProfile = {
    id: `client-${index}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
    status: index < 10 ? 'active' : 'inactive',
    age: randInt(22, 55),
    weight: randInt(55, 95),
    height: randInt(155, 185),
    bodyFatPercent: rand(12, 30),
    program: PROGRAMS[index % PROGRAMS.length],
    complianceScore: randInt(60, 98),
    joinDate: dateDaysAgo(90 - index * 5),
    bioPrintHistory: generateBioPrintHistory(),
    bodyStatsHistory: generateBodyStatsHistory(),
    lifestyleHistory: generateLifestyleHistory(),
    notes: generateNotes(name),
    sessions: generateSessions(index),
  };
  return _cachedProfile;
}

function generateBioPrintHistory(): BioPrintEntry[] {
  return Array.from({ length: 6 }, (_, i) => {
    const subscapular = rand(8, 16);
    const tricep = rand(6, 14);
    const bicep = rand(4, 10);
    const iliac = rand(10, 20);
    const supraspinal = rand(6, 14);
    const abdominal = rand(12, 24);
    const thigh = rand(10, 22);
    const calf = rand(6, 14);
    const sum = Math.round((subscapular + tricep + bicep + iliac + supraspinal + abdominal + thigh + calf) * 10) / 10;
    const bodyFatPercent = Math.round((495 / (1.10938 - 0.0008267 * sum + 0.0000016 * sum * sum - 0.0002574 * 30) - 450) * 10) / 10;
    const weight = randInt(60, 85);
    const fatMass = Math.round(weight * (bodyFatPercent / 100) * 10) / 10;
    return {
      date: dateDaysAgo(i * 14),
      subscapular, tricep, bicep, iliac, supraspinal, abdominal, thigh, calf,
      sum, bodyFatPercent, leanMass: Math.round((weight - fatMass) * 10) / 10, fatMass,
    };
  });
}

function generateBodyStatsHistory(): BodyStatsEntry[] {
  return Array.from({ length: 12 }, (_, i) => {
    const weight = rand(58, 88);
    const waist = rand(65, 95);
    const hips = rand(85, 110);
    const heightM = 1.65 + Math.random() * 0.15;
    return {
      date: dateDaysAgo(i * 7),
      weight,
      neck: rand(32, 42),
      shoulder: rand(100, 130),
      chest: rand(80, 110),
      waist,
      hips,
      thigh: rand(50, 65),
      calf: rand(32, 42),
      arm: rand(28, 38),
      bodyFatPercent: rand(12, 28),
      bmi: Math.round(weight / (heightM * heightM) * 10) / 10,
      whr: Math.round((waist / hips) * 100) / 100,
    };
  });
}

function generateLifestyleHistory(): LifestyleEntry[] {
  return Array.from({ length: 3 }, (_, i) => ({
    date: dateDaysAgo(i * 30),
    scores: {
      sleep: randInt(4, 9),
      stress: randInt(3, 8),
      nutrition: randInt(5, 9),
      hydration: randInt(4, 9),
      energy: randInt(5, 9),
      digestion: randInt(5, 9),
      recovery: randInt(4, 8),
    },
    notes: 'Regular assessment completed. Client progressing well.',
    assessor: 'Azwar',
  }));
}

function generateNotes(clientName: string): ClientNote[] {
  const categories: ClientNote['category'][] = ['Trainer Note', 'Assessment Note', 'General'];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `note-${i}`,
    date: dateDaysAgo(i * 5 + 2),
    author: 'Azwar',
    category: categories[i % 3],
    content: [
      `Great progress on squat form. ${clientName} hitting depth consistently now.`,
      `Body weight down 1.2kg from last week. Nutrition compliance is strong.`,
      'Discussed sleep hygiene. Client will aim for 7-8 hours nightly.',
      'Increased deadlift weight by 5kg. Form remains solid.',
      'BioPrint shows 2% body fat reduction over 4 weeks. Excellent result.',
      'Client reports improved energy levels throughout the day.',
      'Adjusted push-up variation to incline due to shoulder discomfort.',
      'Celebrated milestone: 10kg lost since starting program!',
    ][i % 8],
  }));
}

function generateSessions(clientIndex: number): SessionRecord[] {
  return Array.from({ length: 24 }, (_, i) => {
    const statuses: SessionRecord['status'][] = ['completed', 'completed', 'completed', 'completed', 'completed', 'confirmed', 'confirmed', 'pending', 'cancelled'];
    return {
      id: `session-${clientIndex}-${i}`,
      date: dateDaysAgo(i * 3 + (clientIndex % 2)),
      type: SESSION_TYPES[i % SESSION_TYPES.length],
      duration: [45, 60, 60, 60, 45, 30, 60, 45][i % 8],
      status: statuses[i % statuses.length],
      notes: i < 3 ? 'Latest session notes here.' : '',
    };
  });
}

/** Calculate Jackson-Pollock body fat % from sum of skinfolds */
export function calcBodyFat(sumOfSkinfolds: number, age: number, isMale = true): number {
  const bodyDensity = isMale
    ? 1.10938 - 0.0008267 * sumOfSkinfolds + 0.0000016 * sumOfSkinfolds * sumOfSkinfolds - 0.0002574 * age
    : 1.0994921 - 0.0009929 * sumOfSkinfolds + 0.0000023 * sumOfSkinfolds * sumOfSkinfolds - 0.0001392 * age;
  const bodyFat = (495 / bodyDensity) - 450;
  return Math.max(3, Math.min(50, Math.round(bodyFat * 10) / 10));
}

/** Generate sparkline data points — cached by parameters */
export function generateSparkline(count: number, base: number, variance: number): number[] {
  const key = `${count}-${base}-${variance}`;
  if (_sparklineCache[key]) return _sparklineCache[key];
  const data = Array.from({ length: count }, (_, i) => {
    const trend = Math.sin(i * 0.3) * variance * 0.5;
    const noise = (Math.random() - 0.5) * variance;
    return Math.round((base + trend + noise) * 10) / 10;
  });
  _sparklineCache[key] = data;
  return data;
}

/** BMI Category */
export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/** Body fat category for males */
export function bodyFatCategory(percent: number, _isMale = true): string {
  if (percent < 6) return 'Essential Fat';
  if (percent < 14) return 'Athletic';
  if (percent < 18) return 'Fitness';
  if (percent < 25) return 'Average';
  return 'Above Average';
}
