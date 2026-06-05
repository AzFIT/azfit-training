/**
 * AzFIT Progress Photos — Demo Data
 * ============================================================
 * Realistic demo dataset showing Alex Wong's 3-month transformation
 * journey.  Weight: 78 kg → 72 kg, Body fat: 22 % → 15 %.
 *
 * Display dates: DD/MM/YYYY  |  Storage dates: YYYY-MM-DD
 */

import type { ProgressPhoto } from './types';

/** Demo client identifier — matches the mock user record. */
export const demoClientId = 'client_001';

/** Demo client display name. */
export const demoClientName = 'Alex Wong';

/**
 * Full set of demo progress photos spanning January → April 2026.
 * Shows realistic fitness progression with weight and body-fat improvements.
 */
export const demoPhotos: ProgressPhoto[] = [
  {
    id: 'photo_001_start',
    clientId: demoClientId,
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&h=1600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop&q=60',
    date: '2026-01-15',
    category: 'Front',
    notes: 'Starting point — ready to begin the journey!',
    weight: 78.0,
    bodyFatPercentage: 22.0,
    trainerNotes: 'Baseline assessment completed. Focus areas: core strength, body composition.',
    isMilestone: true,
    isGoalAchieved: false,
    createdAt: '2026-01-15T09:30:00.000Z',
    updatedAt: '2026-01-15T09:30:00.000Z',
  },
  {
    id: 'photo_002_back',
    clientId: demoClientId,
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=1600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&q=60',
    date: '2026-01-15',
    category: 'Back',
    notes: 'Back view — baseline posture check.',
    weight: 78.0,
    bodyFatPercentage: 22.0,
    trainerNotes: 'Slight forward shoulder roll noted. Programming posture corrective work.',
    isMilestone: false,
    isGoalAchieved: false,
    createdAt: '2026-01-15T09:35:00.000Z',
    updatedAt: '2026-01-15T09:35:00.000Z',
  },
  {
    id: 'photo_003_side',
    clientId: demoClientId,
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=1600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop&q=60',
    date: '2026-01-29',
    category: 'Side',
    notes: '2 weeks in — feeling stronger already.',
    weight: 77.2,
    bodyFatPercentage: 21.0,
    trainerNotes: 'Good early compliance. Weight down 0.8 kg. Increase protein intake advised.',
    isMilestone: false,
    isGoalAchieved: false,
    createdAt: '2026-01-29T10:00:00.000Z',
    updatedAt: '2026-01-29T10:00:00.000Z',
  },
  {
    id: 'photo_004_front',
    clientId: demoClientId,
    url: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=1200&h=1600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&h=400&fit=crop&q=60',
    date: '2026-02-15',
    category: 'Front',
    notes: '1 month milestone — seeing visible changes!',
    weight: 76.0,
    bodyFatPercentage: 19.5,
    trainerNotes: 'Visible abdominal definition emerging. Progressive overload working well.',
    isMilestone: true,
    isGoalAchieved: false,
    createdAt: '2026-02-15T09:30:00.000Z',
    updatedAt: '2026-02-15T09:30:00.000Z',
  },
  {
    id: 'photo_005_back',
    clientId: demoClientId,
    url: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&h=1600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=400&fit=crop&q=60',
    date: '2026-02-15',
    category: 'Back',
    notes: 'Back progress — posture improving noticeably.',
    weight: 76.0,
    bodyFatPercentage: 19.5,
    trainerNotes: 'Shoulder roll significantly improved. Trap activation much better.',
    isMilestone: false,
    isGoalAchieved: false,
    createdAt: '2026-02-15T09:35:00.000Z',
    updatedAt: '2026-02-15T09:35:00.000Z',
  },
  {
    id: 'photo_006_side',
    clientId: demoClientId,
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&h=1600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop&q=60',
    date: '2026-03-15',
    category: 'Side',
    notes: '2 months — core definition really coming through.',
    weight: 74.0,
    bodyFatPercentage: 17.0,
    trainerNotes: 'Excellent mid-section transformation. Added HIIT 2x/week showing results.',
    isMilestone: false,
    isGoalAchieved: false,
    createdAt: '2026-03-15T10:00:00.000Z',
    updatedAt: '2026-03-15T10:00:00.000Z',
  },
  {
    id: 'photo_007_front',
    clientId: demoClientId,
    url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1200&h=1600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=400&fit=crop&q=60',
    date: '2026-03-15',
    category: 'Front',
    notes: 'Front view at 2 months — very happy with the progress.',
    weight: 74.0,
    bodyFatPercentage: 17.0,
    trainerNotes: 'Client very motivated. Vascularity improved. Maintain current program.',
    isMilestone: false,
    isGoalAchieved: false,
    createdAt: '2026-03-15T10:05:00.000Z',
    updatedAt: '2026-03-15T10:05:00.000Z',
  },
  {
    id: 'photo_008_final',
    clientId: demoClientId,
    url: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=1200&h=1600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=400&h=400&fit=crop&q=60',
    date: '2026-04-15',
    category: 'Front',
    notes: 'Goal achieved! 6kg down and feeling amazing.',
    weight: 72.0,
    bodyFatPercentage: 15.0,
    trainerNotes: 'Target achieved 1 month ahead of schedule! Body recomposition excellent. Consider maintenance phase.',
    isMilestone: true,
    isGoalAchieved: true,
    createdAt: '2026-04-15T09:30:00.000Z',
    updatedAt: '2026-04-15T09:30:00.000Z',
  },
];
