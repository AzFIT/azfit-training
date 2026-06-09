export type LeaderboardResultType = 'time' | 'reps' | 'load' | 'rounds'

export interface LeaderboardEntry {
  id: string
  rank: number
  clientId: string
  clientName: string
  clientInitials: string
  avatar?: string
  gender: 'male' | 'female' | 'other'
  resultValue: number
  resultType: LeaderboardResultType
  resultLabel: string
  isRx: boolean
  date: string
  likes: number
  likedByMe: boolean
  prBadges: string[]
}

export interface LeaderboardFilterState {
  rxOnly: 'all' | 'rx' | 'scaled'
  gender: 'all' | 'male' | 'female' | 'other'
  dateRange: 'all' | 'week' | 'month' | 'year'
}
