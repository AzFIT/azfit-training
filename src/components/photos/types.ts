export type PhotoCategory = 'Front' | 'Back' | 'Side' | 'Other'

export interface ProgressPhoto {
  id: string
  clientId: string
  url: string
  thumbnailUrl: string
  date: string
  category: PhotoCategory
  notes?: string
  weight?: number
  bodyFatPercentage?: number
  trainerNotes?: string
  isMilestone?: boolean
  isGoalAchieved?: boolean
  createdAt: string
  updatedAt: string
}

export interface UploadFile {
  id: string
  file: File
  preview: string
  category: PhotoCategory
  date: string
  weight: string
  bodyFat: string
  notes: string
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
}

export const demoPhotos: ProgressPhoto[] = [
  {
    id: '1', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    date: '2026-01-15', category: 'Front',
    weight: 78.0, bodyFatPercentage: 22.0,
    notes: 'Starting point', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80',
    date: '2026-01-29', category: 'Back',
    weight: 77.2, bodyFatPercentage: 21.5,
    notes: '', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-01-29T10:00:00Z', updatedAt: '2026-01-29T10:00:00Z',
  },
  {
    id: '3', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80',
    date: '2026-02-12', category: 'Side',
    weight: 76.5, bodyFatPercentage: 20.8,
    notes: '2 weeks progress', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-02-12T10:00:00Z', updatedAt: '2026-02-12T10:00:00Z',
  },
  {
    id: '4', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
    date: '2026-02-26', category: 'Front',
    weight: 75.8, bodyFatPercentage: 20.0,
    notes: 'Visible changes', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-02-26T10:00:00Z', updatedAt: '2026-02-26T10:00:00Z',
  },
  {
    id: '5', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
    date: '2026-03-11', category: 'Back',
    weight: 75.0, bodyFatPercentage: 19.2,
    notes: '', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-03-11T10:00:00Z', updatedAt: '2026-03-11T10:00:00Z',
  },
  {
    id: '6', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
    date: '2026-03-25', category: 'Side',
    weight: 74.2, bodyFatPercentage: 18.5,
    notes: 'Month 2 check-in', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-03-25T10:00:00Z', updatedAt: '2026-03-25T10:00:00Z',
  },
  {
    id: '7', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80',
    date: '2026-04-08', category: 'Front',
    weight: 73.0, bodyFatPercentage: 17.0,
    notes: 'Almost there', trainerNotes: '',
    isMilestone: false, isGoalAchieved: false,
    createdAt: '2026-04-08T10:00:00Z', updatedAt: '2026-04-08T10:00:00Z',
  },
  {
    id: '8', clientId: 'sarah-johnson',
    url: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=400&q=80',
    date: '2026-04-15', category: 'Front',
    weight: 72.0, bodyFatPercentage: 15.0,
    notes: 'Goal achieved!', trainerNotes: 'Amazing transformation! Client hit all targets.',
    isMilestone: true, isGoalAchieved: true,
    createdAt: '2026-04-15T10:00:00Z', updatedAt: '2026-04-15T10:00:00Z',
  },
]

export const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]
