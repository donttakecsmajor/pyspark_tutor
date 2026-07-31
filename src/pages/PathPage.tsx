import { Link } from 'react-router-dom'
import { Crown, Lock, Star, Check } from 'lucide-react'
import { useProgress } from '../store/progressStore'
import { chaptersForTrack, TRACK_META } from '../lib/curriculumApi'
import type { TrackId } from '../types/curriculum'

const tracks: TrackId[] = ['sql', 'pyspark', 'bridge']

export function PathPage() {
  const {
    activeTrack,
    setActiveTrack,
    completedSteps,
    unlockedChapters,
    chapterCrowns,
    checkpointHistory,
    placementDone,
    ratings,
    xp,
    streak,
  } = useProgress()

  const chapters = chaptersForTrack(activeTrack)
  const firstId = chapters[0]?.id

  function isUnlocked(chapterId: string, index: number) {
    if (unlockedChapters.includes(chapterId)) return true
    if (index === 0) return true
    if (!placementDone[activeTrack] && index === 0) return true
    // unlock sequentially if previous checkpoint passed or all steps done
    const prev = chapters[index - 1]
    if (!prev) return true
    const prevPassed = (checkpointHistory[prev.id] ?? []).some((a) => a.passed)
    if (prevPassed) return true
    // allow first chapter always
    return index === 0 || chapterId === firstId
  }

  function stepStatus(stepId: string, chapterUnlocked: boolean) {
    if (!chapterUnlocked) return 'locked'
    if (completedSteps.includes(stepId)) return 'done'
    return 'available'
  }

  function findCurrentStep(stepIds: string[]) {
    return stepIds.find((id) => !completedSteps.includes(id))
  }

  return (
    <div className="px-4 pt-6 pb-8">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">SparkFluent</p>
        <h1 className="font-display text-3xl font-bold text-ink">Your path</h1>
        <div className="mt-2 flex gap-3 text-sm text-ink-muted">
          <span>{xp} XP</span>
          <span>·</span>
          <span>{streak} day streak</span>
          <span>·</span>
          <span>
            {TRACK_META[activeTrack].label} Lv {ratings[activeTrack].toFixed(1)}
          </span>
        </div>
      </header>

      <div className="mb-6 flex gap-2">
        {tracks.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTrack(t)}
            className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${
              activeTrack === t
                ? 'bg-brand text-white'
                : 'bg-white text-ink-muted border border-slate-200'
            }`}
          >
            {TRACK_META[t].label}
          </button>
        ))}
      </div>

      {!placementDone[activeTrack] ? (
        <Link
          to={`/placement/${activeTrack}`}
          className="mb-6 flex items-center justify-between rounded-2xl border border-amber-200 bg-accent-soft px-4 py-3"
        >
          <div>
            <p className="font-semibold text-ink">Placement (untimed)</p>
            <p className="text-sm text-ink-muted">Set your starting level for this track</p>
          </div>
          <Star className="h-5 w-5 text-accent" />
        </Link>
      ) : null}

      <div className="relative mx-auto flex max-w-sm flex-col items-center gap-0">
        {chapters.map((ch, ci) => {
          const unlocked = isUnlocked(ch.id, ci)
          const crowns = chapterCrowns[ch.id] ?? 0
          const passed = (checkpointHistory[ch.id] ?? []).some((a) => a.passed)
          const allStepsDone = ch.steps.every((s) => completedSteps.includes(s.id))
          const currentStepId = findCurrentStep(ch.steps.map((s) => s.id))

          return (
            <div key={ch.id} className="flex w-full flex-col items-center">
              {ci > 0 ? <div className="h-6 w-1 bg-path-done/40" /> : null}

              <div className="mb-2 w-full text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Chapter {ci + 1}
                </p>
                <h2 className="font-display text-lg font-bold">{ch.title}</h2>
              </div>

              {ch.steps.map((st, si) => {
                const status = stepStatus(st.id, unlocked)
                const isCurrent = unlocked && st.id === currentStepId
                const done = completedSteps.includes(st.id)

                return (
                  <div key={st.id} className="flex flex-col items-center">
                    {si > 0 || true ? (
                      <div
                        className={`h-5 w-1 ${done || isCurrent ? 'bg-path-done' : 'bg-path-lock'}`}
                      />
                    ) : null}
                    {status === 'locked' ? (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                        <Lock className="h-5 w-5" />
                      </div>
                    ) : (
                      <Link
                        to={`/lesson/${ch.id}/${st.id}`}
                        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition ${
                          done
                            ? 'bg-path-done text-white'
                            : isCurrent
                              ? 'bg-accent text-white ring-4 ring-amber-200'
                              : 'bg-white text-brand border-2 border-brand'
                        }`}
                      >
                        {done ? <Check className="h-6 w-6" /> : <span className="font-bold">{si + 1}</span>}
                      </Link>
                    )}
                    <p className="mt-1 mb-1 max-w-[10rem] text-center text-xs text-ink-muted">
                      {st.title}
                    </p>
                  </div>
                )
              })}

              <div className="mt-2 flex flex-col items-center">
                <div className="h-5 w-1 bg-path-done/40" />
                {unlocked && allStepsDone ? (
                  <Link
                    to={`/checkpoint/${ch.id}`}
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                      passed ? 'bg-brand text-white' : 'bg-slate-800 text-amber-300'
                    }`}
                  >
                    <Crown className="h-7 w-7" />
                  </Link>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
                    <Lock className="h-6 w-6" />
                  </div>
                )}
                <p className="mt-1 text-xs font-medium text-ink-muted">
                  Checkpoint{crowns > 0 ? ` · ${crowns}/5 crowns` : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
