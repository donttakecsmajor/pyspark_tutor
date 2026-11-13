/**
 * Pure helpers for the learning plan and the adaptive placement test.
 * No React, no storage: everything here is unit-tested.
 */
import type { Chapter, PlacementQuestion } from '../types/curriculum'
import type { Experience } from '../types/progress'

export const MINUTES_TO_XP: Record<number, number> = { 5: 15, 10: 30, 15: 45, 20: 60 }

/** Local calendar day, YYYY-MM-DD (not UTC, so "today" matches the learner's clock). */
export function localDayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export interface PlanSummary {
  stepsRemaining: number
  stepsPerDay: number
  daysToFinish: number
  finishDate: Date
}

/** Steps from `startIndex` onward, paced by the daily XP goal (15 XP per step). */
export function computePlan(
  chapters: Pick<Chapter, 'steps'>[],
  startIndex: number,
  dailyGoalXp: number,
  today: Date = new Date(),
  xpPerStep = 15,
): PlanSummary {
  const stepsRemaining = chapters.slice(startIndex).reduce((n, c) => n + c.steps.length, 0)
  const stepsPerDay = Math.max(1, Math.round(dailyGoalXp / xpPerStep))
  const daysToFinish = Math.ceil(stepsRemaining / stepsPerDay)
  const finishDate = new Date(today)
  finishDate.setDate(finishDate.getDate() + daysToFinish)
  return { stepsRemaining, stepsPerDay, daysToFinish, finishDate }
}

export interface UnlockInput {
  unlockedChapters: string[]
  masteredChapters: string[]
  checkpointHistory: Record<string, { passed: boolean }[]>
}

/** A chapter is open when it is first, explicitly unlocked, or the one before it was passed/mastered. */
export function isChapterUnlocked(
  index: number,
  chapters: Pick<Chapter, 'id'>[],
  p: UnlockInput,
): boolean {
  if (index <= 0) return true
  const ch = chapters[index]
  if (!ch) return false
  if (p.unlockedChapters.includes(ch.id) || p.masteredChapters.includes(ch.id)) return true
  const prev = chapters[index - 1]
  if (p.masteredChapters.includes(prev.id)) return true
  return (p.checkpointHistory[prev.id] ?? []).some((a) => a.passed)
}

// ---------- Adaptive placement (staircase) ----------

export interface PlacementState {
  /** Current ability estimate, 1..5. */
  theta: number
  asked: string[]
  /** Correct answers: question id -> difficulty. */
  correct: Record<string, number>
  answered: number
}

export const PLACEMENT_MAX_QUESTIONS = 8
const STEP = 0.7

export function initialTheta(experience: Experience | null): number {
  if (experience === 'new') return 1.5
  if (experience === 'work') return 3.2
  return 2.4
}

export function startPlacement(experience: Experience | null): PlacementState {
  return { theta: initialTheta(experience), asked: [], correct: {}, answered: 0 }
}

/** Unasked question whose difficulty is closest to theta (ties: easier first, then bank order). */
export function pickNextQuestion(
  bank: PlacementQuestion[],
  state: PlacementState,
): PlacementQuestion | undefined {
  const pool = bank.filter((q) => !state.asked.includes(q.id))
  if (!pool.length) return undefined
  return [...pool].sort((a, b) => {
    const da = Math.abs(a.difficulty - state.theta)
    const db = Math.abs(b.difficulty - state.theta)
    return da - db || a.difficulty - b.difficulty
  })[0]
}

export function recordPlacementAnswer(
  state: PlacementState,
  q: PlacementQuestion,
  isCorrect: boolean,
): PlacementState {
  // Harder-than-expected correct answers move you further; missing an easy one costs more.
  const surprise = isCorrect ? Math.max(0.5, q.difficulty - state.theta + 1) : Math.max(0.5, state.theta - q.difficulty + 1)
  const delta = STEP * Math.min(1.6, surprise) * (isCorrect ? 1 : -1)
  return {
    theta: Math.min(5, Math.max(1, state.theta + delta)),
    asked: [...state.asked, q.id],
    correct: isCorrect ? { ...state.correct, [q.id]: q.difficulty } : state.correct,
    answered: state.answered + 1,
  }
}

export function placementFinished(
  state: PlacementState,
  bank: PlacementQuestion[],
): boolean {
  return state.answered >= PLACEMENT_MAX_QUESTIONS || state.asked.length >= bank.length
}

/**
 * Where on the path to start. We only credit a chapter as known when the
 * learner answered one of its hinted questions correctly AND the final ability
 * estimate is at least that question's difficulty, so one lucky guess on a hard
 * item can't skip you ahead. Returns 0 when nothing is proven.
 */
export function recommendedStartIndex(
  state: PlacementState,
  bank: PlacementQuestion[],
  chapters: Pick<Chapter, 'id'>[],
): number {
  let start = 0
  for (const q of bank) {
    const d = state.correct[q.id]
    if (d === undefined || !q.chapterHint) continue
    if (state.theta + 0.01 < d) continue
    const idx = chapters.findIndex((c) => c.id.endsWith(`.${q.chapterHint}`))
    // Knowing a chapter's material means the NEXT chapter is where learning starts.
    if (idx >= 0) start = Math.max(start, Math.min(chapters.length - 1, idx + 1))
  }
  return start
}

export function levelLabel(theta: number): string {
  if (theta < 1.8) return 'Beginner'
  if (theta < 2.8) return 'Building foundations'
  if (theta < 3.8) return 'Intermediate'
  if (theta < 4.5) return 'Advanced'
  return 'Expert'
}
