import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
export type MacroPreset = 'balanced' | 'low-carb' | 'high-protein' | 'keto' | 'custom';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface BodyStats {
  age: number;
  weight: number; // kg
  height: number; // cm
  bodyFat: number | null; // percentage, null if not known
  gender: Gender;
  activityLevel: ActivityLevel;
}

export interface MacroTargets {
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  calories: number;
}

export interface TDEEEntry {
  date: string; // ISO date string
  bmr: number;
  tdee: number;
  method: 'mifflin' | 'katch';
  bodyStats: BodyStats;
}

export interface MealEntry {
  id: string;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  timestamp: string;
  servings: number;
  notes?: string;
}

export interface DailyLog {
  date: string;
  meals: MealEntry[];
  waterIntake: number; // glasses
  weight?: number;
  notes?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
  weeklyLogs: number; // logs this week
  perfectDays: number; // days where all macros hit within 10%
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  category: 'streak' | 'macro' | 'logging' | 'meal-plan' | 'milestone';
  unlockedAt: string | null;
  progress: number;
  target: number;
  points: number;
}

export interface WeeklyPlan {
  weekStart: string; // ISO date
  days: DayPlan[];
}

export interface DayPlan {
  day: string; // 'Monday' etc
  meals: PlannedMeal[];
  macroTotals: { protein: number; carbs: number; fats: number; calories: number };
}

export interface PlannedMeal {
  id: string;
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  recipeUrl?: string;
  prepTime?: number;
  isQuickPrep: boolean;
}

/* ------------------------------------------------------------------ */
/*  ACTIVITY MULTIPLIERS                                               */
/* ------------------------------------------------------------------ */

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  'very-active': 1.9,
};

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const generateId = () => Math.random().toString(36).substring(2, 9);

const todayISO = () => new Date().toISOString().split('T')[0];

/** Compute BMR via Mifflin-St Jeor */
const calcMifflin = (w: number, h: number, a: number, g: Gender): number => {
  const base = 10 * w + 6.25 * h - 5 * a;
  return g === 'male' ? base + 5 : base - 161;
};

/** Compute BMR via Katch-McArdle */
const calcKatch = (w: number, bf: number): number => {
  const leanBodyMass = w * (1 - bf / 100);
  return 370 + 21.6 * leanBodyMass;
};

/** Apply preset ratios to calorie target */
const applyPreset = (preset: MacroPreset, calories: number): MacroTargets => {
  let proteinPct: number;
  let carbsPct: number;
  let fatsPct: number;

  switch (preset) {
    case 'low-carb':
      proteinPct = 0.35;
      carbsPct = 0.25;
      fatsPct = 0.40;
      break;
    case 'high-protein':
      proteinPct = 0.40;
      carbsPct = 0.30;
      fatsPct = 0.30;
      break;
    case 'keto':
      proteinPct = 0.25;
      carbsPct = 0.05;
      fatsPct = 0.70;
      break;
    case 'balanced':
    case 'custom':
    default:
      proteinPct = 0.30;
      carbsPct = 0.40;
      fatsPct = 0.30;
      break;
  }

  return {
    protein: Math.round((calories * proteinPct) / 4),
    carbs: Math.round((calories * carbsPct) / 4),
    fats: Math.round((calories * fatsPct) / 9),
    calories,
  };
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // streak
  { id: 'streak-3', title: '3-Day Streak', description: 'Log meals for 3 consecutive days', icon: 'Flame', category: 'streak', unlockedAt: null, progress: 0, target: 3, points: 10 },
  { id: 'streak-7', title: 'Week Warrior', description: 'Log meals for 7 consecutive days', icon: 'Flame', category: 'streak', unlockedAt: null, progress: 0, target: 7, points: 25 },
  { id: 'streak-30', title: 'Month Master', description: 'Log meals for 30 consecutive days', icon: 'Flame', category: 'streak', unlockedAt: null, progress: 0, target: 30, points: 100 },
  // macro
  { id: 'macro-hit', title: 'Macro Marksman', description: 'Hit all macros within 10% of target', icon: 'Target', category: 'macro', unlockedAt: null, progress: 0, target: 1, points: 15 },
  { id: 'macro-7', title: 'Perfect Week', description: 'Hit all macros for 7 days straight', icon: 'Target', category: 'macro', unlockedAt: null, progress: 0, target: 7, points: 50 },
  // logging
  { id: 'log-10', title: 'Getting Started', description: 'Log 10 total meals', icon: 'ClipboardList', category: 'logging', unlockedAt: null, progress: 0, target: 10, points: 10 },
  { id: 'log-50', title: 'Dedicated Logger', description: 'Log 50 total meals', icon: 'ClipboardList', category: 'logging', unlockedAt: null, progress: 0, target: 50, points: 30 },
  { id: 'log-100', title: 'Century Club', description: 'Log 100 total meals', icon: 'ClipboardList', category: 'logging', unlockedAt: null, progress: 0, target: 100, points: 75 },
  // meal-plan
  { id: 'plan-1', title: 'First Plan', description: 'Create your first weekly meal plan', icon: 'Calendar', category: 'meal-plan', unlockedAt: null, progress: 0, target: 1, points: 15 },
  { id: 'plan-adhere', title: 'Plan Follower', description: 'Follow a meal plan for 3 days', icon: 'Calendar', category: 'meal-plan', unlockedAt: null, progress: 0, target: 3, points: 25 },
  // milestone
  { id: 'milestone-water', title: 'Hydrated', description: 'Log 8 glasses of water in a day', icon: 'Droplets', category: 'milestone', unlockedAt: null, progress: 0, target: 8, points: 10 },
  { id: 'milestone-score', title: 'Nutrition Ace', description: 'Reach a nutrition score of 90+', icon: 'Trophy', category: 'milestone', unlockedAt: null, progress: 0, target: 90, points: 50 },
];

/* ------------------------------------------------------------------ */
/*  STATE INTERFACE                                                    */
/* ------------------------------------------------------------------ */

export interface NutritionState extends BodyStats {
  // Computed
  bmr: number;
  tdee: number;
  tdeeMethod: 'mifflin' | 'katch';

  // Targets
  macroTargets: MacroTargets;
  macroPreset: MacroPreset;
  calorieGoal: number; // tdee + deficit/surplus
  goalType: 'lose' | 'maintain' | 'gain';

  // Logs
  dailyLogs: DailyLog[];

  // Gamification
  streaks: StreakData;
  achievements: Achievement[];
  nutritionScore: number; // 0-100

  // Meal plan
  weeklyPlan: WeeklyPlan | null;

  // TDEE history (transient)
  tdeeHistory: TDEEEntry[];

  // Actions
  setBodyStats: (stats: Partial<BodyStats>) => void;
  calculateTDEE: () => void;
  setMacroPreset: (preset: MacroPreset) => void;
  setCustomMacros: (macros: Partial<MacroTargets>) => void;
  setGoalType: (goal: 'lose' | 'maintain' | 'gain') => void;
  addMealEntry: (entry: Omit<MealEntry, 'id' | 'timestamp'>) => void;
  removeMealEntry: (date: string, mealId: string) => void;
  logWater: (date: string, glasses: number) => void;
  updateStreaks: (streakData: Partial<StreakData>) => void;
  unlockAchievement: (achievementId: string) => void;
  updateNutritionScore: () => void;
  setWeeklyPlan: (plan: WeeklyPlan | null) => void;
  generateDemoData: () => void;
}

/* ------------------------------------------------------------------ */
/*  STORE                                                              */
/* ------------------------------------------------------------------ */

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      // BodyStats defaults
      age: 30,
      weight: 70,
      height: 170,
      bodyFat: null,
      gender: 'male',
      activityLevel: 'moderate',

      // Computed
      bmr: 0,
      tdee: 0,
      tdeeMethod: 'mifflin',

      // Targets
      macroTargets: applyPreset('balanced', 2500),
      macroPreset: 'balanced',
      calorieGoal: 2500,
      goalType: 'maintain',

      // Logs
      dailyLogs: [],

      // Gamification
      streaks: {
        currentStreak: 0,
        longestStreak: 0,
        lastLogDate: null,
        weeklyLogs: 0,
        perfectDays: 0,
      },
      achievements: DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a })),
      nutritionScore: 0,

      // Meal plan
      weeklyPlan: null,

      // TDEE history
      tdeeHistory: [],

      // Actions
      setBodyStats: (stats) => {
        set((state) => ({ ...state, ...stats }));
        get().calculateTDEE();
      },

      calculateTDEE: () => {
        const { weight, height, age, gender, activityLevel, bodyFat } = get();
        const mult = ACTIVITY_MULTIPLIERS[activityLevel];

        let bmr: number;
        let method: 'mifflin' | 'katch';

        if (bodyFat !== null && bodyFat > 0) {
          bmr = calcKatch(weight, bodyFat);
          method = 'katch';
        } else {
          bmr = calcMifflin(weight, height, age, gender);
          method = 'mifflin';
        }

        const tdee = Math.round(bmr * mult);
        const { goalType, macroPreset } = get();
        const calorieGoal =
          goalType === 'lose' ? tdee - 500 : goalType === 'gain' ? tdee + 300 : tdee;

        const macroTargets = applyPreset(macroPreset, calorieGoal);

        const entry: TDEEEntry = {
          date: new Date().toISOString(),
          bmr: Math.round(bmr),
          tdee,
          method,
          bodyStats: { weight, height, age, gender, activityLevel, bodyFat },
        };

        set({
          bmr: Math.round(bmr),
          tdee,
          tdeeMethod: method,
          calorieGoal,
          macroTargets,
          tdeeHistory: [...get().tdeeHistory.slice(-9), entry],
        });
      },

      setMacroPreset: (preset) => {
        const { calorieGoal } = get();
        const macroTargets = applyPreset(preset, calorieGoal);
        set({ macroPreset: preset, macroTargets });
      },

      setCustomMacros: (macros) => {
        const current = get().macroTargets;
        const next = { ...current, ...macros };
        // Recalculate calories from macros
        next.calories = next.protein * 4 + next.carbs * 4 + next.fats * 9;
        set({ macroTargets: next, macroPreset: 'custom' });
      },

      setGoalType: (goal) => {
        const { tdee, macroPreset } = get();
        const calorieGoal = goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee;
        const macroTargets = applyPreset(macroPreset, calorieGoal);
        set({ goalType: goal, calorieGoal, macroTargets });
      },

      addMealEntry: (entry) => {
        const date = todayISO();
        const newMeal: MealEntry = {
          ...entry,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };

        const logs = get().dailyLogs;
        const existing = logs.find((l) => l.date === date);

        let nextLogs: DailyLog[];
        if (existing) {
          nextLogs = logs.map((l) =>
            l.date === date ? { ...l, meals: [...l.meals, newMeal] } : l
          );
        } else {
          nextLogs = [...logs, { date, meals: [newMeal], waterIntake: 0 }];
        }

        set({ dailyLogs: nextLogs });
        get().updateNutritionScore();
      },

      removeMealEntry: (date, mealId) => {
        const nextLogs = get().dailyLogs.map((l) =>
          l.date === date ? { ...l, meals: l.meals.filter((m) => m.id !== mealId) } : l
        );
        set({ dailyLogs: nextLogs });
        get().updateNutritionScore();
      },

      logWater: (date, glasses) => {
        const logs = get().dailyLogs;
        const existing = logs.find((l) => l.date === date);
        let nextLogs: DailyLog[];
        if (existing) {
          nextLogs = logs.map((l) =>
            l.date === date ? { ...l, waterIntake: l.waterIntake + glasses } : l
          );
        } else {
          nextLogs = [...logs, { date, meals: [], waterIntake: glasses }];
        }
        set({ dailyLogs: nextLogs });
      },

      updateStreaks: (streakData) => {
        set({ streaks: { ...get().streaks, ...streakData } });
      },

      unlockAchievement: (achievementId) => {
        const next = get().achievements.map((a) =>
          a.id === achievementId && !a.unlockedAt
            ? { ...a, unlockedAt: new Date().toISOString(), progress: a.target }
            : a
        );
        set({ achievements: next });
      },

      updateNutritionScore: () => {
        const { dailyLogs, macroTargets } = get();
        if (dailyLogs.length === 0) {
          set({ nutritionScore: 0 });
          return;
        }

        const today = dailyLogs.find((l) => l.date === todayISO());
        if (!today || today.meals.length === 0) {
          set({ nutritionScore: get().nutritionScore }); // keep current
          return;
        }

        const totals = today.meals.reduce(
          (acc, m) => ({
            protein: acc.protein + m.protein,
            carbs: acc.carbs + m.carbs,
            fats: acc.fats + m.fats,
            calories: acc.calories + m.calories,
          }),
          { protein: 0, carbs: 0, fats: 0, calories: 0 }
        );

        const pScore = Math.min(totals.protein / macroTargets.protein, 1.5);
        const cScore = Math.min(totals.carbs / macroTargets.carbs, 1.5);
        const fScore = Math.min(totals.fats / macroTargets.fats, 1.5);
        const calScore = Math.min(totals.calories / macroTargets.calories, 1.5);

        const score = Math.round(
          (Math.min(pScore, 1) * 0.35 +
            Math.min(cScore, 1) * 0.25 +
            Math.min(fScore, 1) * 0.20 +
            Math.min(calScore, 1) * 0.20) *
            100
        );

        set({ nutritionScore: Math.min(score, 100) });
      },

      setWeeklyPlan: (plan) => set({ weeklyPlan: plan }),

      generateDemoData: () => {
        const bodyStats: BodyStats = {
          age: 30,
          weight: 70,
          height: 170,
          bodyFat: 15,
          gender: 'male',
          activityLevel: 'moderate',
        };

        // Calculate TDEE
        const mult = ACTIVITY_MULTIPLIERS.moderate;
        const bmr = calcKatch(70, 15);
        const tdee = Math.round(bmr * mult);
        const calorieGoal = tdee;
        const macroTargets = applyPreset('balanced', calorieGoal);

        // Generate 14 days of meal logs
        const mealNames: Record<MealType, string[]> = {
          breakfast: ['Oatmeal with Berries', 'Scrambled Eggs & Toast', 'Greek Yogurt Parfait', 'Protein Pancakes', 'Avocado Toast'],
          lunch: ['Grilled Chicken Salad', 'Quinoa Buddha Bowl', 'Turkey Sandwich', 'Salmon & Rice', 'Chicken Wrap'],
          dinner: ['Steak & Vegetables', 'Pasta Primavera', 'Grilled Fish & Potatoes', 'Stir Fry Tofu', 'Chicken Breast & Broccoli'],
          snack: ['Protein Bar', 'Apple & Peanut Butter', 'Mixed Nuts', 'Rice Cakes', 'Protein Shake'],
        };

        const dailyLogs: DailyLog[] = [];
        for (let d = 13; d >= 0; d--) {
          const date = new Date();
          date.setDate(date.getDate() - d);
          const dateStr = date.toISOString().split('T')[0];

          const meals: MealEntry[] = [];
          const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

          mealTypes.forEach((mt) => {
            const names = mealNames[mt];
            const name = names[Math.floor(Math.random() * names.length)];
            const calories = mt === 'breakfast'
              ? 400 + Math.floor(Math.random() * 200)
              : mt === 'lunch'
                ? 500 + Math.floor(Math.random() * 250)
                : mt === 'dinner'
                  ? 550 + Math.floor(Math.random() * 250)
                  : 150 + Math.floor(Math.random() * 150);

            const protein = Math.round(calories * (0.2 + Math.random() * 0.15) / 4);
            const carbs = Math.round(calories * (0.3 + Math.random() * 0.15) / 4);
            const fats = Math.round(calories * (0.2 + Math.random() * 0.15) / 9);

            meals.push({
              id: generateId(),
              name,
              mealType: mt,
              calories,
              protein,
              carbs,
              fats,
              fiber: Math.floor(Math.random() * 15) + 3,
              timestamp: `${dateStr}T${mt === 'breakfast' ? '08' : mt === 'lunch' ? '12' : mt === 'dinner' ? '19' : '15'}:00:00Z`,
              servings: 1,
            });
          });

          dailyLogs.push({
            date: dateStr,
            meals,
            waterIntake: 6 + Math.floor(Math.random() * 4),
          });
        }

        // 3 unlocked achievements
        const achievements = DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a }));
        achievements[0] = { ...achievements[0], progress: 3, target: 3, unlockedAt: new Date(Date.now() - 5 * 86400000).toISOString() }; // streak-3
        achievements[3] = { ...achievements[3], progress: 1, target: 1, unlockedAt: new Date(Date.now() - 3 * 86400000).toISOString() }; // macro-hit
        achievements[5] = { ...achievements[5], progress: 10, target: 10, unlockedAt: new Date(Date.now() - 7 * 86400000).toISOString() }; // log-10

        // Streak
        const streaks: StreakData = {
          currentStreak: 5,
          longestStreak: 5,
          lastLogDate: todayISO(),
          weeklyLogs: 5,
          perfectDays: 2,
        };

        const entry: TDEEEntry = {
          date: new Date().toISOString(),
          bmr: Math.round(bmr),
          tdee,
          method: 'katch',
          bodyStats,
        };

        set({
          ...bodyStats,
          bmr: Math.round(bmr),
          tdee,
          tdeeMethod: 'katch',
          macroTargets,
          macroPreset: 'balanced',
          calorieGoal,
          goalType: 'maintain',
          dailyLogs,
          streaks,
          achievements,
          nutritionScore: 78,
          weeklyPlan: null,
          tdeeHistory: [entry],
        });
      },
    }),
    {
      name: 'azfit-nutrition',
      partialize: (state) => ({
        age: state.age,
        weight: state.weight,
        height: state.height,
        bodyFat: state.bodyFat,
        gender: state.gender,
        activityLevel: state.activityLevel,
        macroTargets: state.macroTargets,
        macroPreset: state.macroPreset,
        calorieGoal: state.calorieGoal,
        goalType: state.goalType,
        dailyLogs: state.dailyLogs,
        streaks: state.streaks,
        achievements: state.achievements,
        nutritionScore: state.nutritionScore,
        weeklyPlan: state.weeklyPlan,
        // Note: bmr, tdee, tdeeMethod, tdeeHistory are NOT persisted
        // (recalculated on load via calculateTDEE)
      }),
    }
  )
);
