/**
 * Unified Entity Types — Single Source of Truth
 *
 * All domain entities are defined here with consistent naming and shapes.
 * These types replace the fragmented Client/Program types scattered across
 * stores and component files.
 */

// ── Shared ─────────────────────────────────────────────────────────

export type EntityStatus = 'active' | 'inactive' | 'on-hold'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'elite'

// ── Client ─────────────────────────────────────────────────────────

export interface Client {
  id: string
  name: string
  email: string
  avatar?: string
  initials: string
  status: EntityStatus
  joinDate: string // ISO date
  lastActive: string // ISO date
  phone?: string

  // Body metrics
  age: number
  weight: number // kg
  height: number // cm
  bodyFat: number // percentage
  goal: string

  // Program tracking
  currentProgramId?: string
  programName: string
  programProgress: number // 0-100
  complianceScore: number // 0-100
  sessionsCompleted: number
}

// ── Program ────────────────────────────────────────────────────────

export interface Program {
  id: string
  name: string
  description: string
  tags: string[]

  // Classification
  goal: string
  difficulty: Difficulty
  durationWeeks: number
  daysPerWeek: number
  sessionDurationMinutes: number
  trainingSplit?: string
  periodizationPhase?: string

  // Optional DB-aligned fields
  categoryId?: number
  levelId?: number
  difficultyRating?: number // 1-10

  // Tracking
  timesUsed: number
  lastAssigned: string | null // ISO date
  createdAt: string
  updatedAt: string
}

// ── Exercise ───────────────────────────────────────────────────────

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  difficulty: Difficulty
  description: string
  videoUrl?: string
}

// ── Calendar Session ───────────────────────────────────────────────

export type SessionType = 'session' | 'assessment' | 'follow-up' | 'personal' | 'group'
export type SessionStatus = 'confirmed' | 'pending' | 'cancelled' | 'in-progress' | 'completed'

export interface CalendarSession {
  id: string
  clientId: string
  clientName: string
  title: string
  date: string // ISO date
  startTime: string // HH:mm
  endTime: string // HH:mm
  type: SessionType
  status: SessionStatus
  notes?: string
  color?: string
}

// ── Client-Program Assignment ──────────────────────────────────────

export type AssignmentStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export interface ClientProgramAssignment {
  id: string
  clientId: string
  programId: string
  startDate: string
  endDate?: string
  status: AssignmentStatus
  currentWeek: number
  currentDay: number
  assignedBy?: string
}

// ── Progress Entry ─────────────────────────────────────────────────

export interface ProgressEntry {
  id: string
  clientId: string
  date: string
  weight?: number
  bodyFat?: number
  measurements?: Record<string, number>
  notes?: string
}

// ── Alert / Follow-up ──────────────────────────────────────────────

export type AlertPriority = 'high' | 'medium' | 'low'

export interface ClientAlert {
  id: string
  clientId: string
  clientName: string
  clientInitials: string
  priority: AlertPriority
  type: string
  message: string
  action: string
  createdAt: string
  resolved?: boolean
}

// ── Notification ───────────────────────────────────────────────────

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  timestamp: number
  clientId?: string
  clientName?: string
}

// ── Reference Data (from workout DB) ───────────────────────────────

export interface WorkoutCategory {
  categoryId: number
  categoryName: string
  description?: string
}

export interface WorkoutLevel {
  levelId: number
  levelName: string
  description?: string
}

export interface TrainingMethod {
  id: string
  name: string
  shortName: string
  description: string
  goals: string[]
  difficulty: Difficulty
  duration: number
  frequency: number
  equipment: string[]
}
