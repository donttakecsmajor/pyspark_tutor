import { create } from 'zustand'
import {
  createDefaultProgress,
  STORAGE_KEY,
  type CheckpointAttempt,
  type ReviewItem,
  type UserProgress,
} from '../types/progress'
import type { TrackId } from '../types/curriculum'
import { localDayKey } from '../lib/plan'
import { chaptersForTrack } from '../lib/curriculumApi'

function todayKey(): string {
  return localDayKey()
}

function load(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultProgress()
    const parsed = JSON.parse(raw) as UserProgress
    if (parsed.version !== 1) return createDefaultProgress()
    return { ...createDefaultProgress(), ...parsed }
  } catch {
    return createDefaultProgress()
  }
}

function persist(state: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

interface ProgressStore extends UserProgress {
  hydrate: () => void
  setActiveTrack: (track: TrackId) => void
  completeOnboarding: () => void
  finishPlacement: (track: TrackId, rating: number, unlockChapterIds: string[]) => void
  completeStep: (stepId: string, chapterId: string, xp: number) => void
  recordCheckpoint: (
    chapterId: string,
    score: number,
    passed: boolean,
    nextChapterId?: string,
  ) => void
  addReview: (item: Omit<ReviewItem, 'fails' | 'dueAt'> & { fails?: number }) => void
  clearReview: (exerciseId: string) => void
  bumpReviewFail: (exerciseId: string) => void
  toggleBookmark: (stepId: string) => void
  setNote: (stepId: string, note: string) => void
  addXp: (amount: number) => void
  touchStreak: () => void
  exportJson: () => string
  importJson: (json: string) => boolean
  resetAll: () => void
  /** Finish onboarding: place the learner at `startIndex` and mark earlier chapters mastered. */
  startPlan: (opts: {
    track: TrackId
    startIndex: number
    rating: number
    dailyGoalXp: number
    experience: UserProgress['experience']
  }) => void
  /** Passed a test-out checkpoint: mark the chapter mastered and open the next one. */
  markMastered: (chapterId: string, nextChapterId?: string) => void
  setDailyGoal: (xp: number) => void
}

function gainXp(cur: UserProgress, amount: number): Pick<UserProgress, 'xp' | 'dailyXp'> {
  const day = todayKey()
  return {
    xp: cur.xp + amount,
    dailyXp: { ...cur.dailyXp, [day]: (cur.dailyXp[day] ?? 0) + amount },
  }
}

function withUpdate(p: UserProgress): UserProgress {
  return { ...p, updatedAt: new Date().toISOString() }
}

export const useProgress = create<ProgressStore>((set, get) => ({
  ...load(),

  hydrate: () => set({ ...load() }),

  setActiveTrack: (track) => {
    const next = withUpdate({ ...get(), activeTrack: track })
    persist(next)
    set(next)
  },

  completeOnboarding: () => {
    const next = withUpdate({ ...get(), onboardingDone: true })
    persist(next)
    set(next)
  },

  finishPlacement: (track, rating, unlockChapterIds) => {
    const cur = get()
    const unlocked = new Set([...cur.unlockedChapters, ...unlockChapterIds])
    const next = withUpdate({
      ...cur,
      ratings: { ...cur.ratings, [track]: rating },
      placementDone: { ...cur.placementDone, [track]: true },
      unlockedChapters: [...unlocked],
      activeTrack: track,
    })
    persist(next)
    set(next)
  },

  completeStep: (stepId, chapterId, xp) => {
    const cur = get()
    if (cur.completedSteps.includes(stepId)) {
      get().touchStreak()
      return
    }
    const unlocked = new Set(cur.unlockedChapters)
    unlocked.add(chapterId)
    const next = withUpdate({
      ...cur,
      completedSteps: [...cur.completedSteps, stepId],
      ...gainXp(cur, xp),
      unlockedChapters: [...unlocked],
    })
    persist(next)
    set(next)
    get().touchStreak()
  },

  recordCheckpoint: (chapterId, score, passed, nextChapterId) => {
    const cur = get()
    const attempt: CheckpointAttempt = {
      score,
      passed,
      at: new Date().toISOString(),
    }
    const history = {
      ...cur.checkpointHistory,
      [chapterId]: [...(cur.checkpointHistory[chapterId] ?? []), attempt],
    }
    let crowns = { ...cur.chapterCrowns }
    let ratings = { ...cur.ratings }
    const unlocked = new Set(cur.unlockedChapters)

    if (passed) {
      const prev = crowns[chapterId] ?? 0
      const gain =
        score >= 100 ? 5 : score >= 90 ? 4 : score >= 80 ? 3 : score >= 70 ? 2 : 1
      crowns[chapterId] = Math.max(prev, Math.min(5, gain))
      if (nextChapterId) unlocked.add(nextChapterId)

      const track = chapterId.split('.')[0] as TrackId
      if (track in ratings) {
        ratings[track] = Math.min(5, Math.round((ratings[track] + score / 100) * 10) / 10)
      }
    }

    const next = withUpdate({
      ...cur,
      checkpointHistory: history,
      chapterCrowns: crowns,
      ratings,
      unlockedChapters: [...unlocked],
      ...gainXp(cur, passed ? 40 : 10),
    })
    persist(next)
    set(next)
    get().touchStreak()
  },

  addReview: (item) => {
    const cur = get()
    const existing = cur.reviewQueue.find((r) => r.exerciseId === item.exerciseId)
    const due = new Date()
    due.setDate(due.getDate() + 1)
    let reviewQueue: ReviewItem[]
    if (existing) {
      reviewQueue = cur.reviewQueue.map((r) =>
        r.exerciseId === item.exerciseId
          ? { ...r, fails: r.fails + 1, dueAt: due.toISOString() }
          : r,
      )
    } else {
      reviewQueue = [
        ...cur.reviewQueue,
        {
          ...item,
          fails: item.fails ?? 1,
          dueAt: due.toISOString(),
        },
      ]
    }
    const next = withUpdate({ ...cur, reviewQueue })
    persist(next)
    set(next)
  },

  clearReview: (exerciseId) => {
    const cur = get()
    const next = withUpdate({
      ...cur,
      reviewQueue: cur.reviewQueue.filter((r) => r.exerciseId !== exerciseId),
    })
    persist(next)
    set(next)
  },

  bumpReviewFail: (exerciseId) => {
    const due = new Date()
    due.setDate(due.getDate() + 1)
    const cur = get()
    const next = withUpdate({
      ...cur,
      reviewQueue: cur.reviewQueue.map((r) =>
        r.exerciseId === exerciseId
          ? { ...r, fails: r.fails + 1, dueAt: due.toISOString() }
          : r,
      ),
    })
    persist(next)
    set(next)
  },

  toggleBookmark: (stepId) => {
    const cur = get()
    const bookmarks = cur.bookmarks.includes(stepId)
      ? cur.bookmarks.filter((b) => b !== stepId)
      : [...cur.bookmarks, stepId]
    const next = withUpdate({ ...cur, bookmarks })
    persist(next)
    set(next)
  },

  setNote: (stepId, note) => {
    const cur = get()
    const notes = { ...cur.notes, [stepId]: note }
    const next = withUpdate({ ...cur, notes })
    persist(next)
    set(next)
  },

  addXp: (amount) => {
    const cur = get()
    const next = withUpdate({ ...cur, ...gainXp(cur, amount) })
    persist(next)
    set(next)
  },

  touchStreak: () => {
    const cur = get()
    const today = todayKey()
    if (cur.lastActiveDate === today) return
    let streak = 1
    if (cur.lastActiveDate) {
      const prev = new Date(cur.lastActiveDate + 'T12:00:00')
      const now = new Date(today + 'T12:00:00')
      const diff = Math.round((now.getTime() - prev.getTime()) / 86400000)
      streak = diff === 1 ? cur.streak + 1 : 1
    }
    const next = withUpdate({ ...cur, streak, lastActiveDate: today })
    persist(next)
    set(next)
  },

  exportJson: () => JSON.stringify(get(), null, 2),

  importJson: (json) => {
    try {
      const parsed = JSON.parse(json) as UserProgress
      if (parsed.version !== 1) return false
      const next = withUpdate({ ...createDefaultProgress(), ...parsed, version: 1 })
      persist(next)
      set(next)
      return true
    } catch {
      return false
    }
  },

  resetAll: () => {
    const next = createDefaultProgress()
    persist(next)
    set(next)
  },

  startPlan: ({ track, startIndex, rating, dailyGoalXp, experience }) => {
    const cur = get()
    const chapters = chaptersForTrack(track)
    const mastered = new Set(cur.masteredChapters)
    const unlocked = new Set(cur.unlockedChapters)
    chapters.slice(0, startIndex).forEach((c) => {
      mastered.add(c.id)
      unlocked.add(c.id)
    })
    if (chapters[startIndex]) unlocked.add(chapters[startIndex].id)
    const next = withUpdate({
      ...cur,
      onboardingDone: true,
      activeTrack: track,
      experience,
      dailyGoalXp,
      ratings: { ...cur.ratings, [track]: rating },
      placementDone: { ...cur.placementDone, [track]: true },
      masteredChapters: [...mastered],
      unlockedChapters: [...unlocked],
    })
    persist(next)
    set(next)
  },

  markMastered: (chapterId, nextChapterId) => {
    const cur = get()
    const unlocked = new Set(cur.unlockedChapters)
    unlocked.add(chapterId)
    if (nextChapterId) unlocked.add(nextChapterId)
    const next = withUpdate({
      ...cur,
      masteredChapters: [...new Set([...cur.masteredChapters, chapterId])],
      unlockedChapters: [...unlocked],
    })
    persist(next)
    set(next)
  },

  setDailyGoal: (xp) => {
    const next = withUpdate({ ...get(), dailyGoalXp: xp })
    persist(next)
    set(next)
  },
}))
