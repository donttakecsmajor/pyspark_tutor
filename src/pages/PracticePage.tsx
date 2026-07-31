import { useMemo, useState } from 'react'
import { findExercise } from '../lib/curriculumApi'
import { ExercisePlayer } from '../components/ExercisePlayer'
import { useProgress } from '../store/progressStore'

export function PracticePage() {
  const { reviewQueue, clearReview, bumpReviewFail, addXp } = useProgress()
  const due = useMemo(() => {
    const now = Date.now()
    return [...reviewQueue]
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
      .filter((r) => new Date(r.dueAt).getTime() <= now + 86400000)
  }, [reviewQueue])

  const [activeId, setActiveId] = useState<string | null>(null)
  const found = activeId ? findExercise(activeId) : null

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of reviewQueue) {
      for (const t of r.tags) m.set(t, (m.get(t) ?? 0) + 1)
      if (!r.tags.length) m.set('general', (m.get('general') ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [reviewQueue])

  function onResult(correct: boolean) {
    if (!activeId) return
    if (correct) {
      clearReview(activeId)
      addXp(5)
    } else {
      bumpReviewFail(activeId)
    }
    setActiveId(null)
  }

  if (found?.exercise) {
    return (
      <div className="px-4 pt-6 pb-8">
        <button
          type="button"
          className="mb-4 text-sm text-ink-muted"
          onClick={() => setActiveId(null)}
        >
          ← Back to practice
        </button>
        <ExercisePlayer
          key={found.exercise.id}
          exercise={found.exercise}
          onResult={onResult}
        />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl font-bold">Practice</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Review mistakes at your pace — no timers.
      </p>

      {tagCounts.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tagCounts.map(([tag, n]) => (
            <span
              key={tag}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-muted"
            >
              {tag} · {n}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-2">
        {due.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-teal-300 bg-white/70 p-6 text-center">
            <p className="font-semibold">Queue is clear</p>
            <p className="mt-1 text-sm text-ink-muted">
              Missed items from lessons and checkpoints show up here.
            </p>
          </div>
        ) : (
          due.map((r) => (
            <button
              key={r.exerciseId}
              type="button"
              onClick={() => setActiveId(r.exerciseId)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left"
            >
              <p className="line-clamp-2 text-sm font-semibold">{r.prompt}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {r.track} · fails {r.fails}
                {r.tags.length ? ` · ${r.tags.slice(0, 3).join(', ')}` : ''}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
