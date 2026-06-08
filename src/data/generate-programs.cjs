const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/exercise-db.json', 'utf8'));

const CATEGORY_MAP = {
  'Strength': { categoryId: 3, categoryName: 'Strength', goal: 'strength' },
  'Cardio': { categoryId: 6, categoryName: 'Fat Loss', goal: 'lose-fat' },
  'Performance': { categoryId: 8, categoryName: 'Sports Performance', goal: 'performance' },
  'Recovery': { categoryId: 7, categoryName: 'General Fitness', goal: 'general-fitness' },
  'Powerlifting': { categoryId: 3, categoryName: 'Strength', goal: 'strength' },
  'Aesthetic': { categoryId: 4, categoryName: 'Hypertrophy', goal: 'build-muscle' },
};

const LEVEL_MAP = {
  'Beginner': { levelId: 1, levelName: 'Beginner' },
  'Intermediate': { levelId: 2, levelName: 'Intermediate' },
  'Advanced': { levelId: 3, levelName: 'Advanced' },
};

const FOCUS_MAP = {
  'Hypertrophy': 'build-muscle',
  'Strength': 'strength',
  'Fat Loss': 'lose-fat',
  'Endurance': 'endurance',
  'Athletic': 'performance',
  'Mobility': 'general-fitness',
  'Rehab': 'general-fitness',
  'Powerlifting': 'strength',
  'Bodybuilding': 'build-muscle',
};

const programs = data.programs.map((p) => {
  const cat = CATEGORY_MAP[p.Category] || CATEGORY_MAP['Strength'];
  const lvl = LEVEL_MAP[p.Level] || LEVEL_MAP['Intermediate'];
  const focus = FOCUS_MAP[p.Focus] || 'general-fitness';
  
  return {
    name: p.Name,
    description: p.Description || '',
    tags: [p.Focus.toLowerCase(), p.Split.toLowerCase(), p.Level.toLowerCase()].filter(Boolean),
    goal: focus,
    difficulty: lvl.levelName.toLowerCase(),
    durationWeeks: p.Duration_wk,
    daysPerWeek: p.Frequency,
    sessionDurationMinutes: p.Avg_Time_min,
    categoryId: cat.categoryId,
    levelId: lvl.levelId,
    difficultyRating: p.Level === 'Beginner' ? 4 : p.Level === 'Intermediate' ? 6 : 8,
    trainingSplit: p.Split,
    periodizationPhase: 'General Preparation',
    totalWorkouts: p.Total_Sessions || p.Duration_wk * p.Frequency,
    totalExercises: 12,
    targetAudience: p.Level + ' trainees seeking ' + p.Focus,
    expectedOutcomes: 'Improve ' + p.Focus + ' over ' + p.Duration_wk + ' weeks',
    categoryName: cat.categoryName,
    levelName: lvl.levelName,
    isActive: true,
    isPublic: true,
    authorName: 'AzFIT Team',
  };
});

let tsCode = `/**
 * Canonical Program Templates — Imported from AzFIT_Database_Restructured.xlsx
 * ${programs.length} programs across 6 categories, 3 levels
 */

import type { Program } from '../types/entities'

export const PROGRAM_TEMPLATES: Omit<Program, 'id' | 'timesUsed' | 'lastAssigned' | 'createdAt' | 'updatedAt'>[] = [
`;

programs.forEach((p) => {
  tsCode += `  {
    name: '${p.name.replace(/'/g, "\\'")}',
    description: '${p.description.replace(/'/g, "\\'")}',
    tags: [${p.tags.map(t => `'${t}'`).join(', ')}],
    goal: '${p.goal}',
    difficulty: '${p.difficulty}',
    durationWeeks: ${p.durationWeeks},
    daysPerWeek: ${p.daysPerWeek},
    sessionDurationMinutes: ${p.sessionDurationMinutes},
    categoryId: ${p.categoryId},
    levelId: ${p.levelId},
    difficultyRating: ${p.difficultyRating},
    trainingSplit: '${p.trainingSplit}',
    periodizationPhase: '${p.periodizationPhase}',
    totalWorkouts: ${p.totalWorkouts},
    totalExercises: ${p.totalExercises},
    targetAudience: '${p.targetAudience.replace(/'/g, "\\'")}',
    expectedOutcomes: '${p.expectedOutcomes.replace(/'/g, "\\'")}',
    categoryName: '${p.categoryName}',
    levelName: '${p.levelName}',
    isActive: ${p.isActive},
    isPublic: ${p.isPublic},
    authorName: '${p.authorName}',
  },
`;
});

tsCode += `]
`;

fs.writeFileSync('src/data/programTemplates.ts', tsCode);
console.log('Generated src/data/programTemplates.ts with', programs.length, 'programs');
