import {
  Dumbbell,
  Flame,
  Zap,
  Wind,
  HeartPulse,
  Activity,
} from 'lucide-react'

export const STEP_NAMES = ['Goal', 'Method', 'Context', 'Phases', 'Split', 'Exercises', 'Preview', 'Save']

export const GOAL_CARDS = [
  {
    id: 'muscle',
    label: 'Muscle Gain',
    description: 'Build lean muscle mass with hypertrophy-focused programming',
    icon: Dumbbell,
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    methods: ['Upper/Lower', 'PPL', 'Bro Split', 'GVT'],
  },
  {
    id: 'fat-loss',
    label: 'Fat Loss',
    description: 'Maximize calorie burn while preserving muscle',
    icon: Flame,
    gradient: 'linear-gradient(135deg, #F97316, #EA580C)',
    methods: ['Circuit Training', 'HIIT', 'GBC', 'Full Body'],
  },
  {
    id: 'strength',
    label: 'Strength',
    description: 'Build maximal strength with low-rep, high-intensity work',
    icon: Zap,
    gradient: 'linear-gradient(135deg, #00AEEF, #0077B6)',
    methods: ['5x5', '5/3/1', 'Westside', 'Upper/Lower'],
  },
  {
    id: 'endurance',
    label: 'Endurance',
    description: 'Improve cardiovascular and muscular endurance',
    icon: Wind,
    gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
    methods: ['HIIT', 'Circuit', 'Conditioning'],
  },
  {
    id: 'rehab',
    label: 'Rehabilitation',
    description: 'Recovery-focused programming for injury rehab',
    icon: HeartPulse,
    gradient: 'linear-gradient(135deg, #EAB308, #CA8A04)',
    methods: ['Isolation Work', 'Low Impact', 'Mobility'],
  },
  {
    id: 'general',
    label: 'General Fitness',
    description: 'Balanced fitness for overall health and wellness',
    icon: Activity,
    gradient: 'linear-gradient(135deg, #C0C0C0, #9CA3AF)',
    methods: ['Full Body', 'Circuit', 'Mixed'],
  },
]

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite']

export const SESSION_DURATIONS = ['30 min', '45 min', '60 min', '90 min']

export const LIMITATION_OPTIONS = ['Lower Back', 'Shoulder', 'Knee', 'Hip', 'Wrist', 'Neck', 'None']

export const EQUIPMENT_OPTIONS = ['Full Gym', 'Dumbbells Only', 'Bodyweight', 'Home Gym', 'Cable Machines']

export const PHASE_FOCUSES = ['Volume', 'Intensity', 'Technique', 'Deload', 'Peak']

export const VOLUME_OPTIONS = ['Low', 'Moderate', 'High', 'Very High']

export const DAY_FOCUS_OPTIONS = [
  'Upper Body',
  'Lower Body',
  'Push (Chest/Shoulders/Triceps)',
  'Pull (Back/Biceps)',
  'Legs (Quads/Hams/Glutes)',
  'Full Body',
  'HIIT / Cardio',
  'Rest',
  'Arms',
  'Shoulders',
  'Back',
  'Chest',
]

export const FOCUS_MUSCLE_MAP: Record<string, string[]> = {
  'Upper Body': ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Chest/Triceps', 'Back/Biceps'],
  'Lower Body': ['Quads', 'Hamstrings', 'Glutes', 'Quads/Glutes', 'Hamstrings/Glutes', 'Calves', 'Legs'],
  'Push (Chest/Shoulders/Triceps)': ['Chest', 'Shoulders', 'Triceps', 'Chest/Triceps'],
  'Pull (Back/Biceps)': ['Back', 'Biceps', 'Back/Biceps'],
  'Legs (Quads/Hams/Glutes)': ['Quads', 'Hamstrings', 'Glutes', 'Quads/Glutes', 'Hamstrings/Glutes', 'Calves'],
  'Full Body': ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes'],
  'Arms': ['Biceps', 'Triceps'],
  'Shoulders': ['Shoulders'],
  'Back': ['Back', 'Back/Biceps'],
  'Chest': ['Chest', 'Chest/Triceps'],
}
