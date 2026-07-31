import type { TrackId } from './curriculum'

export interface CheckpointAttempt {
  score: number
  passed: boolean
  at: string
}

export interface ReviewItem {
  exerciseId: string
  track: TrackId
  chapterId: string
  prompt: string
  tags: string[]
  fails: number
  dueAt: string
}

export interface UserProgress {
  version: 1
  onboardingDone: boolean
  activeTrack: TrackId
  ratings: Record<TrackId, number>
  placementDone: Record<TrackId, boolean>
  xp: number
  streak: number
  lastActiveDate: string | null
  completedSteps: string[]
  chapterCrowns: Record<string, number>
  checkpointHistory: Record<string, CheckpointAttempt[]>
  unlockedChapters: string[]
  reviewQueue: ReviewItem[]
  bookmarks: string[]
  notes: Record<string, string>
  createdAt: string
  updatedAt: string
}

export const STORAGE_KEY = 'sparkfluent-progress-v1'

export function createDefaultProgress(): UserProgress {
  const now = new Date().toISOString()
  return {
    version: 1,
    onboardingDone: false,
    activeTrack: 'sql',
    ratings: { sql: 1, pyspark: 1, bridge: 1 },
    placementDone: { sql: false, pyspark: false, bridge: false },
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    completedSteps: [],
    chapterCrowns: {},
    checkpointHistory: {},
    unlockedChapters: [],
    reviewQueue: [],
    bookmarks: [],
    notes: {},
    createdAt: now,
    updatedAt: now,
  }
}
