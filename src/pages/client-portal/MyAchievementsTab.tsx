import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Dumbbell, Target, Zap, Medal, Star, Crown } from 'lucide-react'
import { useAppDataStore } from '../../stores/useAppDataStore'

interface MyAchievementsTabProps {
  clientId: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: typeof Trophy
  unlocked: boolean
  unlockedAt?: string
  color: string
  bgColor: string
}

export default function MyAchievementsTab({ clientId }: MyAchievementsTabProps) {
  const workoutSessions = useAppDataStore((s) => s.workoutSessions)
  const bodyStatsEntries = useAppDataStore((s) => s.bodyStatsEntries)
  const nutritionEntries = useAppDataStore((s) => s.nutritionEntries)

  // Get client's workout history
  const clientWorkouts = useMemo(() => {
    return Object.values(workoutSessions)
      .filter((ws) => ws.clientId === clientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [workoutSessions, clientId])

  // Check for PRs (personal records)
  const hasPR = useMemo(() => {
    return clientWorkouts.some((ws) =>
      ws.exercises.some((ex) => ex.sets.some((s) => s.actualLoad && s.actualLoad > (s.prescribedLoad ?? 0)))
    )
  }, [clientWorkouts])

  // Check for 10+ sessions
  const hasTenSessions = clientWorkouts.length >= 10

  // Check for first workout
  const hasFirstWorkout = clientWorkouts.length >= 1

  // Check for 7-day streak (consecutive days with workouts)
  const hasSevenDayStreak = useMemo(() => {
    if (clientWorkouts.length < 7) return false
    const dates = clientWorkouts.map((w) => w.date)
    const uniqueDates = [...new Set(dates)].sort()
    let maxStreak = 1
    let currentStreak = 1
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1])
      const curr = new Date(uniqueDates[i])
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }
    return maxStreak >= 7
  }, [clientWorkouts])

  // Check for nutrition logging
  const hasNutritionLog = useMemo(() => {
    return Object.values(nutritionEntries).some((e) => e.clientId === clientId)
  }, [nutritionEntries, clientId])

  // Check for body stats tracking
  const hasBodyStats = useMemo(() => {
    return Object.values(bodyStatsEntries).some((e) => e.clientId === clientId)
  }, [bodyStatsEntries, clientId])

  // Get best PR info
  const bestPR = useMemo(() => {
    let maxLoad = 0
    let exerciseName = ''
    for (const ws of clientWorkouts) {
      for (const ex of ws.exercises) {
        for (const set of ex.sets) {
          if (set.actualLoad && set.actualLoad > maxLoad) {
            maxLoad = set.actualLoad
            exerciseName = ex.exerciseName
          }
        }
      }
    }
    return { maxLoad, exerciseName }
  }, [clientWorkouts])

  const achievements: Achievement[] = [
    {
      id: 'first-workout',
      title: 'First Workout',
      description: 'Complete your first training session',
      icon: Dumbbell,
      unlocked: hasFirstWorkout,
      unlockedAt: clientWorkouts[0]?.date,
      color: 'text-cyan',
      bgColor: 'bg-cyan/10',
    },
    {
      id: 'ten-sessions',
      title: '10 Sessions',
      description: 'Complete 10 training sessions',
      icon: Trophy,
      unlocked: hasTenSessions,
      unlockedAt: clientWorkouts[9]?.date,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      id: 'personal-record',
      title: bestPR.maxLoad > 0 ? `${bestPR.exerciseName} PR: ${bestPR.maxLoad}kg` : 'Personal Record',
      description: bestPR.maxLoad > 0 ? `Lifted ${bestPR.maxLoad}kg on ${bestPR.exerciseName}` : 'Beat your prescribed weight on any exercise',
      icon: Zap,
      unlocked: hasPR || bestPR.maxLoad > 0,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      id: 'seven-day-streak',
      title: '7-Day Streak',
      description: 'Work out 7 days in a row',
      icon: Flame,
      unlocked: hasSevenDayStreak,
      color: 'text-danger',
      bgColor: 'bg-danger/10',
    },
    {
      id: 'nutrition-tracker',
      title: 'Nutrition Tracker',
      description: 'Log your first nutrition entry',
      icon: Target,
      unlocked: hasNutritionLog,
      color: 'text-cyan',
      bgColor: 'bg-cyan/10',
    },
    {
      id: 'body-stats',
      title: 'Body Stats Logged',
      description: 'Have your body stats recorded',
      icon: Star,
      unlocked: hasBodyStats,
      color: 'text-violet',
      bgColor: 'bg-violet/10',
    },
    {
      id: 'dedicated',
      title: 'Dedicated',
      description: 'Complete 25 training sessions',
      icon: Medal,
      unlocked: clientWorkouts.length >= 25,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      id: 'champion',
      title: 'Champion',
      description: 'Complete 50 training sessions',
      icon: Crown,
      unlocked: clientWorkouts.length >= 50,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ]

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-az-black-card border border-dark-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={18} className="text-cyan" />
          <span className="text-sm font-medium text-cyan">My Achievements</span>
        </div>
        <h2 className="text-xl font-semibold text-dark-primary">Trophy Case</h2>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-3 bg-dark-hover rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyan rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <span className="text-sm text-dark-secondary font-medium">
            {unlockedCount} / {totalCount}
          </span>
        </div>
      </motion.div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative bg-az-black-card border rounded-xl p-5 transition-all ${
              achievement.unlocked
                ? 'border-dark-border'
                : 'border-dark-border/50 opacity-60'
            }`}
          >
            {achievement.unlocked && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                  <Star size={14} className="text-success" />
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${achievement.bgColor} flex items-center justify-center flex-shrink-0`}
              >
                <achievement.icon size={24} className={achievement.color} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-dark-primary">{achievement.title}</h3>
                <p className="text-sm text-dark-secondary mt-1">{achievement.description}</p>
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-dark-muted mt-2">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-az-black-card border border-dark-border rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-dark-primary mb-4">Your Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan">{clientWorkouts.length}</p>
            <p className="text-sm text-dark-secondary">Workouts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{unlockedCount}</p>
            <p className="text-sm text-dark-secondary">Achievements</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{bestPR.maxLoad > 0 ? `${bestPR.maxLoad}kg` : '-'}</p>
            <p className="text-sm text-dark-secondary">Best Lift</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger">
              {Object.values(bodyStatsEntries).filter((e) => e.clientId === clientId).length}
            </p>
            <p className="text-sm text-dark-secondary">Stats Logged</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
