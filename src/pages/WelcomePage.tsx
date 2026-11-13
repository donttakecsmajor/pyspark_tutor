import { Link, useNavigate } from 'react-router-dom'
import { useProgress } from '../store/progressStore'
import { allChapters, chaptersForTrack } from '../lib/curriculumApi'
import { STORAGE_KEY, type UserProgress } from '../types/progress'
import type { TrackId } from '../types/curriculum'
import { WaitlistForm } from '../components/WaitlistForm'

const TRACKS: { id: TrackId; label: string; blurb: string }[] = [
  { id: 'sql', label: 'SQL', blurb: 'Joins, windows, CTEs. Queries run in your browser.' },
  { id: 'pyspark', label: 'PySpark', blurb: 'DataFrames, shuffles, lazy evaluation, tuning.' },
  { id: 'bridge', label: 'Bridge', blurb: 'The same idea in SQL and PySpark, side by side.' },
]

/** First step of a track's first chapter: a no-signup sample lesson. */
function sampleLessonPath(track: TrackId): string | null {
  const chapter = chaptersForTrack(track)[0]
  const step = chapter?.steps[0]
  return chapter && step ? `/lesson/${chapter.id}/${step.id}` : null
}

export function WelcomePage() {
  const navigate = useNavigate()
  const chapters = allChapters()
  const stepCount = chapters.reduce((n, c) => n + c.steps.length, 0)

  function start(track: TrackId) {
    const first = chaptersForTrack(track)[0]
    const cur = useProgress.getState()
    const unlocked = [...new Set([...cur.unlockedChapters, ...(first ? [first.id] : [])])]
    const next: UserProgress = {
      ...cur,
      onboardingDone: true,
      activeTrack: track,
      unlockedChapters: unlocked,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    useProgress.setState(next)
    navigate('/')
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 pt-14 pb-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">SparkFluent</p>
      <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink">
        Learn SQL &amp; PySpark like a language
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
        Short, hands-on steps for data engineers. Build the skills interviews and real pipelines
        ask for, five minutes at a time, on your phone.
      </p>
      <p className="mt-3 text-sm text-ink-muted">
        {chapters.length} chapters · {stepCount} steps · free to try, no account needed.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-ink-muted">Try a lesson now</h2>
      <ul className="mt-3 space-y-3">
        {TRACKS.map((t) => {
          const sample = sampleLessonPath(t.id)
          return (
            <li key={t.id} className="rounded-xl border border-teal-100 bg-white/80 px-4 py-3">
              <p className="font-semibold text-ink">{t.label}</p>
              <p className="mt-0.5 text-sm text-ink-muted">{t.blurb}</p>
              <div className="mt-3 flex gap-2">
                {sample ? (
                  <Link
                    to={sample}
                    className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white"
                  >
                    Try a lesson
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => start(t.id)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                >
                  Start the {t.label} path
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 rounded-xl border border-teal-100 bg-white/80 p-4">
        <WaitlistForm source="welcome" />
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        Progress is saved on this device. Add to your home screen to use it like an app.
      </p>
    </div>
  )
}
