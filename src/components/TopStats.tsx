import { Flame, Zap } from 'lucide-react'
import { useProgress } from '../store/progressStore'
import { localDayKey } from '../lib/plan'
import { TRACK_COLORS, TRACK_LABELS } from '../lib/theme'
import type { TrackId } from '../types/curriculum'

const TRACKS: TrackId[] = ['sql', 'pyspark', 'bridge']

function GoalRing({ value, goal }: { value: number; goal: number }) {
  const pct = Math.min(1, goal > 0 ? value / goal : 0)
  const r = 13
  const c = 2 * Math.PI * r
  return (
    <div
      className="flex items-center gap-1.5"
      title={`${value} of ${goal} XP today`}
      aria-label={`${value} of ${goal} XP today`}
    >
      <svg width="34" height="34" viewBox="0 0 34 34">
        <circle cx="17" cy="17" r={r} fill="none" stroke="#e3e8f1" strokeWidth="5" />
        <circle
          cx="17"
          cy="17"
          r={r}
          fill="none"
          stroke={pct >= 1 ? '#1fa95b' : '#5b5bf0'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform="rotate(-90 17 17)"
        />
      </svg>
      <span className="text-sm font-extrabold text-ink">
        {value}
        <span className="text-ink-muted">/{goal}</span>
      </span>
    </div>
  )
}

/** Sticky top bar for the home path: track switcher plus streak, XP and today's goal. */
export function TopStats() {
  const { activeTrack, setActiveTrack, streak, xp, dailyXp, dailyGoalXp } = useProgress()
  const today = dailyXp[localDayKey()] ?? 0

  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-white/95 px-4 pt-3 pb-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5" role="tablist" aria-label="Track">
          {TRACKS.map((t) => {
            const active = activeTrack === t
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTrack(t)}
                className="rounded-xl border-2 px-3 py-1.5 text-sm font-extrabold transition"
                style={
                  active
                    ? { background: TRACK_COLORS[t].soft, borderColor: TRACK_COLORS[t].main, color: TRACK_COLORS[t].dark }
                    : { background: '#fff', borderColor: '#e3e8f1', color: '#667289' }
                }
              >
                {TRACK_LABELS[t]}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm font-extrabold text-accent-dark" title="Day streak">
            <Flame className="h-5 w-5 fill-accent text-accent" /> {streak}
          </span>
          <span className="flex items-center gap-1 text-sm font-extrabold text-brand" title="Total XP">
            <Zap className="h-5 w-5 fill-brand text-brand" /> {xp}
          </span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <p className="text-xs font-extrabold tracking-wide text-ink-muted uppercase">Today&apos;s goal</p>
        <GoalRing value={today} goal={dailyGoalXp} />
      </div>
    </header>
  )
}
