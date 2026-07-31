import type { Chapter, TrackId } from '../types/curriculum'

// Populated by data/index — avoid circular imports in helpers used by UI
let _chapters: Chapter[] = []

export function setCurriculum(chapters: Chapter[]) {
  _chapters = chapters
}

export function allChapters(): Chapter[] {
  return _chapters
}

export function chaptersForTrack(track: TrackId): Chapter[] {
  return _chapters.filter((c) => c.track === track)
}

export function getChapter(id: string): Chapter | undefined {
  return _chapters.find((c) => c.id === id)
}

export function getStep(chapterId: string, stepId: string) {
  const ch = getChapter(chapterId)
  return ch?.steps.find((s) => s.id === stepId)
}

export function nextChapterId(chapterId: string): string | undefined {
  const ch = getChapter(chapterId)
  if (!ch) return undefined
  const list = chaptersForTrack(ch.track)
  const idx = list.findIndex((c) => c.id === chapterId)
  return list[idx + 1]?.id
}

export function findExercise(exerciseId: string) {
  for (const ch of _chapters) {
    for (const st of ch.steps) {
      const ex = st.exercises.find((e) => e.id === exerciseId)
      if (ex) return { chapter: ch, step: st, exercise: ex }
    }
    const ex = ch.checkpoint.find((e) => e.id === exerciseId)
    if (ex) return { chapter: ch, step: null, exercise: ex }
  }
  return null
}

export const TRACK_META: Record<
  TrackId,
  { label: string; blurb: string; color: string }
> = {
  sql: {
    label: 'SQL',
    blurb: 'Query fluency for analytics & pipelines',
    color: 'bg-teal-700',
  },
  pyspark: {
    label: 'PySpark',
    blurb: 'DataFrame API & Spark execution mindset',
    color: 'bg-amber-700',
  },
  bridge: {
    label: 'Bridge',
    blurb: 'Translate the same idea SQL ↔ PySpark',
    color: 'bg-slate-700',
  },
}
