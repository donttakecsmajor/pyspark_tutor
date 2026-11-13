import { describe, expect, it } from 'vitest'
import type { PlacementQuestion } from '../types/curriculum'
import {
  MINUTES_TO_XP,
  computePlan,
  initialTheta,
  isChapterUnlocked,
  localDayKey,
  pickNextQuestion,
  placementFinished,
  recommendedStartIndex,
  recordPlacementAnswer,
  startPlacement,
} from './plan'

const mcqStub = {
  id: 'x',
  type: 'mcq' as const,
  prompt: '',
  choices: [] as string[],
  answerIndex: 0,
  explanation: '',
}

function bank(): PlacementQuestion[] {
  const hints = ['a', 'b', 'c', 'd', 'e']
  return [1, 1, 2, 2, 3, 3, 4, 4, 5, 5].map((d, i) => ({
    id: `q${i}`,
    track: 'sql',
    difficulty: d as 1 | 2 | 3 | 4 | 5,
    chapterHint: hints[d - 1],
    exercise: { ...mcqStub, id: `e${i}` },
  }))
}

const chapters = ['a', 'b', 'c', 'd', 'e', 'f'].map((s) => ({ id: `sql.${s}`, steps: [1, 2, 3].map((n) => ({ id: `${s}${n}` })) }))

describe('localDayKey', () => {
  it('uses the local calendar day, zero-padded', () => {
    expect(localDayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})

describe('computePlan', () => {
  it('paces remaining steps by the daily goal', () => {
    const p = computePlan(chapters as never, 0, MINUTES_TO_XP[10], new Date(2026, 0, 1))
    expect(p.stepsRemaining).toBe(18)
    expect(p.stepsPerDay).toBe(2)
    expect(p.daysToFinish).toBe(9)
    expect(localDayKey(p.finishDate)).toBe('2026-01-10')
  })

  it('counts only from the start chapter onward', () => {
    expect(computePlan(chapters as never, 4, 15).stepsRemaining).toBe(6)
  })

  it('never divides by zero for a tiny goal', () => {
    expect(computePlan(chapters as never, 0, 0).stepsPerDay).toBe(1)
  })
})

describe('isChapterUnlocked', () => {
  const none = { unlockedChapters: [], masteredChapters: [], checkpointHistory: {} }
  it('always opens the first chapter', () => {
    expect(isChapterUnlocked(0, chapters, none)).toBe(true)
  })
  it('keeps later chapters locked by default', () => {
    expect(isChapterUnlocked(2, chapters, none)).toBe(false)
  })
  it('opens a chapter once the previous checkpoint was passed', () => {
    const p = { ...none, checkpointHistory: { 'sql.a': [{ passed: false }, { passed: true }] } }
    expect(isChapterUnlocked(1, chapters, p)).toBe(true)
  })
  it('opens a chapter after the previous one is mastered', () => {
    expect(isChapterUnlocked(3, chapters, { ...none, masteredChapters: ['sql.c'] })).toBe(true)
  })
  it('opens explicitly unlocked chapters', () => {
    expect(isChapterUnlocked(4, chapters, { ...none, unlockedChapters: ['sql.e'] })).toBe(true)
  })
})

describe('adaptive placement', () => {
  it('starts easier for beginners and harder for people who use it at work', () => {
    expect(initialTheta('new')).toBeLessThan(initialTheta('some'))
    expect(initialTheta('some')).toBeLessThan(initialTheta('work'))
  })

  it('asks near the current estimate and never repeats a question', () => {
    let s = startPlacement('some')
    const seen = new Set<string>()
    for (let i = 0; i < 8; i++) {
      const q = pickNextQuestion(bank(), s)!
      expect(seen.has(q.id)).toBe(false)
      seen.add(q.id)
      s = recordPlacementAnswer(s, q, true)
    }
    expect(seen.size).toBe(8)
  })

  it('climbs when everything is right and falls when everything is wrong', () => {
    let up = startPlacement('some')
    let down = startPlacement('some')
    for (let i = 0; i < 6; i++) {
      up = recordPlacementAnswer(up, pickNextQuestion(bank(), up)!, true)
      down = recordPlacementAnswer(down, pickNextQuestion(bank(), down)!, false)
    }
    expect(up.theta).toBeGreaterThan(4)
    expect(down.theta).toBeLessThan(1.5)
    expect(up.theta).toBeLessThanOrEqual(5)
    expect(down.theta).toBeGreaterThanOrEqual(1)
  })

  it('serves a harder question after a correct answer', () => {
    let s = startPlacement('some')
    const first = pickNextQuestion(bank(), s)!
    s = recordPlacementAnswer(s, first, true)
    expect(pickNextQuestion(bank(), s)!.difficulty).toBeGreaterThanOrEqual(first.difficulty)
  })

  it('stops after 8 questions, or when the bank runs out', () => {
    let s = startPlacement('some')
    for (let i = 0; i < 8; i++) s = recordPlacementAnswer(s, pickNextQuestion(bank(), s)!, i % 2 === 0)
    expect(placementFinished(s, bank())).toBe(true)
    const small = bank().slice(0, 3)
    let t = startPlacement('some')
    for (let i = 0; i < 3; i++) t = recordPlacementAnswer(t, pickNextQuestion(small, t)!, true)
    expect(placementFinished(t, small)).toBe(true)
  })

  it('starts at chapter 0 when nothing is proven', () => {
    let s = startPlacement('some')
    for (let i = 0; i < 6; i++) s = recordPlacementAnswer(s, pickNextQuestion(bank(), s)!, false)
    expect(recommendedStartIndex(s, bank(), chapters)).toBe(0)
  })

  it('moves the start past chapters the learner proved they know', () => {
    let s = startPlacement('work')
    for (let i = 0; i < 8; i++) s = recordPlacementAnswer(s, pickNextQuestion(bank(), s)!, true)
    expect(recommendedStartIndex(s, bank(), chapters)).toBeGreaterThanOrEqual(3)
  })

  it('does not let one lucky hard answer skip the path', () => {
    // wrong on everything easy, then a single correct hard question at the end
    let s = startPlacement('new')
    const easy = bank().filter((q) => q.difficulty <= 2)
    for (const q of easy) s = recordPlacementAnswer(s, q, false)
    const hard = bank().find((q) => q.difficulty === 5)!
    s = recordPlacementAnswer(s, hard, true)
    expect(recommendedStartIndex(s, bank(), chapters)).toBe(0)
  })
})
