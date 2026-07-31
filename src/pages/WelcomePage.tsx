import { useNavigate } from 'react-router-dom'
import { useProgress } from '../store/progressStore'
import { chaptersForTrack } from '../lib/curriculumApi'
import { STORAGE_KEY } from '../types/progress'

export function WelcomePage() {
  const navigate = useNavigate()

  function start(track: 'sql' | 'pyspark' | 'bridge') {
    const first = chaptersForTrack(track)[0]
    const cur = useProgress.getState()
    const unlocked = [...new Set([...cur.unlockedChapters, ...(first ? [first.id] : [])])]
    const next = {
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
    <div className="flex min-h-dvh flex-col px-6 pt-16 pb-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">SparkFluent</p>
      <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink">
        Learn SQL & PySpark like a language
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
        A Duolingo-style path for data engineers: short steps, interactive drills, untimed
        chapter checkpoints. Progress stays on this device — add to your phone home screen.
      </p>

      <ul className="mt-8 space-y-3 text-sm text-ink">
        <li className="rounded-xl border border-teal-100 bg-white/80 px-4 py-3">
          Path of chapters → steps → checkpoint
        </li>
        <li className="rounded-xl border border-teal-100 bg-white/80 px-4 py-3">
          SQL runs in-browser · PySpark pattern drills
        </li>
        <li className="rounded-xl border border-teal-100 bg-white/80 px-4 py-3">
          Mistake review, glossary, export/import backup
        </li>
      </ul>

      <div className="mt-auto flex flex-col gap-2 pt-10">
        <p className="mb-1 text-sm font-semibold text-ink-muted">Start with</p>
        <button
          type="button"
          onClick={() => start('sql')}
          className="rounded-xl bg-brand py-3.5 font-semibold text-white"
        >
          SQL
        </button>
        <button
          type="button"
          onClick={() => start('pyspark')}
          className="rounded-xl bg-amber-700 py-3.5 font-semibold text-white"
        >
          PySpark
        </button>
        <button
          type="button"
          onClick={() => start('bridge')}
          className="rounded-xl border border-slate-300 bg-white py-3.5 font-semibold"
        >
          Bridge (SQL ↔ PySpark)
        </button>
      </div>
    </div>
  )
}
